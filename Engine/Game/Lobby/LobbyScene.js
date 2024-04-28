import {
  EquirectangularReflectionMapping,
  LinearFilter,
  AmbientLight,
  DirectionalLight,
} from "three";
import Engine from "@/Engine";
import { SkeletonUtils, TextGeometry } from "three-stdlib";
import { EngineEventPipe } from "../../Pipes/EngineEventPipe";
import { NetworkEvent } from "../../Pipes/GameEventPipe";
import { NetworkEventEnum } from "../../Config/Enums/EventsEnum";
import * as THREE from "three";

/**
 * @class LobbyScene
 * @description Class to manage the lobby scene
 */
export default class LobbyScene {
  constructor() {
    this.engine = new Engine();

    this.settings = {
      camera: {
        position: {
          x: 0.4,
          y: 1,
          z: -7.6,
        },
        rotation: {
          x: 0,
          y: -3.7,
          z: 0,
        },
      },
      player: {
        rotation: {
          z: 3.7,
        },
      },
      directionalLight: {
        intensity: 2.5,
        color: 0xdab99a,
      },
      ambiantLight: {
        intensity: 0.5,
        color: 0xffcfcf,
      },
    };

    this.soldierModel = this.engine.resources.get("soldier").scene.children[0];

    this.othersPlayers = [
      {
        id: 1,
        name: "Player 1",
      },
      {
        id: 2,
        name: "Player 2",
      },
      {
        id: 3,
        name: "Player 3",
      },
    ];
    this.initialize();
  }

  initialize() {
    this.scene = this.engine.resources.get("lobby").scene;
    this.engine.scenes.lobby.add(this.scene);

    this.settings.player.position =
      this.scene.getObjectByName("spawn_local").position;

    for (let i = 1; i < 4; i++) {
      this.scene.getObjectByName("spawn_" + i).visible = false;
    }

    this.setEnvironment();

    this.registerEvents();
    // this.setLocalPlayer();
    // this.setOtherPlayers();
    this.setCamera();

    if (this.engine.debug) {
      this.setDebug();
    }
  }

  registerEvents() {
    EngineEventPipe.addEventListener(NetworkEvent.type, (e) => {
      switch (e.detail.enum) {
        case NetworkEventEnum.CONNECTED:
          this.onConnected();
          break;
        case NetworkEventEnum.SET_NAME:
          this.addTag(e.detail.data);
          break;
      }
    });
  }

  addTag(data) {
    console.log(data);
    const text = new TextGeometry(data, {
      size: 70,
      depth: 20,
      curveSegments: 4,

      bevelThickness: 2,
      bevelSize: 1,
      bevelEnabled: true,
    });
    text.computeBoundingBox();
    const textMesh = new THREE.Mesh(text, [
      new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true }), // front
      new THREE.MeshPhongMaterial({ color: 0xffffff }), // side
    ]);
    textMesh.rotation.y = Math.PI;

    if (this.players) textMesh.position.set(0, 2, 0);
    this.engine.scenes.lobby.add(textMesh);
  }

  onConnected() {
    this.getPlayers();
    // check if its the first player
    if (this.engine.network.players.length == 1) {
      this.setLocalPlayer();
    }
  }

  getPlayers() {
    this.players = this.engine.network.players;
  }

  setLocalPlayer() {
    this.localPlayer = SkeletonUtils.clone(this.soldierModel);
    this.localPlayer.rotation.z = this.settings.player.rotation.z;
    this.localPlayer.position.copy(this.settings.player.position);
    this.engine.scenes.lobby.add(this.localPlayer);
  }

  setOtherPlayers() {
    // this.othersPlayers.forEach((player) => {
    //   const otherPlayer = SkeletonUtils.clone(this.soldierModel);
    //   otherPlayer.position.copy(
    //     this.scene.getObjectByName("spawn_" + player.id).position
    //   );
    //   otherPlayer.rotation.z = this.settings.player.rotation.z;
    //   this.engine.scenes.lobby.add(otherPlayer);
    // });
  }

  setEnvironment() {
    this.environment = this.engine.resources.get("sunset");
    this.environment.mapping = EquirectangularReflectionMapping;
    this.environment.magFilter = LinearFilter;
    this.engine.scenes.lobby.environment = this.environment;

    this.ambiantLight = new AmbientLight(
      this.settings.ambiantLight.color,
      this.settings.ambiantLight.intensity
    );
    this.engine.scenes.lobby.add(this.ambiantLight);

    this.directionalLight = new DirectionalLight(
      this.settings.directionalLight.color,
      this.settings.directionalLight.intensity
    );
    this.directionalLight.position.set(0, 10, 10);
    this.engine.scenes.lobby.add(this.directionalLight);
  }

  setCamera() {
    this.engine.cameras.uiCamera.position.set(
      this.settings.camera.position.x,
      this.settings.camera.position.y,
      this.settings.camera.position.z
    );
    this.engine.cameras.uiCamera.rotation.set(
      this.settings.camera.rotation.x,
      this.settings.camera.rotation.y,
      this.settings.camera.rotation.z
    );
    // add + 1 to the y position to look at the head of the player
    this.engine.cameras.uiCamera.lookAt(
      this.settings.player.position.x,
      this.settings.player.position.y + 1,
      this.settings.player.position.z
    );
  }

  setDebug() {
    this.folder = this.engine.debug.addFolder({
      title: "Lobby",
      expanded: false,
    });

    this.folder
      .addBinding(this.settings.camera.position, "x", {
        label: "Camera X",
        min: -10,
        max: 10,
        step: 0.1,
      })
      .on("change", ({ value }) => {
        this.engine.cameras.uiCamera.position.x = value;
      });

    this.folder
      .addBinding(this.settings.camera.position, "y", {
        label: "Camera Y",
        min: -10,
        max: 10,
        step: 0.1,
      })
      .on("change", ({ value }) => {
        this.engine.cameras.uiCamera.position.y = value;
      });

    this.folder
      .addBinding(this.settings.camera.position, "z", {
        label: "Camera Z",
        min: -10,
        max: 10,
        step: 0.1,
      })
      .on("change", ({ value }) => {
        this.engine.cameras.uiCamera.position.z = value;
      });

    this.folder
      .addBinding(this.settings.player.rotation, "z", {
        label: "Player Y",
        min: -10,
        max: 10,
        step: 0.1,
      })
      .on("change", ({ value }) => {
        this.localPlayer.rotation.z = value;
      });
  }
}
