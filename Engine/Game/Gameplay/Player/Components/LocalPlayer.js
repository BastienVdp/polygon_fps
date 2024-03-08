import * as THREE from "three";
import { Capsule } from "three/examples/jsm/math/Capsule";

import Engine from "@/Engine";

import FirstPersonControls from "./FirstPersonControls";
import FirstPersonCamera from "./FirstPersonCamera";
import FirstPersonView from "./FirstPersonView";
import InputManager from "@Game/Managers/InputManager";

/**
 * LocalPlayer class
 * @class LocalPlayer
 * @description Represents the local player in the game environment.
 */
export default class LocalPlayer 
{
	/**
	 * Constructor
	 * @constructor
	 * @param {Object} state - The network state of the player.
	 * @param {THREE.Object3D} container - The container for the player's components.
	 * @param {Object} instance - The instance associated with the player.
	 */
	constructor({ state, container, instance })
	{		
		this.engine = new Engine();
		this.scene = this.engine.scenes.level;

		this.id = state.id;
		this.state = state;
		this.container = container;
		this.instance = instance;

		this.initialize();
	}

	/**
	 * Initialize the local player
	 * @method initialize
	 * @description Initializes the player, first-person view, camera, and controls.
	 */
	initialize()
	{
		this.initializePlayer();
		
		this.initializeFirstPersonView();
		this.initializeFirstPersonCamera();
		this.initializeFirstPersonControls();
	}

	/**
     * Initialize the player
     * @method initializePlayer
     * @description Sets up the basic properties of the player, including the container, camera, collider, velocity, direction, onFloor, and animation.
     */
	initializePlayer()
	{
		this.player = {
			container: this.container,
            camera: this.engine.cameras.playerCamera,
            collider: new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1.45, 0), 0.35),
            velocity: new THREE.Vector3(),
            direction: new THREE.Vector3(),
            onFloor: false,
			animation: "IDLE"
        };
	}

	/**
	 * Initialize the first-person view
	 * @method initializeFirstPersonView
	 * @description Creates and initializes the first-person view for the local player.
	 */
	initializeFirstPersonView()
	{
		this.firstPersonView = new FirstPersonView();
	}

	/**
	 * Initialize the first-person camera
	 * @method initializeFirstPersonCamera
	 * @description Creates and initializes the first-person camera for the local player.
	 */
	initializeFirstPersonCamera()
	{
		this.camera = new FirstPersonCamera();
	}

	/**
	 * Initialize the first-person controls
	 * @method initializeFirstPersonControls
	 * @description Creates and initializes the first-person controls for the local player.
	 */
	initializeFirstPersonControls()
	{
		this.inputManager = new InputManager();
		this.controls = new FirstPersonControls({ player: this.player });
	}

	/**
     * Update method
     * @method update
     * @description Updates the first-person controls for the local player.
     */
	update()
	{
		this.controls.update();
	}	
}