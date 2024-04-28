import * as THREE from "three";
import Engine from "@/Engine";
import {
  AnimationEventPipe,
  FirstPersonAnimationEvent,
} from "@Pipes/AnimationEventPipe";
import { UserInputEventPipe, UserInputEvent } from "@Pipes/UserInputEventPipe";
import {
  WeaponAnimationEventEnum,
  UserInputEventEnum,
} from "@Config/Enums/EventsEnum";
import { WeaponEnum } from "@Enums/WeaponEnum";

/**
 * @class AnimationManager
 * @description The animation manager class
 */
export default class AnimationManager {
  /**
   * Constructor
   * @param {Weapon} weapon - The weapon object
   */
  constructor({ weapon }) {
    this.engine = new Engine();
    this.weapon = weapon;
    this.animations = {};
    this.states = {
      running: false,
      walking: false,
      ads: false,
      jumping: false,
      reloading: false,
      firing: false,
    };
    this.initialize();
  }

  /**
   * @method initialize
   * @description Initialize the animation manager and register input events
   * @returns {void}
   */
  initialize() {
    this.mixer = this.engine.resources.get(
      `${this.weapon.name}_AnimationMixer`
    );
    this.registerInputEvents();
    this.initializeAnimations();
  }

  /**
   * @method initializeAnimations
   * @description Initialize the animations for the weapon and configure them
   * @returns {void}
   */
  initializeAnimations() {
    const animations = this.engine.resources.get(
      `${this.weapon.name}_AnimationsActions`
    );

    animations.forEach((animation, name) => {
      this.animations[name] = animation;
      this.configureAnimation(name);
    });
  }

  /**
   * @method configureAnimation
   * @description Configure the animation based on the name
   * @param {string} name - The name of the animation
   * @returns {void}
   */
  configureAnimation(name) {
    const animation = this.animations[name];
    switch (name) {
      case `${this.weapon.name}_draw`:
      case `${this.weapon.name}_remove`:
        this.setupDrawAnimation(animation);
        break;
      case `${this.weapon.name}_jump`:
        this.setupJumpOnceAnimation(animation);
        break;
      case `${this.weapon.name}_reload`:
        this.setupLoopOnceAnimation(
          animation,
          animation._clip.duration / this.weapon.reloadTime
        );
        break;
      case `${this.weapon.name}_fire`:
      case `${this.weapon.name}_ads_fire`:
        this.setupLoopOnceAnimation(animation);
        break;
      case `${this.weapon.name}_idle`:
        this.setupLoopRepeatAnimation(animation, 0.8);
        break;
      case `${this.weapon.name}_walk`:
        this.setupLoopRepeatAnimation(animation);
        break;
      case `${this.weapon.name}_run`:
        this.setupLoopRepeatAnimation(animation, 0.8);
        break;
      case `${this.weapon.name}_ads_aim`:
        this.setupOnceAnimation(animation);
        break;
      case `${this.weapon.name}_ads_fire`:
        this.setupLoopRepeatAnimation(animation);
        break;
    }
  }

  /**
   * @method isWeaponM416
   * @description Check if the weapon is M416
   * @returns {boolean} - True if the weapon is M416
   */
  isWeaponM416() {
    return this.weapon.name === "M416";
  }

  /**
   * @method isSniper
   * @description Check if the weapon is a sniper
   * @returns {boolean} - True if the weapon is a sniper
   */
  isSniper() {
    return this.weapon.classification === WeaponEnum.SNIPER;
  }

  /**
   * @method getAnimationClipName
   * @description Get the animation clip name
   * @param {AnimationAction} animation - The animation action
   */
  getAnimationClipName(animation) {
    return animation._clip.name;
  }

  /**
   * @method handleJumpAnimationFinished
   * @description Set the jumping state to false when the jump animation is finished and play the right animation based on the current state
   * @returns {void}
   */
  handleJumpAnimationFinished() {
    this.states.jumping = false;

    if (this.states.running) {
      this.animations[`${this.weapon.name}_run`].play();
    } else if (this.states.walking) {
      this.animations[`${this.weapon.name}_walk`].play();
    } else {
      this.animations[`${this.weapon.name}_idle`].play();
    }
  }

  setupDrawAnimation(animation) {
    animation.setLoop(THREE.LoopOnce);
    animation.clampWhenFinished = true;
    if (this.isWeaponM416()) {
      animation.timeScale = 1.4;
    } else if (this.isSniper()) {
      animation.timeScale = 1.4;
    } else {
      animation.timeScale = 2.0;
    }
  }
  /**
   * @method setupOnceAnimation
   * @description Setup the animation to play once, clamp when finished and set the time scale
   * @param {AnimationAction} animation - The animation action
   * @returns {void}
   */
  setupOnceAnimation(animation) {
    animation.setLoop(THREE.LoopOnce);
    animation.clampWhenFinished = true;
    animation.timeScale = 1.0;
  }

