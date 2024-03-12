import Engine from '@/Engine';

import Stats from 'three/examples/jsm/libs/stats.module';

import { EngineEventPipe, PointLockEvent } from '@Pipes/EngineEventPipe';
import { PointLockEventEnum } from '@Enums/EventsEnum';

import Blocker from "./Components/Blocker";
import HUD from './Components/HUD';
import InGameMenu from './Components/InGameMenu';
import Lobby from './Components/Lobby';

/**
 * UI class
 * @class UI
 * @description A class that represents the UI for the game
 */
export default class UI 
{
	static instance;
	constructor()
	{
		if (UI.instance) 
		{
			return UI.instance;
		}
		UI.instance = this;
		
		this.engine = new Engine();
		
		this.element = document.querySelector('.ui');
		this.initialize();
	}

	initialize()
	{
		this.show();

		this.createLobby();
		// this.createStats();

		this.createInGameMenu();
		// this.createBlocker();
		this.createHUD();
	}

	createLobby()
	{
		this.lobby = new Lobby();
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

	createInGameMenu()
	{
		this.inGameMenu = new InGameMenu();
	}
	
	createHUD()
	{
		this.hud = new HUD();
	}

	show()
	{
		this.element.classList.remove('not-visible');
	}

	hide()
	{
		this.element.classList.add('not-visible');
	}

	update()
	{
		this.stats.update();
	}
}