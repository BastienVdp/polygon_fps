import Engine from '@/Engine';

import Stats from 'three/examples/jsm/libs/stats.module';

import { EngineEventPipe, PointLockEvent } from '@Pipes/EngineEventPipe';
import { PointLockEventEnum } from '@Enums/EventsEnum';

import Blocker from "./Components/Blocker";
import HUD from './Components/HUD';

/**
 * UI class
 * @class UI
 * @description A class that represents the UI for the game
 */
export default class UI 
{
	constructor()
	{
		this.engine = new Engine();
		
		this.element = document.querySelector('.ui');

		this.initialize();
	}

	initialize()
	{
		this.show();

		this.createStats();

		this.createBlocker();
		this.createHUD();
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