  /**
   * @method setupLoopOnceAnimation
   * @description Setup the animation to play once and set the time scale
   * @param {AnimationAction} animation - The animation action
   * @param {number} timeScale - The time scale
   * @returns {void}
   */
  setupLoopOnceAnimation(animation, timeScale = 1) {
    animation.setLoop(THREE.LoopOnce);
    animation.timeScale = timeScale;
  }

  /**
   * @method setupJumpOnceAnimation
   * @description Setup the jump animation to play once and set the time scale
   * @param {AnimationAction} animation - The animation action
   * @param {number} timeScale - The time scale
   * @returns {void}
   */
  setupJumpOnceAnimation(animation, timeScale = 1.2) {
    animation.setLoop(THREE.LoopOnce);
    animation.timeScale = this.isWeaponM416() ? 0.7 : timeScale;
  }

  /**
   * @method setupLoopRepeatAnimation
   * @description Setup the animation to loop repeat and set the time scale
   * @param {AnimationAction} animation - The animation action
   * @param {number} timeScale - The time scale
   * @returns {void}
   */
  setupLoopRepeatAnimation(animation, timeScale = 1.0) {
    animation.setLoop(THREE.LoopRepeat);
    animation.timeScale = timeScale;
  }

  /**
   * @method registerInputEvents
   * @description Register the input events
   * @listens FirstPersonAnimationEvent
   *  @listens UserInputEvent
   * @returns {void}
   */
  registerInputEvents() {
    AnimationEventPipe.addEventListener(FirstPersonAnimationEvent.type, (e) => {
      this.handleAnimationEvent(e.detail);
    });

    UserInputEventPipe.addEventListener(UserInputEvent.type, (e) => {
      this.handleUserInputEvent(e.detail.enum);
    });

    if (this.mixer) {
      this.mixer.addEventListener("finished", (e) => {
        if (e.type === "finished") {
          this.handleAnimationFinished(e);
        }
      });
    }
  }

  handleAnimationEvent(detail) {
    if (detail.weapon !== this.weapon) return;
    this.playAnimation(detail.enum);
  }

  /**
   * @method handleUserInputEvent
   * @description Handle the user input event
   * @param {UserInputEventEnum} inputEvent - The user input event
   * @returns {void}
   */
  handleUserInputEvent(inputEvent) {
    if (!this.weapon.active) return;
    switch (inputEvent) {
      case UserInputEventEnum.MOVE_FORWARD_DOWN:
      case UserInputEventEnum.MOVE_BACKWARD_DOWN:
        this.playAnimation(WeaponAnimationEventEnum.WALK);
        break;
      case UserInputEventEnum.MOVE_FORWARD_UP:
      case UserInputEventEnum.MOVE_BACKWARD_UP:
        this.playAnimation(WeaponAnimationEventEnum.WALK, false);
        break;
      case UserInputEventEnum.BUTTON_SHIFT_DOWN:
        this.playAnimation(WeaponAnimationEventEnum.RUN);
        break;
      case UserInputEventEnum.BUTTON_SHIFT_UP:
        this.playAnimation(WeaponAnimationEventEnum.RUN, false);
        break;
      case UserInputEventEnum.JUMP:
        this.playAnimation(WeaponAnimationEventEnum.JUMP);
        break;
      case UserInputEventEnum.BUTTON_ADS_DOWN:
        this.playAnimation(WeaponAnimationEventEnum.ADS);
        break;
      case UserInputEventEnum.BUTTON_ADS_UP:
        this.playAnimation(WeaponAnimationEventEnum.ADS, false);
        break;
    }
  }

  /**
   * @method playAnimation
   * @description Play the animation based on the event
   * @param {WeaponAnimationEventEnum} event - The weapon animation event
   * @returns {void}
   */
  playAnimation(event, value = true) {
    switch (event) {
      case WeaponAnimationEventEnum.REMOVE:
        this.handleRemoveAnimation();
        break;
      case WeaponAnimationEventEnum.DRAW:
        this.handleDrawAnimation();
        break;
      case WeaponAnimationEventEnum.IDLE:
        this.handleIdleAnimation();
        break;
      case WeaponAnimationEventEnum.FIRE:
        this.handleFireAnimation();
        break;
      case WeaponAnimationEventEnum.RELOAD:
        this.handleReloadAnimation();
        break;
      case WeaponAnimationEventEnum.ADS:
        if (value) {
          this.handleAdsAnimation();
        } else {
          this.handleStopAdsAnimation();
        }
        break;
      case WeaponAnimationEventEnum.WALK:
        if (value) {
          this.handleWalkAnimation();
        } else {
          this.handleStopWalkAnimation();
        }
        break;
      case WeaponAnimationEventEnum.RUN:
        if (value) {
          this.handleRunAnimation();
        } else {
          this.handleStopRunAnimation();
        }
        break;
      case WeaponAnimationEventEnum.JUMP:
        this.handleJumpAnimation();
        break;
    }
  }

