import * as THREE from 'three';
import Engine from '@/Engine';
import {
    AnimationEventPipe,
    FirstPersonAnimationEvent
} from '@Pipes/AnimationEventPipe';
import {
    UserInputEventPipe,
    UserInputEvent
} from '@Pipes/UserInputEventPipe';
import {
    WeaponAnimationEventEnum,
    UserInputEventEnum
} from '@Config/Enums/EventsEnum';

const {
    REMOVE,
    DRAW,
    IDLE,
    FIRE,
    RELOAD
} = WeaponAnimationEventEnum;

/**
 * AnimationManager class
 * @class AnimationManager
 * @description Manages the animations for the weapons.
 */
export default class AnimationManager 
{

    /**
     * Constructor
     * @constructor
     * @param {Object} weapon - The weapon to manage the animations for.
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

    initialize() 
    {
        this.registerInputEvents();
        this.initializeAnimations();
    }

    /**
     * Initialize the animations for the weapon
     * @method initializeAnimations
     * @description Initializes the animations for the weapon.
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
     * Configure the animation
     * @method configureAnimation
     * @description Configures the animation based on the name.
     * @param {String} name - The name of the animation.
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
                this.setupLoopOnceAnimation(animation, 0.6);
                break;
            case `${this.weapon.name}_reload`:
            case `${this.weapon.name}_ads_aim`:
            case `${this.weapon.name}_fire`:
                this.setupLoopOnceAnimation(animation);
                break;
            case `${this.weapon.name}_idle`:
                this.setupLoopRepeatAnimation(animation, 0.8);
                break;
            case `${this.weapon.name}_ads_fire`:
            case `${this.weapon.name}_walk`:
                this.setupLoopRepeatAnimation(animation);
                break;
            case `${this.weapon.name}_run`:
                this.setupLoopRepeatAnimation(animation, 0.8);
                break;
        }

        if (this.isWeaponM416() && name === "M416_jump") {
            animation.timeScale = 0.4;
        }

        if (this.isWeaponM416() && name === "M416_draw") {
            animation.timeScale = 0.5;
        }
    }

    /**
     * isWeaponM416
     * @method isWeaponM416
     * @returns {Boolean} - Whether the weapon is an M416.
     */
    isWeaponM416() 
    {
        return this.weapon.name === "M416";
    }

    /**
     * getAnimationClipName
     * @method getAnimationClipName
     * @description Gets the name of the animation clip.
     * @param {THREE.AnimationAction} animation - The animation action.
     */
    getAnimationClipName(animation) 
    {
        return animation._clip.name;
    }

    /**
     * isWeaponM416
     * @method isWeaponM416
     * @description Whether the weapon is an M416.
     * @returns {Boolean} - Whether the weapon is an M416.
     */
    isWeaponM416() 
    {
        return this.weapon.name === "M416";
    }

    /**
     * handleJumpAnimationFinished
     * @method handleJumpAnimationFinished
     * @description Handles the jump animation finished event.
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
     * setupOnceAnimation
     * @method setupOnceAnimation
     * @description Sets up the animation to loop once.
     * @param {THREE.AnimationAction} animation - The animation action.
     */
    setupOnceAnimation(animation) 
    {
        animation.setLoop(THREE.LoopOnce);
        animation.clampWhenFinished = true;
    }

    /**
     * setupLoopOnceAnimation
     * @method setupLoopOnceAnimation
     * @description Sets up the animation to loop once.
     * @param {THREE.AnimationAction} animation - The animation action.
     * @param {Number} timeScale - The time scale for the animation.
     */
    setupLoopOnceAnimation(animation, timeScale = 1) 
    {
        animation.setLoop(THREE.LoopOnce);
        animation.timeScale = timeScale
    }

    /**
     * setupLoopRepeatAnimation
     * @method setupLoopRepeatAnimation
     * @description Sets up the animation to loop repeat.
     * @param {THREE.AnimationAction} animation - The animation action.
     * @param {Number} timeScale - The time scale for the animation.
     */
    setupLoopRepeatAnimation(animation, timeScale = 1.0) 
    {
        animation.setLoop(THREE.LoopRepeat);
        animation.timeScale = timeScale;
    }

    /**
     * registerInputEvents
     * @method registerInputEvents
     * @description Registers the input events for the animation manager.
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

        console.log(this.engine.resources);;
        this.engine.resources.get(`${this.weapon.name}_AnimationMixer`).addEventListener('finished', e => {
            if (e.type === 'finished') {
                this.handleAnimationFinished(e);
            }
        });
    }

    /**
     * handleUserInputEvent
     * @method handleUserInputEvent
     * @description Handles the user input event.
     * @param {UserInputEventEnum} inputEvent - The user input event.
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
        }
    }

    /**
     * handleRunning
     * @method handleRunning
     * @description Handles the running state.
     * @param {Boolean} isRunning - Whether the player is running.
     */
    handleRunning(isRunning) 
    {
        if(!this.states.walking && isRunning) return;
        if (this.states.running !== isRunning) {
            this.states.running = isRunning;

            if (!this.states.running) {
                this.playAnimation(IDLE);
            }
        }
        
        this.playOrStopAnimation(`${this.weapon.name}_run`, this.states.running);
    }

    /**
     * handleWalking
     * @method handleWalking
     * @description Handles the walking state.
     * @param {Boolean} isWalking - Whether the player is walking.
     */
    handleWalking(isWalking) 
    {
        if (this.states.walking !== isWalking) {
            this.states.walking = isWalking;

            if (!this.states.walking) {
                this.playAnimation(IDLE);
            }
        }

        this.playOrStopAnimation(`${this.weapon.name}_walk`, this.states.walking && !this.states.reloading);
    }

