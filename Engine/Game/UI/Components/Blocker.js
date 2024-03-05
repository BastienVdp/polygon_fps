import Component from "@Core/Component";
import Engine from "@/index";

import { PointLockEventEnum } from '@Enums/EventsEnum';
import { PointLockEvent, EngineEventPipe } from '@Pipelines/EngineEventPipe';

/**
 * Blocker class
 * @class Blocker
 * @description A class that represents the blocker for the pointer lock
 * @extends Component
 */
export default class Blocker extends Component
{
	constructor() 
	{
		super({
			element: '#blocker',
			elements: {
				'instructions': '#blocker__instructions',
			}
		});

		this.engine = new Engine();

		this.initialize();
	}

	initialize()
	{
		this.engine.pointLock.pointLockListen();

		this.element.addEventListener('click', () => {
			if(!this.engine.pointLock.isLocked) this.engine.pointLock.lock();
		});
		
		EngineEventPipe.addEventListener(PointLockEvent.type, (e) => this.handlePointerLockChange(e));
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
		console.log('hide');
		this.element.classList.add('not-visible');
	}
}