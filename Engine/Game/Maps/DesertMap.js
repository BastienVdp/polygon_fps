import { EquirectangularReflectionMapping, LinearFilter, AmbientLight, DirectionalLight } from 'three';

import Map from '@Core/Map';
// import Skybox from '@Game/Gameplay/Sky/Skybox';

/**
 * DesertMap class
 * @class DesertMap
 * @description A class that represents the desert map and extends the Map class.
 * @extends Map
 */

export default class DesertMap extends Map 
{
	constructor()
	{
		super();

		this.settings = {
			collider: false,
			directionalLight: {
				intensity: 2.5,
				color: 0xdab99a
			},
			ambiantLight: {
				intensity: 0.5,
				color: 0xffcfcf
			}
		};

		if(this.engine.debug) {
			this.folder = this.engine.debug.addFolder({ title: 'Desert Map', expanded: false });
		}

		this.initialize();
	}

	/**
     * Initialize the desert map
     * @method initialize
     * @description Initializes the desert map by setting up the scene, materials, collider, environment, and skybox.
     */
	initialize()
	{
		this.scene = this.engine.resources.get('map').scene;
		this.engine.scenes.level.add(this.scene);

		this.setMaterials();
		this.setCollider();
		this.setEnvironment();

		// this.setSky();
		if(this.folder) {
			this.setDebug();
		}
	}

	/**
	 * Set materials for meshes in the scene
	 * @method setMaterial
	 * @description Sets the materials for meshes in the scene, configuring environment mapping, metalness, and roughness.
	 */
	setMaterials()
	{
		this.scene.traverse((child) => {
			if(child.isMesh)
			{
				child.visible = !this.settings.collider;
				child.material.envMap = this.environment;
				child.material.needsUpdate = true;
				child.material.metalness = 0.0;
				child.material.roughness = 1.0;
				// child.material.wireframe = true;
			}
		});
	}
	
	/**
     * Set the skybox
     * @method setSky
     * @description Sets up the skybox for the desert map.
     */
	setSky()
	{
		this.skybox = new Skybox();
	}

	/**
     * Set the collider for the map
     * @method setCollider
     * @description Sets the collider for the map based on the scene's object with the name "collider".
     */
	setCollider()
	{
		this.collider = this.scene.getObjectByName("collider");
		// this.collider.visible = this.settings.collider;
		this.scene.remove(this.collider);
		this.engine.octree.fromGraphNode(this.collider);
	}

	/**
     * Set the environment map and lighting
     * @method setEnvironment
     * @description Sets the environment map, mapping type, and filter for the desert map.
     */
	setEnvironment()
	{
		this.environment = this.engine.resources.get('sunset');
		this.environment.mapping = EquirectangularReflectionMapping;
		this.environment.magFilter = LinearFilter;
		this.engine.scenes.level.environment = this.environment;
		this.engine.scenes.player.environment = this.environment;
		
		this.ambiantLight = new AmbientLight(this.settings.ambiantLight.color, this.settings.ambiantLight.intensity);
		this.engine.scenes.level.add(this.ambiantLight);

		this.directionalLight = new DirectionalLight(this.settings.directionalLight.color, this.settings.directionalLight.intensity);
		this.directionalLight.position.set(0, 10, 10);
		this.engine.scenes.level.add(this.directionalLight);
	}

	setDebug()
	{
		this.folder.addBinding(this.settings, 'collider').on('change', ({ value }) => {
			this.collider.visible = value;
			this.scene.traverse((child) => {
				if(child.isMesh && child.name !== "collider")
				{
					child.visible = !value;
				}
			});
		});

		
		this.subfolder = this.engine.debug.addFolder({ title: 'Lights', expanded: false });

		this.subfolder.addBinding(this.settings.directionalLight, 'intensity', {
			label: 'Directional Intensity',
			min: 0,
			max: 5,
			step: 0.1
		}).on('change', ({ value }) => {
			this.directionalLight.intensity = value;
		});

		this.subfolder.addBinding(this.settings.directionalLight, 'color', {
			label: 'Directional Color',
			view: 'color'
		}).on('change', ({ value }) => {
			this.directionalLight.color.set(value);
		});

		this.subfolder.addBinding(this.settings.ambiantLight, 'intensity', {
			label: 'Ambiant Intensity',
			min: 0,
			max: 2,
			step: 0.1
		}).on('change', ({ value }) => {
			this.ambiantLight.intensity = value;
		});

		this.subfolder.addBinding(this.settings.ambiantLight, 'color', {
			label: 'Ambiant Color',
			view: 'color'
		}).on('change', ({ value }) => {
			this.ambiantLight.color.set(value);
		});

	}
}