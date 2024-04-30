import Component from "@Core/Component";
import Engine from "@/Engine";

import { PointLockEvent, EngineEventPipe } from '@Pipes/EngineEventPipe';
import { AnimationEventPipe, FirstPersonAnimationEvent } from '@Pipes/AnimationEventPipe';
import { GameEventPipe, WeaponFireEvent } from '@Pipes/GameEventPipe';
import { PointLockEventEnum } from '@Enums/EventsEnum';
import { WeaponAnimationEventEnum } from '@Enums/EventsEnum';

/**
 * @class HUD
 * @description A class to manage the HUD UI
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

	/**
	 * @method registerEvents
	 * @description Register the events
	 * @listens PointLockEvent
	 * @listens FirstPersonAnimationEvent
	 * @listens WeaponFireEvent
	 * @returns {void}
	 */
	registerEvents()
	{
		EngineEventPipe.addEventListener(PointLockEvent.type, (e) => this.handlePointerLockChange(e));
		AnimationEventPipe.addEventListener(FirstPersonAnimationEvent.type, (e) => this.handleSwitchWeapon(e));
		GameEventPipe.addEventListener(WeaponFireEvent.type, (e) => this.handleFireWeapon(e));
	}

	/**
	 * @method handleSwitchWeapon
	 * @description Handle the switch weapon event
	 * @param {FirstPersonAnimationEvent} e - The event with the weapon data
	 * @returns {void}
	 */
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

	/**
	 * @method handleFireWeapon
	 * @description Handle the fire weapon event
	 * @param {WeaponFireEvent} e - The event with the weapon data
	 * @returns {void}
	 */
	handleFireWeapon(e)
	{
		this.elements.bulletCount.innerHTML = e.detail.params.bulletCount - 1;
	}


	/**
	 * @method handlePointerLockChange
	 * @description Handle the pointer lock change event
	 * @param {PointLockEvent} e - The event 
	 */
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
		this.element.classList.remove('not-visible');
	}

	hide()
	{
		this.element.classList.add('not-visible');
	}
}