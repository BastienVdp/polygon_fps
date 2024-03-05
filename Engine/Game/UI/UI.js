import Blocker from "./Components/Blocker";

/**
 * UI class
 * @class UI
 * @description A class that represents the UI for the game
 */
export default class UI 
{
	constructor()
	{
		this.initialize();
	}

	initialize()
	{
		console.log('UI class initialized!');

		this.createBlocker();
	}

	createBlocker()
	{
		this.blocker = new Blocker();
	}
}