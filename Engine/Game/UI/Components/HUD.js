import Component from "@Core/Component";
import Engine from "@/Engine";

import { PointLockEvent, EngineEventPipe } from '@Pipes/EngineEventPipe';
import { AnimationEventPipe, FirstPersonAnimationEvent } from '@Pipes/AnimationEventPipe';
import { GameEventPipe, WeaponFireEvent } from '@Pipes/GameEventPipe';
import { PointLockEventEnum } from '@Enums/EventsEnum';
import { WeaponAnimationEventEnum } from '@Enums/EventsEnum';
/**
 * Blocker class
 * @class Blocker
 * @description A class that represents the blocker for the pointer lock
 * @extends Component
 */
export default class HUD extends Component
{
	constructor() 
	{
		super({
			element: '.player',
			elements: {
				bulletCount: '.weapon__bullet__count',
				bulletMax: '.weapon__bullet__max',
				currentWeapon: '.weapon',
				nextWeapon: '.weapon__next',
				healthBar: '.player__health__bar'
			}
		});

		this.engine = new Engine();

		this.initialize();
	}

	initialize()
	{		
		this.registerEvents();
	}

	registerEvents()
	{
		EngineEventPipe.addEventListener(PointLockEvent.type, (e) => this.handlePointerLockChange(e));
		AnimationEventPipe.addEventListener(FirstPersonAnimationEvent.type, (e) => this.handleSwitchWeapon(e));
		GameEventPipe.addEventListener(WeaponFireEvent.type, (e) => this.handleFireWeapon(e));
	}

	handleSwitchWeapon(e)
	{
		if(e.detail.enum === WeaponAnimationEventEnum.DRAW)
		{
			this.elements.currentWeapon.innerHTML = e.detail.weapon.name;
			this.elements.bulletCount.innerHTML = e.detail.weapon.bulletLeft;
			this.elements.bulletMax.innerHTML = e.detail.weapon.bulletLeftMax;
		}

		if(e.detail.enum === WeaponAnimationEventEnum.REMOVE)
		{
			this.elements.nextWeapon.innerHTML = e.detail.weapon.name;
		}

		if(e.detail.enum === WeaponAnimationEventEnum.RELOAD)
		{
			this.elements.bulletCount.innerHTML = e.detail.weapon.magazineSize;
			this.elements.bulletMax.innerHTML = e.detail.weapon.bulletLeftMax;
		}
	}

	handleFireWeapon(e)
	{
		this.elements.bulletCount.innerHTML = e.detail.params.bulletCount - 1;
	}

	handlePointerLockChange(e)
	{
		switch (e.detail.enum) {
			case PointLockEventEnum.LOCK: 
				this.show();
				break;
			case PointLockEventEnum.UNLOCK:
				this.hide();
				break;
		}
	}
	
	show()
	{
		console.log('show')
		this.element.classList.remove('not-visible');
	}

	hide()
	{
		console.log('hide')
		this.element.classList.add('not-visible');
	}
}