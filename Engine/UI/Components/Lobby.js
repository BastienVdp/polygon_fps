import Component from "@Core/Component";
import Engine from "@/Engine";

import { GameEvent, EngineEventPipe } from '@Pipes/EngineEventPipe';
import LobbyScene from "@Game/Lobby/LobbyScene";
import { GameEnums } from "@Config/Enums/GameEnum";

export default class Lobby extends Component
{
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


	registerEvents()
	{
		this.elements.launchButton.addEventListener('click', () => {
			// this.engine.renderer.renderLobby(false);
			GameEvent.detail.enum = GameEnums.LAUNCH;
			EngineEventPipe.dispatchEvent(GameEvent);

			this.hide();
		});

		// this.elements.inviteButton.addEventListener('click', () => {
		// 	this.elements.input.select();
		// });
	}

	
}