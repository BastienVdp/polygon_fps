import Engine from "@/Engine";
import Soldier from "./Soldier";

export default class RemotePlayer {
  constructor({ state, container, instance }) {
    this.engine = new Engine();
    this.scene = this.engine.scenes.level;

    this.id = state.id;
    this.state = state;
    this.container = container;
    this.instance = instance;

    this.initialize();
  }

  initialize() {
    this.soldier = new Soldier({
      id: this.id,
      container: this.container,
      instance: this.instance,
    });
  }

  getStates() {
    const position = this.state.getState("position");
    const rotation = this.state.getState("rotation");
    const animation = this.state.getState("animation");
    const firing = this.state.getState("firing");
    const health = this.state.getState("health");

    return {
      position: position,
      rotation: rotation,
      animation: animation,
      firing: firing,
      health: health,
    };
  }

  updateCharacter(state) {
    if (state.position && state.rotation) {
      this.soldier.update(state, this.state.id);
    }
  }

  updatePlayer(state) {
    if (state.health) {
      this.instance.health = state.health;
    }
  }

  update() {
    const state = this.getStates();
    this.updatePlayer(state);
    this.updateCharacter(state);
  }
}
