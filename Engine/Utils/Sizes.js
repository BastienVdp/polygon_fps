import { EngineEventPipe, ResizeEvent } from '@Pipelines/EngineEventPipe';

/**
 * Sizes class
 * @class Sizes
 * @description A class that represents the sizes of the window
 * and dispatches a resize event
 */
export default class Sizes
{
	constructor()
	{
		window.addEventListener('resize', this.resize);
		
		this.resize();
	}

	/**
	 * Resize the window
	 * @method resize
	 * @description Resize the window and dispatch a resize event
	 * @emits ResizeEvent
	 */
	resize = () =>
	{
		this.width = window.innerWidth;
		this.height = window.innerHeight;

		ResizeEvent.detail.width = this.width;
		ResizeEvent.detail.height = this.height;
		EngineEventPipe.dispatchEvent(ResizeEvent);
	}
}