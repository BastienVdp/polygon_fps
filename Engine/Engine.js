import { Scene, PerspectiveCamera, Color } from "three";
import { Octree } from 'three/examples/jsm/math/Octree';

import Renderer from "@Core/Renderer";
import Resources from "@Core/Resources";
import PointLock from "@Core/PointLock";
import Game from "@Core/Game";

import Sizes from "@Utils/Sizes";
import Time from "@Utils/Time";
import { LoadingEnum } from "@Config/Enums/LoadingEnum";

import { 
	EngineEventPipe, 
	LoadingEvent, 
	ResizeEvent 
} from "@Pipelines/EngineEventPipe";

/**
 * Engine class
 * @class Engine
 * @description A class that represents the engine of the game
 */
export default class Engine 
{
	static instance;

	constructor() 
	{
		if (Engine.instance) 
		{
			return Engine.instance;
		}
		Engine.instance = this;


		this.octree = new Octree();

		this.canvas = document.querySelector('#game');
	}

	/**
	 * Start the engine
	 * @method start
	 * @description Initialize the engine and start the game loop
	 */
	start()
	{
		this.initialize();

		this.update();
	}

	/**
	 * Initialize the engine
	 * @method initialize
	 * @description Initialize the utils class and create the scenes, cameras, renderer and register events
     */
	initialize()
	{
		this.resources = new Resources();
		this.sizes = new Sizes();
		this.time = new Time();

		this.createScenes();
		this.createCameras();

		this.renderer = new Renderer();
		this.pointLock = new PointLock();

		this.registerEvents();
	}

	createScenes()
	{
		this.scenes = {
			level: new Scene(),
			player: new Scene(),
			skybox: new Scene(),
		};

	}

	createCameras()
	{
		this.cameras = {
			playerCamera: new PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.1, 1000),
			firstPersonCamera: new PerspectiveCamera(50, this.sizes.width / this.sizes.height, 0.01, 100),
		};
	}

	createGame()
	{
		this.game = new Game();
	}

	/**
	 * Register events
	 * @method registerEvents
	 * @description Register the events for the engine
	 */
	registerEvents()
	{
		EngineEventPipe.addEventListener(LoadingEvent.type, this.onLoading);
		EngineEventPipe.addEventListener(ResizeEvent.type, this.onResize);
	}

	/**
	 * On loading event
	 * @method onLoading
	 * @description The event that is called when the assets are loading
	 * @param {Event} e - The event
	 */
	onLoading = (e) =>
	{
		switch(e.detail.enum) {
			case LoadingEnum.SINGLE:
				console.log(e.detail.progress, 'progress');
				break;
			case LoadingEnum.COMPLETE:
				this.createGame();
				break;
		}
	}

	/**
	 * On resize event
	 * @method onResize
	 * @description The event that is called when the window is resized
	 * @param {Event} e - The event
	 */
	onResize = (e) =>
	{
		console.log('resize', e.detail.width, e.detail.height);
		Object.values(this.cameras).forEach(camera => {
			camera.aspect = e.detail.width / e.detail.height;
			camera.updateProjectionMatrix();
		});

		if(this.renderer) this.renderer.resize();
	}

	update()
	{
		if(this.time) {
			this.time.update();
		}
		
		if(this.game) {
			this.game.update();
		}

		if(this.renderer) {
			this.renderer.update();
		}

		window.requestAnimationFrame(this.update.bind(this));
	}	
}