  handleRemoveAnimation() {
    this.stopAllAnimations();
    this.weapon.setActive(false);
    this.weapon.setVisible(false);
  }

  handleDrawAnimation() {
    this.weapon.setVisible(true);
    this.weapon.setActive(false);
    this.stopAndPlayAnimation(`${this.weapon.name}_draw`);
  }

  handleIdleAnimation() {
    this.states.firing = false;

    this.resetStates();
  }

  handleFireAnimation() {
    this.states.firing = true;
    if (this.isSniper() || !this.states.ads) {
      this.stopAllAnimations();

      this.stopAndPlayAnimation(`${this.weapon.name}_fire`);
      if (this.isSniper()) {
        this.weapon.setVisible(true);
        this.weapon.scope.visible = false;
      }
    } else {
      this.stopAndPlayAnimation(`${this.weapon.name}_ads_fire`);
    }
  }

  handleReloadAnimation() {
    this.states.reloading = true;
    this.stopAllAnimations();
    this.stopAndPlayAnimation(`${this.weapon.name}_reload`);
  }

  handleAdsAnimation() {
    this.stopAllAnimations();
    if (!this.states.reloading && this.weapon.active) {
      if (!this.isSniper()) this.stopAllAnimations();
      this.states.ads = true;

      if (this.isSniper()) {
        this.weapon.setVisible(false);
        this.weapon.scope.visible = true;
      } else {
        this.playOrStopAnimation(`${this.weapon.name}_ads_aim`, true);
      }
    }
  }

  handleStopAdsAnimation() {
    this.states.ads = false;
    if (this.isSniper()) {
      this.weapon.setVisible(true);
      this.weapon.scope.visible = false;
      if (this.states.running)
        this.playOrStopAnimation(`${this.weapon.name}_run`, true);
      else if (this.states.walking)
        this.playOrStopAnimation(`${this.weapon.name}_walk`, true);
      else this.playOrStopAnimation(`${this.weapon.name}_idle`, true);
    } else {
      this.playOrStopAnimation(`${this.weapon.name}_ads_aim`, false);
      if (this.states.running)
        this.playOrStopAnimation(`${this.weapon.name}_run`, true);
      else if (this.states.walking)
        this.playOrStopAnimation(`${this.weapon.name}_walk`, true);
      else this.playOrStopAnimation(`${this.weapon.name}_idle`, true);
    }
  }

  handleWalkAnimation() {
    if (this.states.walking) return;
    this.states.walking = true;
    if (this.states.running) {
      this.stopAndPlayAnimation(`${this.weapon.name}_run`);
      this.playOrStopAnimation(`${this.weapon.name}_walk`, false);
    }

    this.stopAndPlayAnimation(`${this.weapon.name}_walk`);
  }

  handleStopWalkAnimation() {
    this.states.walking = false;
    this.playOrStopAnimation(`${this.weapon.name}_walk`, false);
    this.playOrStopAnimation(`${this.weapon.name}_run`, false);
    this.playOrStopAnimation(`${this.weapon.name}_idle`, true);
  }

  handleRunAnimation() {
    if (this.states.running) return;
    this.states.running = true;

    if (this.states.walking) {
      this.stopAndPlayAnimation(`${this.weapon.name}_run`);
    }
  }

  handleStopRunAnimation() {
    this.states.running = false;

    this.playOrStopAnimation(`${this.weapon.name}_run`, false);
  }

  handleJumpAnimation() {
    this.states.jumping = true;
  }

  resetStates() {
    this.states = {
      running: false,
      walking: false,
      ads: false,
      jumping: false,
      reloading: false,
      firing: false,
    };
  }

  // /**
  //  * @method handleSniperADSAnimation
  //  * @description Handle the sniper aim down sight animation
  //  * @param {boolean} isADS - True if the player is aiming down sight
  //  * @returns {void}
  //  */
  // handleSniperADSAnimation(isADS)
  // {
  //     if (isADS) {
  //         this.weapon.setVisible(false);
  //         this.weapon.scope.visible = true;
  //     } else {
  //         this.weapon.setVisible(true);
  //         this.weapon.scope.visible = false;
  //         if(this.states.running) this.playOrStopAnimation(`${this.weapon.name}_run`, true);
  //         else if(this.states.walking) this.playOrStopAnimation(`${this.weapon.name}_walk`, true);
  //         else this.playOrStopAnimation(`${this.weapon.name}_idle`, true);
  //     }
  // }

