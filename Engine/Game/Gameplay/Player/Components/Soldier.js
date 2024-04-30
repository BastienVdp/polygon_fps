import * as THREE from "three";

import Engine from "@/Engine";
import { SkeletonUtils } from "three-stdlib";

const traverseGraph = (object, callback) => {
  object.traverse((child) => {
    callback(child);
  });
};

export default class Soldier {
  constructor({ id, container, instance }) {
    this.engine = new Engine();
    this.scene = this.engine.scenes.level;

    this.id = id;
    this.container = container;
    this.instance = instance;

    this.soldierMesh = this.engine.resources.get("soldier");

    this.initialize();
  }

  initialize() {
    this.initializeClone();
    this.initializeMesh();
    this.initializeShadows();
    // this.initializeAnimations();
  }

  initializeClone() {
    this.mesh = SkeletonUtils.clone(this.soldierMesh.scene);
    this.animations = this.soldierMesh.animations.map((clip) => clip.clone());
  }

  initializeMesh() {
    this.mesh.scale.set(0.9, 0.9, 0.9);
    this.mesh.name = "Soldier-" + this.id;
    this.mesh.position.y = -0.3;
    this.mesh.rotation.y = -Math.PI;
    this.container.add(this.mesh);

    this.mesh.userData["instance"] = this.instance;
  }

  initializeShadows() {
    traverseGraph(this.mesh, (child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  initializeAnimations() {
    this.animatioMixer = new THREE.AnimationMixer(this.mesh);

    this.animationsActions = new Map();
    this.animations.forEach((clip) => {
      const action = this.animatioMixer.clipAction(clip);
      if (clip.name === "Soldier_reload") {
        action.loop = THREE.LoopOnce;
      } else {
        action.loop = THREE.LoopRepeat;
      }

      this.animationsActions.set(clip.name, action);
    });

    this.animatioMixer.addEventListener("finished", (e) => {
      this.animationsActions.get(e.action._clip.name).reset();
    });
  }

  update(state, id) {
    this.container.position.copy(state.position);
    this.container.rotation.y = state.rotation;
    // this.handleAnimation(state.animation);
  }
}
