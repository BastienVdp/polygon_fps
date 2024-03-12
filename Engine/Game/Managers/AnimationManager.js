import * as THREE from 'three';
import Engine from '@/Engine';
import { AnimationEventPipe, FirstPersonAnimationEvent } from '@Pipes/AnimationEventPipe';
import { UserInputEventPipe, UserInputEvent } from '@Pipes/UserInputEventPipe';
import { WeaponAnimationEventEnum, UserInputEventEnum } from '@Config/Enums/EventsEnum';
import { WeaponEnum } from '@Enums/WeaponEnum';

/**
 * @class AnimationManager
 * @description The animation manager class
 */
export default class AnimationManager 
{
    /** 
     * Constructor
     * @param {Weapon} weapon - The weapon object
     */
    constructor({ weapon }) 
    {
        this.engine = new Engine();
        this.weapon = weapon;
        this.animations = {};
        this.states = {
            running: false,
            walking: false,
            ads: false,
            jumping: false,
            reloading: false,
            firing: false
        };
        this.initialize();
    }

    /**
     * @method initialize
     * @description Initialize the animation manager and register input events
     * @returns {void}
     */
    initialize() 
    {
        this.mixer = this.engine.resources.get(`${this.weapon.name}_AnimationMixer`);
        this.registerInputEvents();
        this.initializeAnimations();
    }

