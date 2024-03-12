import Component from '@Core/Component';
import Settings from './Settings';
import Armory from './Armory';

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

	initialize()
	{
		this.settings = new Settings();
		this.armory = new Armory();
	}

	showContent(tab)
	{
		this.elements.contents.forEach(content => {
			content.classList.remove('active');
		});

		const activeContent = Array.from(this.elements.contents).find(content => content.dataset.action === tab);
		activeContent.classList.add('active');
	}
}