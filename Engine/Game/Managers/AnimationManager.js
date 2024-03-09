import * as THREE from 'three';
import Engine from '@/Engine';
import { AnimationEventPipe, FirstPersonAnimationEvent } from '@Pipes/AnimationEventPipe';
import { UserInputEventPipe, UserInputEvent } from '@Pipes/UserInputEventPipe';
import { WeaponAnimationEventEnum } from '@Enums/EventsEnum';
import { UserInputEventEnum } from '../../Config/Enums/EventsEnum';

export default class AnimationManager {
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
            firing: false
        };
        this.initialize();
    }

    initialize() {
        this.registerInputEvents();
        this.initializeAnimations();
    }

    initializeAnimations() {
        const animations = this.engine.resources.get(`${this.weapon.name}_AnimationsActions`);
        animations.forEach((animation, name) => {
            this.animations[name] = animation;
            this.configureAnimation(name);
        });
    }

    configureAnimation(name) {
        const animation = this.animations[name];

        switch (name) {
            case `${this.weapon.name}_draw`:
            case `${this.weapon.name}_remove`:
                animation.setLoop(THREE.LoopOnce);
                animation.clampWhenFinished = true;
                break;
            case `${this.weapon.name}_jump`:
				animation.setLoop(THREE.LoopOnce);
				animation.timeScale = 0.6;
				break;
            case `${this.weapon.name}_reload`:
            case `${this.weapon.name}_ads_aim`:
            case `${this.weapon.name}_fire`:
                animation.setLoop(THREE.LoopOnce);
                break;
            case `${this.weapon.name}_idle`:
            case `${this.weapon.name}_ads_fire`:
            case `${this.weapon.name}_walk`:
                animation.setLoop(THREE.LoopRepeat);
                break;
            case `${this.weapon.name}_run`:
                animation.setLoop(THREE.LoopRepeat);
                animation.timeScale = 0.8;
                break;
        }
    }

    registerInputEvents() {
		AnimationEventPipe.addEventListener(FirstPersonAnimationEvent.type, e => {
			if (e.detail.weapon !== this.weapon) return;
			this.playAnimation(e.detail.enum);
		});
	
		UserInputEventPipe.addEventListener(UserInputEvent.type, e => {
			switch (e.detail.enum) {
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
		});
	
		this.engine.resources.get(`${this.weapon.name}_AnimationMixer`).addEventListener('finished', e => {
			if (e.type === 'finished') {
				this.handleAnimationFinished(e);
			}
		});
	}
	
	handleRunning(isRunning) {
		if (this.states.running !== isRunning) {
			this.states.running = isRunning;
	
			if (!this.states.running) {
				// Si l'utilisateur ne court plus, passer à l'animation idle
				this.playAnimation(WeaponAnimationEventEnum.IDLE);
			}
		}
	
		if (this.states.running) {
			this.animations[`${this.weapon.name}_run`].play();
		} else {
			this.animations[`${this.weapon.name}_run`].reset();
			this.animations[`${this.weapon.name}_run`].stop();
		}
	}

    handleWalking(isWalking) {
		if (this.states.walking !== isWalking) {
			this.states.walking = isWalking;
	
			if (!this.states.walking) {
				// Si l'utilisateur ne marche plus, passer à l'animation idle
				this.playAnimation(WeaponAnimationEventEnum.IDLE);
			}
		}
	
		if (this.states.walking) {
			this.animations[`${this.weapon.name}_walk`].play();
		} else {
			this.animations[`${this.weapon.name}_walk`].reset();
			this.animations[`${this.weapon.name}_walk`].stop();
		}
	}

	handleJump()
	{
		this.states.jumping = true;
		this.animations[`${this.weapon.name}_jump`].reset();
		this.animations[`${this.weapon.name}_jump`].play();
	}

	crossFadeToIdle() {
        const crossFadeDuration = 0.5;

        this.animations[`${this.weapon.name}_walk`].reset().crossFadeTo(this.animations[`${this.weapon.name}_idle`], crossFadeDuration, true);
        this.animations[`${this.weapon.name}_run`].reset().crossFadeTo(this.animations[`${this.weapon.name}_idle`], crossFadeDuration, true);
    }

    handleAnimationFinished(e) {
        const action = e.action;
        const clipName = action._clip.name;

        switch (clipName) {
            case this.animations[`${this.weapon.name}_reload`]._clip.name:
                this.handleReloadAnimationFinished();
                break;
            case this.animations[`${this.weapon.name}_draw`]._clip.name:
                this.handleDrawAnimationFinished();
                break;
            case this.animations[`${this.weapon.name}_remove`]._clip.name:
                this.handleRemoveAnimationFinished();
                break;
			case this.animations[`${this.weapon.name}_jump`]._clip.name:
				this.states.jumping = false;
				break;
			case this.animations[`${this.weapon.name}_fire`]._clip.name:
				this.handleIdleAnimation();
				break;
        }
    }

    handleReloadAnimationFinished() {
        this.weapon.setBulletLeft(this.weapon.magazineSize);
        this.weapon.setActive(true);
    }

    handleDrawAnimationFinished() {
        this.weapon.setActive(true);
        this.playAnimation(WeaponAnimationEventEnum.IDLE);
    }

    handleRemoveAnimationFinished() {
        this.weapon.setActive(false);
        this.weapon.setVisible(false);
    }

    playAnimation(event) {
        const wpName = this.weapon.name;

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

    handleRemoveAnimation() {
        this.weapon.setActive(false);
        this.engine.resources.get(`${this.weapon.name}_AnimationMixer`).stopAllAction();
        Object.values(this.animations).forEach(animation => {
            animation.reset();
            animation.fadeOut(0.5);
        });
        // this.animations[`${this.weapon.name}_remove`].play();
    }

    handleDrawAnimation() 
	{
        this.weapon.setVisible(true);
        this.animations[`${this.weapon.name}_draw`].reset();
        this.animations[`${this.weapon.name}_draw`].play();
        this.weapon.setActive(false);
    }

	handleIdleAnimation() 
	{
		this.animations[`${this.weapon.name}_idle`].reset();
		this.animations[`${this.weapon.name}_idle`].play();
	}

	handleFireAnimation() 
	{
		this.animations[`${this.weapon.name}_idle`].stop();
		this.animations[`${this.weapon.name}_fire`].reset();
		this.animations[`${this.weapon.name}_fire`].play();
	}

	handleReloadAnimation()
	{
		this.animations[`${this.weapon.name}_reload`].reset();
		this.animations[`${this.weapon.name}_reload`].play();
	}

    resetAnimations() {
        this.engine.resources.get(`${this.weapon.name}_AnimationMixer`).stopAllAction();
        Object.values(this.animations).forEach(animation => {
            animation.reset();
            animation.fadeOut(0.5);
        });
    }

    update() {
        this.engine.resources.get(`${this.weapon.name}_AnimationMixer`).update(this.engine.time.delta);
    }
}