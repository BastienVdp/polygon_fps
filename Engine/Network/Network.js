import { insertCoin, isHost, myPlayer, onPlayerJoin } from "playroomkit";
import { EngineEventPipe } from "@Pipes/EngineEventPipe";
import { NetworkEventEnum } from "@Config/Enums/EventsEnum";
import { NetworkEvent } from "../Pipes/GameEventPipe";
import Player from "../Game/Gameplay/Player/Player";
import Engine from "../Engine";

export default class Network {
  constructor() {
    this.engine = new Engine();
    this.players = [];

    this.localState = myPlayer().getState();

    this.initialize();
  }

  async connect() {}

  initialize() {
    this.registerEvents();

    onPlayerJoin((player) => {
      this.createPlayer(player);
    });
  }

  createPlayer(state) {
    const player = new Player(state);

    state.setState("health", 100);
    this.players.push({ state, player });

    NetworkEvent.detail.enum = NetworkEventEnum.CONNECTED;

    NetworkEvent.detail.data = {
      state: state,
      player: player,
    };

    EngineEventPipe.dispatchEvent(NetworkEvent);
  }

  registerEvents() {
    EngineEventPipe.addEventListener(NetworkEvent.type, (e) => {
      switch (e.detail.enum) {
        case NetworkEventEnum.CONNECTED:
          console.log("Connected to the server");
          break;
        case NetworkEventEnum.DISCONNECTED:
          console.log("Disconnected from the server");
          break;
        case NetworkEventEnum.ERROR:
          console.error("Error", e.detail.data);
        case NetworkEventEnum.SET_NAME:
          this.set("name", e.detail.data);
          break;
        default:
          break;
      }
    });
  }

  getLocalPlayer() {
    return this.localPlayer;
  }
  setLocalPlayer(player) {
    this.localPlayer = player;
  }

  set(key, value) {
    if (value.length == 0) {
      return;
    }

    switch (key) {
      case "name":
        myPlayer().setState("name", value);
        break;
    }
  }

  setGameStarted() {
    this.gameStarted = true;
  }

  update() {
    this.players.forEach(({ state, player }) => {
      player.update();
    });

    if (isHost()) {
      // update the game state
    }
  }
}
