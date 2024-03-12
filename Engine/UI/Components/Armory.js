import Component from '@Core/Component.js';
import Player from '../../Game/Gameplay/Player/Player';
import Engine from '../../Engine';

/**
 * @class Armory
 * @description Class to manage the armory UI
 */	
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

		this.canSwitch = false;

		this.initialize();
	}

	/**
	 * @method initialize
	 * @description Initialize the armory by disabled the weapons and registering the events after 3 seconds for prevent error with PointLock API
	 * @returns {void}
	 */
	initialize()
	{
		this.disabledWeapons();
		setTimeout(() => {
			this.registerEvents();
		}, 3000);
	}

	/**
	 * @method registerEvents
	 * @description Register the events
	 * @returns {void}
	 */
	registerEvents()
	{
		this.canSwitch = true;

		Object.keys(this.elements).forEach(key => {
			this.elements[key].addEventListener('click', this.onClick.bind(this));
		});
	}

	/**
	 * @method disabledWeapons
	 * @description Disable the weapons for 3 seconds
	 * @returns {void}
	 */
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

	/**
	 * @method onClick
	 * @description Handle the click event
	 * @param {Event} e
	 * @listens click
	 */
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