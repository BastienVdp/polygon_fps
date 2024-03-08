import UI from "@Game/UI/UI";
import MiniMap from "@Game/Maps/MiniMap";

import { MapsEnum } from "@Config/Enums/MapsEnum";
import DesertMap from "@Game/Maps/DesertMap";
import Player from "@Game/Gameplay/Player/Player";

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

	initialize()
	{
		this.desertMap = new DesertMap();
		
		this.player = new Player();

		this.ui = new UI();
	}

	createMap(map)
	{
		switch(map)
		{
			case MapsEnum.MINI:
				return new MiniMap();
		}
	}

	update() 
	{
		this.player.update();
		this.ui.update();
	}
}