    /**
     * @method initializeAnimations
     * @description Initialize the animations for the weapon and configure them
     * @returns {void}
     */
    initializeAnimations() 
    {
        const animations = this.engine.resources.get(`${this.weapon.name}_AnimationsActions`);
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
    configureAnimation(name) 
    {
        const animation = this.animations[name];
        switch (name) {
            case `${this.weapon.name}_draw`:
            case `${this.weapon.name}_remove`:
                this.setupOnceAnimation(animation);
                break;
            case `${this.weapon.name}_jump`:
                this.setupJumpOnceAnimation(animation);
                break;
            case `${this.weapon.name}_reload`:
                this.setupLoopOnceAnimation(animation, animation._clip.duration / (this.weapon.reloadTime * 2));
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
    isWeaponM416() 
    {
        return this.weapon.name === "M416";
    }

    /**
     * @method isSniper
     * @description Check if the weapon is a sniper
     * @returns {boolean} - True if the weapon is a sniper
     */
    isSniper() 
    {
        return this.weapon.classification === WeaponEnum.SNIPER;
    }

    /**
     * @method getAnimationClipName
     * @description Get the animation clip name
     * @param {AnimationAction} animation - The animation action
     */
    getAnimationClipName(animation) 
    {
        return animation._clip.name;
    }

    /**
     * @method handleJumpAnimationFinished
     * @description Set the jumping state to false when the jump animation is finished and play the right animation based on the current state
     * @returns {void}
     */
    handleJumpAnimationFinished() 
    {
        this.states.jumping = false;

        if (this.states.running) {
            this.animations[`${this.weapon.name}_run`].play();
        } else if (this.states.walking) {
            this.animations[`${this.weapon.name}_walk`].play();
        } else {
            this.animations[`${this.weapon.name}_idle`].play();
        }
    }

    /**
     * @method setupOnceAnimation  
     * @description Setup the animation to play once, clamp when finished and set the time scale
     * @param {AnimationAction} animation - The animation action
     * @returns {void}
     */
    setupOnceAnimation(animation) 
    {
        animation.setLoop(THREE.LoopOnce);
        animation.clampWhenFinished = true;
        animation.timeScale = this.isWeaponM416() ? 0.8 : 2.0;
    }

    /** 
     * @method setupLoopOnceAnimation
     * @description Setup the animation to play once and set the time scale
     * @param {AnimationAction} animation - The animation action
     * @param {number} timeScale - The time scale
     * @returns {void}
     */
    setupLoopOnceAnimation(animation, timeScale = 1) 
    {
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
    setupJumpOnceAnimation(animation, timeScale = 1.2) 
    {
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
    setupLoopRepeatAnimation(animation, timeScale = 1.0) 
    {
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
    registerInputEvents() 
    {
        AnimationEventPipe.addEventListener(FirstPersonAnimationEvent.type, e => {
            if (e.detail.weapon !== this.weapon) return;
            this.playAnimation(e.detail.enum);
        });

        UserInputEventPipe.addEventListener(UserInputEvent.type, e => {
            this.handleUserInputEvent(e.detail.enum);
        });

        if (this.mixer) {
          this.mixer.addEventListener('finished', e => {
                if (e.type === 'finished') {
                    this.handleAnimationFinished(e);
                }
            });
        }
    }

    /** 
     * @method handleUserInputEvent
     * @description Handle the user input event
     * @param {UserInputEventEnum} inputEvent - The user input event
     * @returns {void}
     */
    handleUserInputEvent(inputEvent) 
    {
        switch (inputEvent) {
            case UserInputEventEnum.MOVE_FORWARD_DOWN:
            case UserInputEventEnum.MOVE_BACKWARD_DOWN:
                this.handleWalking(true);
                break;
            case UserInputEventEnum.MOVE_FORWARD_UP:
            case UserInputEventEnum.MOVE_BACKWARD_UP:
                this.handleWalking(false);
                break;
            case UserInputEventEnum.BUTTON_SHIFT_DOWN:
                this.handleRunning(true);
                break;
            case UserInputEventEnum.BUTTON_SHIFT_UP:
                this.handleRunning(false);
                break;
            case UserInputEventEnum.JUMP:
                this.handleJump();
                break;
            case UserInputEventEnum.BUTTON_ADS_DOWN:
                this.handleADS(true);
                break;
            case UserInputEventEnum.BUTTON_ADS_UP:
                this.handleADS(false);
                break;
        }
    }

    /** 
     * @method handleADS
     * @description Handle the aim down sight event
     * @param {boolean} isADS - True if the player is aiming down sight
     * @returns {void}
     */
    handleADS(isADS) 
    {
        if (!this.states.reloading && this.weapon.active) {
            if (!this.isSniper()) this.stopAllAnimations();
            this.states.ads = isADS;

            if (this.isSniper()) {
                this.handleSniperADSAnimation(isADS);
            } else {
                this.handleNormalADSAnimation(isADS);
            }
        }
    }


    /**
     * @method handleSniperADSAnimation
     * @description Handle the sniper aim down sight animation
     * @param {boolean} isADS - True if the player is aiming down sight
     * @returns {void}
     */
    handleSniperADSAnimation(isADS) 
    {
        if (isADS) {
            this.weapon.setVisible(false);
            this.weapon.scope.visible = true;
        } else {
            this.weapon.setVisible(true);
            this.weapon.scope.visible = false;
        }
    }

    /**
     * @method handleNormalADSAnimation
     * @description Handle the normal aim down sight animation
     * @param {boolean} isADS - True if the player is aiming down sight
     * @returns {void}
     */
    handleNormalADSAnimation(isADS) 
    {
        if (!isADS) {
            if(this.states.running) this.playOrStopAnimation(`${this.weapon.name}_run`, true);
            if(this.states.walking) this.playOrStopAnimation(`${this.weapon.name}_walk`, true);
            this.playOrStopAnimation(`${this.weapon.name}_idle`, true);
        } else {
            this.playOrStopAnimation(`${this.weapon.name}_ads_aim`, isADS);
        }
    }

    /** 
     * @method handleRunning
     * @description Handle the running event
     * @param {boolean} isRunning - True if the player is running
     * @returns {void}
     */
    handleRunning(isRunning) 
    {
        this.states.running = isRunning;

        if (!this.states.walking && !this.states.ads) {
            this.playAnimation(WeaponAnimationEventEnum.IDLE);
        }

        if (this.states.walking && !this.states.ads && !this.states.reloading) {
            this.playOrStopAnimation(`${this.weapon.name}_run`, this.states.running);
        }
    }

    /**
     * @method handleWalking
     * @description Handle the walking event
     * @param {boolean} isWalking - True if the player is walking
     * @returns {void}
     */
    handleWalking(isWalking) 
    {
        if (this.states.walking !== isWalking) {
            this.states.walking = isWalking;

            if (!this.states.walking && !this.states.ads) {
                this.playAnimation(WeaponAnimationEventEnum.IDLE);
            }
        }

        this.playOrStopAnimation(`${this.weapon.name}_walk`, this.states.walking && !this.states.running && !this.states.reloading && !this.states.ads);

        if (this.states.running) {
            this.playOrStopAnimation(`${this.weapon.name}_run`, this.states.running);
        }

        if (!this.states.walking) {
            this.playOrStopAnimation(`${this.weapon.name}_run`, false);
        }
    }

    /**
     * @method handleJump
     * @description Handle the jump event
     * @returns {void}
     */
    handleJump() 
    {
        if (this.states.jumping) return;
        this.states.jumping = true;
        this.playOrStopAnimation(`${this.weapon.name}_walk`, false);
        this.playOrStopAnimation(`${this.weapon.name}_run`, false);
        if (!this.states.ads) this.stopAndPlayAnimation(`${this.weapon.name}_jump`);
    }

    /**
     * @method handleAnimationFinished
     * @description Handle the animation finished event
     * @param {AnimationAction} e - The animation action
     * @returns {void}
     */
    handleAnimationFinished(e) 
    {
        const action = e.action;
        const clipName = this.getAnimationClipName(action);

        switch (clipName) {
            case this.getAnimationClipName(this.animations[`${this.weapon.name}_reload`]):
                this.handleReloadAnimationFinished();
                break;
            case this.getAnimationClipName(this.animations[`${this.weapon.name}_draw`]):
                this.handleDrawAnimationFinished();
                break;
            case this.getAnimationClipName(this.animations[`${this.weapon.name}_jump`]):
                this.handleJumpAnimationFinished();
                break;
            case this.getAnimationClipName(this.animations[`${this.weapon.name}_fire`]):
                this.handleIdleAnimation();
                break;
            case this.getAnimationClipName(this.animations[`${this.weapon.name}_ads_fire`]):
                this.handleAdsAnimation();
                break;
        }
    }

    /**
     * @method handleAdsAnimation
     * @description Handle the aim down sight animation
     * @returns {void}
     */
    handleAdsAnimation() 
    {
        this.stopAllAnimations();
        if (this.isSniper()) {
            this.playOrStopAnimation(`${this.weapon.name}_idle`, true);
        } else {
            this.playOrStopAnimation(`${this.weapon.name}_ads_aim`, true);
        }
    }

    /**
     * @method handleReloadAnimationFinished
     * @description Handle the reload animation finished event
     * @returns {void}
     */
    handleReloadAnimationFinished() 
    {
        this.weapon.setBulletLeft(this.weapon.magazineSize);
        this.weapon.setActive(true);
        this.states.reloading = false;
        this.playOrStopAnimation(`${this.weapon.name}_run`, this.states.running);
        this.playOrStopAnimation(`${this.weapon.name}_walk`, this.states.walking && !this.states.reloading);
        this.playAnimation(WeaponAnimationEventEnum.IDLE);
    }

    /**
     * @method handleDrawAnimationFinished
     * @description Handle the draw animation finished event
     * @returns {void}
     */
    handleDrawAnimationFinished() 
    {
        this.weapon.setActive(true);
        this.playAnimation(WeaponAnimationEventEnum.IDLE);
    }

    /**
     * @method playAnimation
     * @description Play the animation based on the event
     * @param {WeaponAnimationEventEnum} event - The weapon animation event
     * @returns {void}
     */
    playAnimation(event) 
    {
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
        }
    }

    /**
     * @method handleRemoveAnimation
     * @description Handle the remove animation
     * @returns {void}
     */
    handleRemoveAnimation() 
    {
        this.stopAllAnimations();
        this.weapon.setActive(false);
        this.weapon.setVisible(false);
    }

    /**
     * @method handleDrawAnimation
     * @description Handle the draw animation
     * @returns {void}
     */
    handleDrawAnimation() 
    {
        this.weapon.setVisible(true);
        this.weapon.setActive(false);
        this.stopAndPlayAnimation(`${this.weapon.name}_draw`);
    }


    /**
     * @method handleIdleAnimation
     * @description Handle the idle animation
     * @returns {void}
     */
    handleIdleAnimation() 
    {
        this.states.firing = false;
        this.stopAndPlayAnimation(`${this.weapon.name}_idle`);
    }

    /**
     * @method handleFireAnimation
     * @description Handle the fire animation
     * @returns {void}
     */
    handleFireAnimation() 
    {
        this.fadeOutAllAnimations(0.5);
        this.states.firing = true;

        if (this.isSniper() || !this.states.ads) {
            this.stopAndPlayAnimation(`${this.weapon.name}_fire`);

            if (this.isSniper()) {
                this.weapon.setVisible(true);
                this.weapon.scope.visible = false;
            }
        } else {
            this.stopAndPlayAnimation(`${this.weapon.name}_ads_fire`);
        }
    }

    /**
     * @method handleReloadAnimation
     * @description Handle the reload animation
     * @returns {void}
     */
    handleReloadAnimation() 
    {
        this.stopAllAnimations();
        this.states.reloading = true;
        this.stopAndPlayAnimation(`${this.weapon.name}_reload`);
    }

    /**
     * @method stopAndPlayAnimation
     * @description Stop and play the animation
     * @param {string} animationName - The name of the animation
     */
    stopAndPlayAnimation(animationName) 
    {
        this.animations[animationName].stop().reset().play();
    }

    /**
     * @method playOrStopAnimation
     * @description Play or stop the animation
     * @param {string} animationName - The name of the animation
     * @param {boolean} shouldPlay - True if the animation should play
     * @returns {void}
     */
    playOrStopAnimation(animationName, shouldPlay) 
    {
        if (shouldPlay) {
            this.animations[animationName].play();
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
    fadeOutAllAnimations(duration) 
    {
        Object.values(this.animations).forEach(animation => {
            animation.fadeOut(duration);
        });
    }

    /**
     * @method stopAllAnimations
     * @description Stop all the animations
     * @returns {void}
     */
    stopAllAnimations() 
    {
        Object.values(this.animations).forEach(animation => {
            animation.reset().stop();
        });

        Object.values(this.states).forEach(state => (state = false));
    }

    /**
     * @method getAnimationAction  
     * @description Get the animation action based on the name
     * @param {string} name - The name of the animation
     * @returns {AnimationAction} - The animation action
     */
    getAnimationAction(name) 
    {
        return this.animations[this.getAnimationClipName(name)];
    }

    /**
     * @method update
     * @description Update the animation manager
     * @returns {void}
     */
    update() 
    {
        this.mixer.update(this.engine.time.delta);
    }
}
