import Engine from "@/Engine";

import Stats from "three/examples/jsm/libs/stats.module";

import HUD from "./Components/HUD";
import InGameMenu from "./Components/InGameMenu";
import Lobby from "./Components/Lobby";

/**
 * UI class
 * @class UI
 * @description A class that represents the UI for the game
 */
export default class UI {
  static instance;

  constructor() {
    if (UI.instance) {
      return UI.instance;
    }
    UI.instance = this;

    this.engine = new Engine();

    this.element = document.querySelector(".ui");
    this.initialize();
  }

  initialize() {
    this.show();

    // this.createLobby();
    this.createStats();
    this.createInGameMenu();
    this.createHUD();
  }

  /**
   * @method createLobby
   * @description Create the lobby
   * @returns {void}
   */
  createLobby() {
    this.lobby = new Lobby();
  }

  /**
   * @method createStats
   * @description Create the stats
   * @returns {void}
   */
  createStats() {
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);
  }

  /**
   * @method createInGameMenu
   * @description Create the in game menu
   * @returns {void}
   */
  createInGameMenu() {
    this.inGameMenu = new InGameMenu();
  }

  /**
   * @method createHUD
   * @description Create the HUD
   * @returns {void}
   */
  createHUD() {
    this.hud = new HUD();
  }

  show() {
    this.element.classList.remove("not-visible");
  }

  hide() {
    this.element.classList.add("not-visible");
  }

  update() {
    this.stats.update();
  }
}
