import Component from '@Core/Component.js';
import InGameMenuContent from './InGameMenuContent';
import Engine from '@/Engine';
import { PointLockEventEnum } from '@Enums/EventsEnum';
import { PointLockEvent, EngineEventPipe } from '@Pipes/EngineEventPipe';
export default class InGameMenu extends Component 
{
	constructor() 
	{
		super({
			element: '.menu-in-game',
			elements: {
				menu: '.menu-in-game__nav',
				menuItems: '.menu-in-game__nav__item'
			}
		});

		this.activeTab = 'equipment';

		this.initialize();
	}

	initialize()
	{
		this.registerEvents();
		this.createContent();
	}
	
	createContent()
	{
		this.content = new InGameMenuContent();
		this.setActiveTab(this.activeTab);
	}

	registerEvents()
	{
		this.elements.menuItems.forEach(item => {
			item.addEventListener('click', this.onMenuItemClick.bind(this));
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
	
	onMenuItemClick(event)
	{
		if(event.target.dataset.action === 'resume') 
		{
			this.engine.pointLock.lock();
			return;
		}
		this.setActiveTab(event.target.dataset.action);
	}

	setActiveTab(tab) 
	{
		this.activeTab = tab;
		this.elements.menuItems.forEach(item => {
			item.classList.remove('active');
		});
		const activeItem = Array.from(this.elements.menuItems).find(item => item.dataset.action === tab);
		activeItem.classList.add('active');
		this.content.showContent(this.activeTab);
	}
}