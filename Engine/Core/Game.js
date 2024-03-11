import UI from "@Game/UI/UI";

import DesertMap from "@Game/Maps/DesertMap";
import Player from "@Game/Gameplay/Player/Player";
import FirstPersonLayer from "../Game/Layers/FirstPersonLayer";
import SkyLayer from "../Game/Layers/SkyLayer";

/**
 * Game class
 * @class Game
 * @description A class that represents the game
 */
export default class Game 
{
	constructor()
	{
		this.initialize();
	}

	/**
	 * Initialize the game
	 * @method initialize
	 * @description Initializes the game by setting up the layers, map, player, and UI.
	 */
	initialize()
	{
		this.setLayers();
		this.ui = new UI();

		this.desertMap = new DesertMap();
		this.player = new Player();
	}

	/**
	 * Set layers
	 * @method setLayers
	 * @description Sets the layers for the game.
	 */
	setLayers()
	{
		this.firstPersonLayer = new FirstPersonLayer();
		this.skyLayer = new SkyLayer();
	}

	/**
	 * Update the game
	 * @method update
	 * @description Updates the game by updating the player and UI.
	 */
	update() 
	{
		this.player.update();
		this.ui.update();
	}
}