    /**
     * handleJump
     * @method handleJump
     * @description Handles the jump state.
     */
    handleJump() 
    {
        this.states.jumping = true;
        this.playOrStopAnimation(`${this.weapon.name}_walk`, false);
        this.playOrStopAnimation(`${this.weapon.name}_run`, false);
        this.stopAndPlayAnimation(`${this.weapon.name}_jump`);
    }

    /**
     * handleAnimationFinished
     * @method handleAnimationFinished
     * @description Handles the animation finished event.
     * @param {Event} e - The event.
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
            case this.getAnimationClipName(this.animations[`${this.weapon.name}_remove`]):
                this.handleRemoveAnimationFinished();
                break;
            case this.getAnimationClipName(this.animations[`${this.weapon.name}_jump`]):
                this.handleJumpAnimationFinished();
                break;
            case this.getAnimationClipName(this.animations[`${this.weapon.name}_fire`]):
                this.handleIdleAnimation();
                break;
        }
    }

    /**
     * handleReloadAnimationFinished
     * @method handleReloadAnimationFinished
     * @description Handles the reload animation finished event.
     */
    handleReloadAnimationFinished() 
    {
        this.weapon.setBulletLeft(this.weapon.magazineSize);
        this.weapon.setActive(true);
        this.states.reloading = false;
        this.playOrStopAnimation(`${this.weapon.name}_run`, this.states.running);
        this.playOrStopAnimation(`${this.weapon.name}_walk`, this.states.walking && !this.states.reloading);
        this.playAnimation(IDLE);
    }

    /**
     * handleDrawAnimationFinished
     * @method handleDrawAnimationFinished
     * @description Handles the draw animation finished event.
     */
    handleDrawAnimationFinished() 
    {
        this.weapon.setActive(true);
        this.playAnimation(IDLE);
    }

    /**
     * handleRemoveAnimationFinished
     * @method handleRemoveAnimationFinished
     * @description Handles the remove animation finished event.
     * @param {Event} e - The event.
     */
    handleRemoveAnimationFinished() 
    {
        this.weapon.setActive(false);
        this.weapon.setVisible(false);
    }

    /**
     * playAnimation
     * @method playAnimation
     * @description Plays the animation based on the event.
     * @param {WeaponAnimationEventEnum} event - The weapon animation event.
     */
    playAnimation(event) 
    {
        switch (event) {
            case REMOVE:
                this.handleRemoveAnimation();
                this.handleRemoveAnimationFinished();
                break;
            case DRAW:
                this.handleDrawAnimation();
                break;
            case IDLE:
                this.handleIdleAnimation();
                break;
            case FIRE:
                this.handleFireAnimation();
                break;
            case RELOAD:
                this.handleReloadAnimation();
                break;
        }
    }

    /**
     * handleRemoveAnimation
     * @method handleRemoveAnimation
     * @description Handles the remove animation.
     */
    handleRemoveAnimation() 
    {
        this.weapon.setActive(false);
        this.stopAllAnimations();
        this.fadeOutAllAnimations(0.5);
    }

    /**
     * handleDrawAnimation
     * @method handleDrawAnimation
     * @description Handles the draw animation.
     */
    handleDrawAnimation() 
    {
        this.weapon.setVisible(true);
        this.stopAndPlayAnimation(`${this.weapon.name}_draw`);
        this.weapon.setActive(false);
    }

    /**
     * handleIdleAnimation
     * @method handleIdleAnimation
     * @description Handles the idle animation.
     */
    handleIdleAnimation() 
    {
        this.stopAndPlayAnimation(`${this.weapon.name}_idle`);
    }


    /**
     * handleFireAnimation
     * @method handleFireAnimation
     * @description Handles the fire animation.
     */
    handleFireAnimation() 
    {
        // this.stopAndPlayAnimation(`${this.weapon.name}_idle`);
        this.fadeOutAllAnimations(0.5);
        this.stopAndPlayAnimation(`${this.weapon.name}_fire`);
    }


    /**
     * handleReloadAnimation
     * @method handleReloadAnimation
     * @description Handles the reload animation.
     */
    handleReloadAnimation() 
    {
        this.states.reloading = true;
        this.stopAndPlayAnimation(`${this.weapon.name}_reload`);
    }


    /**
     * stopAndPlayAnimation
     * @method stopAndPlayAnimation
     * @description Stops and plays the animation.
     * @param {String} animationName - The name of the animation.
     */
    stopAndPlayAnimation(animationName) 
    {
        this.animations[animationName].stop().reset().play();
    }

    /**
     * playOrStopAnimation
     * @method playOrStopAnimation
     * @description Plays or stops the animation.
     * @param {String} animationName - The name of the animation.
     * @param {Boolean} shouldPlay - Whether the animation should play.
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
     * fadeOutAllAnimations
     * @method fadeOutAllAnimations
     * @description Fades out all animations.
     * @param {Number} duration - The duration of the fade out.
     */
    fadeOutAllAnimations(duration) 
    {
        Object.values(this.animations).forEach(animation => {
            animation.fadeOut(duration);
        });
    }

    /**
     * stopAllAnimations
     * @method stopAllAnimations
     * @description Stops all animations.
     */
    stopAllAnimations() 
    {
        Object.values(this.animations).forEach(animation => {
            animation.reset().stop();
        });
    }

    /**
     * update
     * @method update
     * @description Updates the animation manager.
     */
    update() 
    {
        this.engine.resources.get(`${this.weapon.name}_AnimationMixer`).update(this.engine.time.delta);
    }
}
