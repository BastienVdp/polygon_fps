import Component from '@Core/Component.js';
import { throttle } from '@Utils/Utils';

export default class Settings extends Component
{
	constructor()
	{
		super({
			element: '.menu-in-game__content__item[data-action="settings"]',
			elements: {
				sensibility: '.sensibility',
				forward: '.forward',
				backward: '.backward',
				left: '.left',
				right: '.right',
				jump: '.jump',
				run: '.run',
				primaryWeapon: '.primary_weapon',
				secondaryWeapon: '.secondary_weapon',
				button: '.save'
			}
		});

		this.elementsWithoutButton = Object.keys(this.elements).filter(key => key !== 'button');
		
		this.initialize();
	}

	initialize()
	{
		this.registerEvents();
	}

	registerEvents()
	{
		this.elementsWithoutButton.forEach(key => {
			this.elements[key].addEventListener('input', (e) => this.onInputChange(e, key))
		});

		this.elements.button.addEventListener('click', this.saveSettings.bind(this));
	}

	saveSettings()
	{
		this.elementsWithoutButton.forEach(key => localStorage.setItem(`${key}_key`, this.elements[key].value));
	}

	onInputChange = (e, key) =>
	{
		this.throttle(() => {
			if(this.checkInputValue(key, e.target.value))
			{
				console.log(`${e.target.name} changed`);
			} else {
				console.error(`${key} value is not valid`)
				this.handleInputError(key, e.target.value);
			}
		}, 1000);
	}

	inputIsValidNumber(value)
	{
		if(Number(value) < 0 || Number(value) > 1 || value === '' || value === null || value === undefined || isNaN(value))
		{
			return false;
		} 

		return true;
	}

	inputIsValidString(value)
	{
		if(value === '' || value === null || value === undefined || value.length > 1 || !isNaN(value))
		{
			return false;
		}

		return true;
	}

	checkInputValue(name, value)
	{
		switch(name)
		{
			case 'sensibility':
				return this.inputIsValidNumber(value);
				break;
			case 'forward':
			case 'backward':
			case 'left':
			case 'right':
			case 'jump':
			case 'run':
			case 'primaryWeapon':
			case 'secondaryWeapon':
				return this.inputIsValidString(value);
				break;
		}
	}

	handleInputError(name, value)
	{
		switch(name)
		{
			case 'sensibility':
				this.elements.sensibility.value = 0.5;
				break;
			case 'forward':
				this.elements.forward.value = 'Z';
				break;
			case 'backward':
				this.elements.forward.value = 'S';
				break;
			case 'left':
				this.elements.forward.value = 'Q';
				break;
			case 'right':
				this.elements.forward.value = 'D';
				break;
			case 'jump':
				this.elements.forward.value = 'Espace';
				break;
			case 'run':
				this.elements.forward.value = 'Shift';
				break;
			case 'primaryWeapon':
				this.elements.forward.value = '1';
				break;
			case 'secondaryWeapon':
				this.elements.forward.value = '2';
				break;
				break;
		}
	}
}