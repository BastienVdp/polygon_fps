import Component from '@Core/Component';
import Settings from './Settings';
import Armory from './Armory';

/**
 * @class InGameMenuContent
 * @description Class to manage the in content panel UI
 * 
 */
export default class InGameMenuContent extends Component 
{
	constructor()
	{
		super({
			element: '.menu-in-game__content',
			elements: {
				contents: '.menu-in-game__content__item'
			}
		});


		this.initialize();
	}

	/**
	 * @method initialize
	 * @description Initialize the settings and armory panels
	 * @returns {void}
	 */
	initialize()
	{
		this.settings = new Settings();
		this.armory = new Armory();
	}

	/**
	 * @method showContent
	 * @description Show the content
	 * @param {string} tab - The tab to show
	 * @returns {void}
	 */
	showContent(tab)
	{
		this.elements.contents.forEach(content => {
			content.classList.remove('active');
		});

		const activeContent = Array.from(this.elements.contents).find(content => content.dataset.action === tab);
		activeContent.classList.add('active');
	}
}