  // /**
  //  * @method handleNormalADSAnimation
  //  * @description Handle the normal aim down sight animation
  //  * @param {boolean} isADS - True if the player is aiming down sight
  //  * @returns {void}
  //  */
  // handleNormalADSAnimation(isADS)
  // {
  //
  // }

  /**
   * @method handleAnimationFinished
   * @description Handle the animation finished event
   * @param {AnimationAction} e - The animation action
   * @returns {void}
   */
  handleAnimationFinished(e) {
    const action = e.action;
    const clipName = this.getAnimationClipName(action);

    switch (clipName) {
      case this.getAnimationClipName(
        this.animations[`${this.weapon.name}_reload`]
      ):
        this.handleReloadAnimationFinished();
        break;
      case this.getAnimationClipName(
        this.animations[`${this.weapon.name}_draw`]
      ):
        this.handleDrawAnimationFinished();
        break;
      case this.getAnimationClipName(
        this.animations[`${this.weapon.name}_jump`]
      ):
        this.handleJumpAnimationFinished();
        break;
      case this.getAnimationClipName(
        this.animations[`${this.weapon.name}_fire`]
      ):
        this.handleFireAnimationFinished();
        break;
      case this.getAnimationClipName(
        this.animations[`${this.weapon.name}_ads_fire`]
      ):
        this.handleAdsFireAnimationFinished();
        break;
    }
  }

  handleFireAnimationFinished() {
    this.states.firing = false;

    if (this.states.walking) {
      this.playOrStopAnimation(`${this.weapon.name}_walk`, true);
      if (this.states.running && this.states.walking) {
        this.playOrStopAnimation(`${this.weapon.name}_walk`, false);
        this.playOrStopAnimation(`${this.weapon.name}_run`, true);
      }
    } else {
      this.playOrStopAnimation(`${this.weapon.name}_run`, false);
      this.playOrStopAnimation(`${this.weapon.name}_walk`, false);

      // this.playAnimation(WeaponAnimationEventEnum.IDLE);
      this.playOrStopAnimation(`${this.weapon.name}_idle`, true);
    }
  }

  handleAdsFireAnimationFinished() {
    this.stopAllAnimations();
    if (this.isSniper()) {
      this.playOrStopAnimation(`${this.weapon.name}_idle`, true);
    } else {
      this.playOrStopAnimation(`${this.weapon.name}_ads_aim`, true);
    }
  }

  handleReloadAnimationFinished() {
    this.weapon.setBulletLeft(this.weapon.magazineSize);
    this.weapon.setActive(true);
    this.states.reloading = false;
    this.playOrStopAnimation(`${this.weapon.name}_run`, this.states.running);
    this.playOrStopAnimation(
      `${this.weapon.name}_walk`,
      this.states.walking && !this.states.reloading
    );
    this.playAnimation(WeaponAnimationEventEnum.IDLE);
  }

  handleDrawAnimationFinished() {
    this.weapon.setActive(true);
    this.playAnimation(WeaponAnimationEventEnum.IDLE);
  }

  /**
   * @method stopAndPlayAnimation
   * @description Stop and play the animation
   * @param {string} animationName - The name of the animation
   */
  stopAndPlayAnimation(animationName) {
    this.animations[animationName].stop().reset().play();
  }

  /**
   * @method playOrStopAnimation
   * @description Play or stop the animation
   * @param {string} animationName - The name of the animation
   * @param {boolean} shouldPlay - True if the animation should play
   * @returns {void}
   */
  playOrStopAnimation(animationName, shouldPlay) {
    if (shouldPlay) {
      this.animations[animationName].reset().play();
    } else {
      this.animations[animationName].reset().stop();
    }
  }

  /**
   * @method fadeOutAllAnimations
   * @description Fade out all the animations
   * @param {number} duration - The duration of the fade out
   * @returns {void}
   */
  fadeOutAllAnimations(duration) {
    Object.values(this.animations).forEach((animation) => {
      animation.fadeOut(duration);
    });
  }

  /**
   * @method stopAllAnimations
   * @description Stop all the animations
   * @returns {void}
   */
  stopAllAnimations() {
    Object.values(this.animations).forEach((animation) => {
      animation.reset().stop();
    });

    Object.values(this.states).forEach((state) => (state = false));
  }

  /**
   * @method update
   * @description Update the animation manager
   * @returns {void}
   */
  update() {
    this.mixer.update(this.engine.time.delta);
  }
}
