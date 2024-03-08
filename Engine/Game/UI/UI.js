import Stats from 'three/examples/jsm/libs/stats.module';

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
		this.createStats();

		this.createBlocker();
	}

	createStats()
	{
		this.stats = new Stats();
		document.body.appendChild(this.stats.dom);
	}

	createBlocker()
	{
		this.blocker = new Blocker();
	}

	update()
	{
		this.stats.update();
	}
}