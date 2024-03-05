import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import { CubeTextureLoader } from 'three/src/loaders/CubeTextureLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

import { EngineEventPipe, LoadingEvent } from '@Pipelines/EngineEventPipe';
import { LoadingEnum } from '@Config/Enums/LoadingEnum';

/**
 * Loader class
 * @class Loader
 * @description Class that handles the loading of assets for the game
 */
export default class Loader
{
	constructor()
	{
		this.toLoad = 0;
        this.loaded = 0;

		this.setLoaders();
	}

	/**
	 * Set the loaders
	 * @method setLoaders
	 * @description Create the loaders for the assets
	 */
	setLoaders()
	{
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath('assets/draco/')
		const gltfLoader = new GLTFLoader();
		const fbxLoader = new FBXLoader();
		const textureLoader = new TextureLoader();
		const cubeLoader = new CubeTextureLoader();
		const rgbeloader = new RGBELoader();
	
		gltfLoader.setDRACOLoader(dracoLoader);

		this.loaders = [];

		// HDR
		this.loaders.push({
			type: ['hdr'],
			action: (resource) =>
            {
                rgbeloader.loadAsync(resource.source).then((data) => {
					this.onLoadSingle(resource, data);
				});
            }
		});

		// GLTF
		this.loaders.push({
			type: ['glb', 'gltf'],
			action: (resource) =>
            {
                gltfLoader.loadAsync(resource.source).then((data) => {
					this.onLoadSingle(resource, data);
				});
            }
		});

		this.loaders.push({
			type: ['fbx'],
			action: (resource) =>
            {
                fbxLoader.loadAsync(resource.source).then((data) => {
					this.onLoadSingle(resource, data);
				});
            }
		});
		
		this.loaders.push({
			type: ['png', 'jpg', 'jpeg'],
			action: (resource) => 
			{
				textureLoader.loadAsync(resource.source).then((data) => {
					this.onLoadSingle(resource, data);
				});
			}
		})

		this.loaders.push({
			type: ['cube'],
			action: (resource) => 
			{
				cubeLoader.loadAsync(resource.source).then((data) => {
					this.onLoadSingle(resource, data);
				});
			}
		})

	}

	/**
	 * Load the resources
	 * @method load
	 * @description Load the resources
	 * @param {Array} resources - The resources to load
	 */
	load(resources)
	{
		Object.values(resources).forEach(resourceList => {
			resourceList.forEach((resource) => {
				this.toLoad++;
			
				const fileExtension = resource.source.split('.').pop().toLowerCase();
			
				if (fileExtension) {
					const loader = this.loaders.find((loader) => loader.type.includes(fileExtension));
					if (loader) {
						loader.action(resource);
					} else {
						console.warn(`No loader found for file extension '${fileExtension}'`);
					}
				} else {
					console.warn(`No file extension found in '${resource.source}'`);
				}
			});
		});
	}

	/**
	 * On load single
	 * @method onLoadSingle
	 * @description The event that is called when a single asset is loaded
	 * @param {Object} resource - The resource
	 * @param {Object} data - The data
	 * @emits LoadingEvent
	 */
	onLoadSingle(resource, data)
	{
		this.loaded++;
		LoadingEvent.detail.enum = LoadingEnum.SINGLE;
		LoadingEvent.detail.progress = this.loaded / this.toLoad;
		LoadingEvent.detail.resource = {resource, data};
		EngineEventPipe.dispatchEvent(LoadingEvent);

		if(this.loaded === this.toLoad) 
		{
			this.onLoadComplete();
		}
	}

	/**
	 * On load complete
	 * @method onLoadComplete
	 * @description The event that is called when all assets are loaded
	 * @emits LoadingEvent
	 */
	onLoadComplete()
	{
		LoadingEvent.detail.enum = LoadingEnum.COMPLETE;
		EngineEventPipe.dispatchEvent(LoadingEvent);
	}
}