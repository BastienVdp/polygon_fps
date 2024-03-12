import * as THREE from "three";

import Engine from "@/Engine";
import LocalPlayer from "./Components/LocalPlayer";

/**
 * Player class
 * @class Player
 * @description A class that represents the player
 */
export default class Player
{
	static _instance;
	/**
	 * Constructor
	 * @constructor
	 * @description Create a new player
	 * @param {Object} state - The network state of the player
	 */
	constructor(state)
	{
		if (Player._instance) {
			return Player._instance;
		}
		Player._instance = this;
		
		this.id = state.id;
		this.state = state;

		// this.isLocalPlayer = myPlayer().id === this.id;

		this.engine = new Engine();

		this.settings = {
			bottomOffset: 0.35,
			totalHeight: 1.45
		};

		this.container = new THREE.Object3D();
		this.container.name = 'PlayerContainer';
		this.engine.scenes.level.add(this.container);

		this.health = 100;

		this.initialize();
	}

	/**
	 * Initialize the player
	 * @method initialize
	 * @description Initialize the player and create the local or remote player based on the network state.
	 */
	initialize()
	{
		this.localPlayer = new LocalPlayer({ 
			state: this.state, 
			container: this.container,
			instance: this
		});
		// if(this.isLocalPlayer) {
		// 	console.log('I am the local player!', this.id)
		// 	this.localPlayer = new LocalPlayer({ 
		// 		state: this.state, 
		// 		container: this.container,
		// 		instance: this
		// 	});
		// } else {
		// 	console.log('I am the remote player!', this.id)
		// 	this.remotePlayer = new RemotePlayer({ 
		// 		state: this.state, 
		// 		container: this.container,
		// 		instance: this
		// 	});
		// }
	}

	/**
	 * Update method
	 * @method update
	 * @description Updates the player, including any relevant components.
	 */
	update()
	{
		if(this.localPlayer) this.localPlayer.update();
	}
}