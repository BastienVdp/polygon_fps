import Component from "@Core/Component";
import Engine from "@/Engine";

import { GameEvent, EngineEventPipe } from "@Pipes/EngineEventPipe";
import LobbyScene from "@Game/Lobby/LobbyScene";
import { GameEnums } from "@Config/Enums/GameEnum";
import { NetworkEvent } from "@Pipes/GameEventPipe";
import { NetworkEventEnum } from "@Config/Enums/EventsEnum";

/**
 * @class Lobby
 * @description Class to manage the lobby UI
 */
export default class Lobby extends Component {
  /**
   * @constructor
   * @description Create a lobby
   */
  constructor() {
    super({
      element: ".lobby",
      elements: {
        launchButton: ".launch",
        inviteButton: ".invite",
		    setNameButton: ".setName",
        input: ".lobby__actions input",
      },
    });

    this.initialize();
  }

  initialize() {
    this.scene = new LobbyScene();
    this.engine.renderer.setRenderLobby(true);
    this.registerEvents();
  }

  /**
   * @method registerEvents
   * @description Register the events
   * @returns {void}
   */
  registerEvents() {
    this.elements.launchButton.addEventListener("click", () => {
      // Launch the game
      GameEvent.detail.enum = GameEnums.LAUNCH;
      EngineEventPipe.dispatchEvent(GameEvent);
      // Hide the lobby
      this.hide();
    });
    this.elements.setNameButton.addEventListener("click", () => {
      if(this.elements.input.value.length == 0) {
        return;
      }
      
      NetworkEvent.detail.enum = NetworkEventEnum.SET_NAME;
      NetworkEvent.detail.data = this.elements.input.value;
      EngineEventPipe.dispatchEvent(NetworkEvent);

      this.hideElement(this.elements.setNameButton);
      this.showElement(this.elements.inviteButton);
      this.showElement(this.elements.launchButton);
	  });
  }

  hideElement(element)
  {
    element.classList.add('not-visible');
  }

  showElement(element)
  {
    element.classList.remove('not-visible');
  }
}
