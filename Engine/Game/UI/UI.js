import Engine from '@/Engine';

import Stats from 'three/examples/jsm/libs/stats.module';

import { EngineEventPipe, PointLockEvent } from '@Pipes/EngineEventPipe';
import { PointLockEventEnum } from '@Enums/EventsEnum';

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
		this.engine = new Engine();
		
		this.element = document.querySelector('.ui');

		this.initialize();
	}

	initialize()
	{
		this.show();

		this.element.addEventListener('click', () => {
			if(!this.engine.pointLock.isLocked) this.engine.pointLock.lock();
		});
		
		EngineEventPipe.addEventListener(PointLockEvent.type, (e) => this.handlePointerLockChange(e));

		this.createStats();

		this.createBlocker();
	}

	handlePointerLockChange(e)
	{
		switch (e.detail.enum) {
			case PointLockEventEnum.LOCK: 
				this.hide();
				break;
			case PointLockEventEnum.UNLOCK:
				this.show();
				break;
		}
	}

	show()
	{
		this.element.classList.remove('not-visible');
	}

	hide()
	{
		this.element.classList.add('not-visible');
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