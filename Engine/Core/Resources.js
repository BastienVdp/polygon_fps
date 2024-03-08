import Loader from '@Core/Loader';

import { assets } from '@/assets';
import { EngineEventPipe, LoadingEvent } from '@Pipes/EngineEventPipe';
import { LoadingEnum } from '@Config/Enums/LoadingEnum';

/**
 * Resources class
 * @class Resources
 * @description A class that represents the resources for the game
 */
export default class Resources 
{
	constructor()
	{
		this.items = [];

		this.loader = new Loader();
		
		this.loader.load(assets);

		EngineEventPipe.addEventListener(LoadingEvent.type, (e) => {
			if(e.detail.enum === LoadingEnum.SINGLE) {
				this.items[e.detail.resource.resource.name] = e.detail.resource.data;
			}
		});
	}

	get(name)
	{
		return this.items[name];
	}

	set(name, data)
	{
		this.items[name] = data;
	}

}