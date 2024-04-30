import { Scene, PerspectiveCamera, Color } from "three";
import { Octree } from "three/examples/jsm/math/Octree";

import Renderer from "@Core/Renderer";
import Resources from "@Core/Resources";
import PointLock from "@Core/PointLock";
import Game from "@Core/Game";

import Sizes from "@Utils/Sizes";
import Time from "@Utils/Time";
import { LoadingEnum } from "@Config/Enums/GameEnum";

import {
  EngineEventPipe,
  LoadingEvent,
  ResizeEvent,
  GameEvent,
} from "@Pipes/EngineEventPipe";
import { Pane } from "tweakpane";

import UI from "@/UI/UI";
import { GameEnums } from "@Config/Enums/GameEnum";
import { PointLockEventEnum } from "@Config/Enums/EventsEnum";
import { PointLockEvent } from "./Pipes/EngineEventPipe";
import { GameEventEnum } from "./Config/Enums/EventsEnum";
import Network from "./Network/Network";
import { myPlayer } from "playroomkit";

/**
 * Engine class
 * @class Engine
 * @description A class that represents the engine of the game
 */
export default class Engine {
  static instance;

  constructor() {
    if (Engine.instance) {
      return Engine.instance;
    }
    Engine.instance = this;

    // this.debug = new Pane({

    // });
    this.octree = new Octree();

    this.canvas = document.querySelector("#game");

    this.pointLock = new PointLock();
  }

  /**
   * Start the engine
   * @method start
   * @description Initialize the engine and start the game loop
   */
  start() {
    this.initialize();

    this.update();
  }

  /**
   * Initialize the engine
   * @method initialize
   * @description Initialize the utils class and create the scenes, cameras, renderer and register events
   */
  initialize() {
    this.sizes = new Sizes();

    this.createScenes();

    this.createCameras();

    this.time = new Time();
    this.renderer = new Renderer();
    this.resources = new Resources();
    this.registerEvents();
  }

  createScenes() {
    this.scenes = {
      level: new Scene(),
      player: new Scene(),
      skybox: new Scene(),
      lobby: new Scene(),
      sprites: new Scene(),
    };

    this.scenes.lobby.background = new Color(0x000000);
  }

  createCameras() {
    this.cameras = {
      uiCamera: new PerspectiveCamera(
        75,
        this.sizes.width / this.sizes.height,
        0.1,
        1000
      ),
      playerCamera: new PerspectiveCamera(
        75,
        this.sizes.width / this.sizes.height,
        0.1,
        1000
      ),
      firstPersonCamera: new PerspectiveCamera(
        50,
        this.sizes.width / this.sizes.height,
        0.0001,
        1000
      ),
    };
  }

  createGame() {
    this.game = new Game();
    this.game.start();
  }

  createUI() {
    this.ui = new UI();
  }
  /**
   * Register events
   * @method registerEvents
   * @description Register the events for the engine
   */
  registerEvents() {
    EngineEventPipe.addEventListener(LoadingEvent.type, this.onLoading);
    EngineEventPipe.addEventListener(ResizeEvent.type, this.onResize);

    // EngineEventPipe.addEventListener(GameEvent.type, (e) => {
    //   switch (e.detail.enum) {
    //     case GameEventEnum.LAUNCH:
    //       this.startGame();
    //       break;
    //   }
    // });
  }

  createNetwork() {
    this.network = new Network();
  }
  /**
   * On loading event
   * @method onLoading
   * @description The event that is called when the assets are loading
   * @param {Event} e - The event
   */
  onLoading = (e) => {
    switch (e.detail.enum) {
      case LoadingEnum.SINGLE:
        console.log(e.detail.progress);
        break;
      case LoadingEnum.COMPLETE:
        this.createNetwork();
        this.createGame();
        this.createUI();

        break;
    }
  };

  /**
   * On resize event
   * @method onResize
   * @description The event that is called when the window is resized
   * @param {Event} e - The event
   */
  onResize = (e) => {
    Object.values(this.cameras).forEach((camera) => {
      camera.aspect = e.detail.width / e.detail.height;
      camera.updateProjectionMatrix();
    });

    if (this.renderer) this.renderer.resize();
  };

  update() {
    if (this.time) {
      this.time.update();
    }

    if (this.network) {
      this.network.update();
    }

    if (this.game) {
      this.game.update();
    }

    if (this.renderer) {
      this.renderer.update();
    }

    window.requestAnimationFrame(this.update.bind(this));
  }
}
