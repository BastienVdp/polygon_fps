import UI from "@Game/UI/UI";

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
		console.log('Game class initialized!');

		this.ui = new UI();
	}

	update() {}
}