import * as THREE from 'three';
import Engine from "@/Engine";

/**
 * FirstPersonView class
 * @class FirstPersonView
 * @description Represents the first-person view in the game environment.
 */
export default class FirstPersonView
{
	/**
	 * Constructor
	 * @constructor
	 * @description Creates a new instance of the first-person view.
	 */
	constructor()
	{
		this.engine = new Engine();
		this.scene = this.engine.scenes.player;

		this.initialize();
	}
	
	/**
	 * Initialize the first-person view
	 * @method initialize
	 * @description Initializes the first-person camera and lights.
	 */
	initialize()
	{
		this.initCamera();
	}

 	/**
     * Initialize the camera
     * @method initCamera
     * @description Sets up the first-person camera with specific configurations.
     */
	initCamera()
	{
		this.camera = this.engine.cameras.firstPersonCamera;
		this.camera.clearViewOffset();
		this.camera.scale.z = 1.2;
		this.camera.position.y = .2;
		this.camera.position.x = -.6;
        this.camera.rotation.y = Math.PI;
	}
}