import Component from '@Core/Component.js';
import { throttle } from '@Utils/Utils';
import Player from '../../Game/Gameplay/Player/Player';
import InventoryManager from '../../Game/Managers/InventoryManager';
import { InventoryEnum } from '@Enums/InventoryEnum';
import M416 from '../../Game/Gameplay/Weapons/M416';
import AWP from '../../Game/Gameplay/Weapons/AWP';
import Glock from '../../Game/Gameplay/Weapons/Glock';
import UI from '../UI';
import Engine from '../../Engine';
import { EngineEventPipe, PointLockEvent } from '../../Pipes/EngineEventPipe';
export default class Armory extends Component
{
	constructor()
	{
		super({
			element: '.menu-in-game__content__item[data-action="equipment"]',
			elements: {
				m416: '.weapons__list__item[data-weapon="M416"]',
				AWP: '.weapons__list__item[data-weapon="AWP"]',
			}
		});
		this.engine = new Engine();

		this.player = new Player().localPlayer;
		this.elementsWithoutButton = Object.keys(this.elements).filter(key => key !== 'button');

		this.canSwitch = false;

		this.initialize();
	}

	initialize()
	{
		this.disabledWeapons();
		setTimeout(() => {
			this.registerEvents();
		}, 3000);
	}

	registerEvents()
	{
		this.canSwitch = true;

		Object.keys(this.elements).forEach(key => {
			this.elements[key].addEventListener('click', this.onClick.bind(this));
		});
	}

	disabledWeapons()
	{
		this.canSwitch = false;
		this.elements.m416.classList.add('disabled');
		this.elements.AWP.classList.add('disabled');

		setTimeout(() => {
			this.canSwitch = true;
			this.elements.m416.classList.remove('disabled');
			this.elements.AWP.classList.remove('disabled');
		}, 3000);
	}

	onClick(e)
	{
		if(!this.canSwitch) return;
		this.engine.pointLock.lock();
		this.disabledWeapons();
		switch(e.target.dataset.weapon)
		{
			case 'M416':
				this.player.destroyAWP();
				this.player.createM416();
				break;	
			case 'AWP':
				this.player.destroyM416();
				this.player.createAWP();
				break;
		}
	}
}