import Component from "@Core/Component";
import Engine from "@/Engine";

import { GameEvent, EngineEventPipe } from '@Pipes/EngineEventPipe';
import LobbyScene from "@Game/Lobby/LobbyScene";
import { GameEnums } from "@Config/Enums/GameEnum";

/**
 * @class Lobby
 * @description Class to manage the lobby UI
 */
export default class Lobby extends Component
{
	/**
	 * @constructor
	 * @description Create a lobby
	 */
	constructor() 
	{
		super({
			element: '.lobby',
			elements: {
				launchButton: '.launch',
				inviteButton: '.invite',
				input: '.lobby__actions input'
			}
		});

		this.initialize();
	}

	initialize()
	{
		this.scene = new LobbyScene();
		this.engine.renderer.setRenderLobby(true);		
		this.registerEvents();
	}


	/**
	 * @method registerEvents
	 * @description Register the events
	 * @returns {void}
	 */
	registerEvents()
	{
		this.elements.launchButton.addEventListener('click', () => {
			// Launch the game
			GameEvent.detail.enum = GameEnums.LAUNCH;
			EngineEventPipe.dispatchEvent(GameEvent);
			// Hide the lobby
			this.hide();
		});
	}

	
}