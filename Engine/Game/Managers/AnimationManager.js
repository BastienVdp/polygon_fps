import * as THREE from 'three';

import Engine from '@/Engine';

import { AnimationEventPipe, FirstPersonAnimationEvent } from '@Pipes/AnimationEventPipe';
import { WeaponAnimationEventEnum } from '@Enums/EventsEnum';

export default class AnimationManager
{
	constructor({ weapon })
	{
		this.engine = new Engine();

		this.weapon = weapon;

		this.animations = [];

		this.initialize();
	}

	initialize()
	{
		this.registerInputEvents();
		this.initializeAnimations();
	}

	initializeAnimations()
	{
		const animations = this.engine.resources.get(`${this.weapon.name}_AnimationsActions`);
		animations.forEach((animation, name) => {
			this.animations[name] = animation;
			switch (name) {
				case `${this.weapon.name}_draw`:
					this.animations[name].setLoop(THREE.LoopOnce);
					this.animations[name].clampWhenFinished = true;
					break;
				case `${this.weapon.name}_jump`:
				case `${this.weapon.name}_remove`:
				case `${this.weapon.name}_reload`:
				case `${this.weapon.name}_ads_aim`:
					this.animations[name].setLoop(THREE.LoopOnce);
					break;
				case `${this.weapon.name}_run`:
				case `${this.weapon.name}_walk`:
				case `${this.weapon.name}_idle`:
				case `${this.weapon.name}_fire`:
				case `${this.weapon.name}_ads_fire`:
					this.animations[name].setLoop(THREE.LoopRepeat);
					break;
			}
		});
	}

	registerInputEvents()
	{
		AnimationEventPipe.addEventListener(FirstPersonAnimationEvent.type, e => {
			if(e.detail.weapon !== this.weapon) return;
			this.playAnimation(e.detail.enum);
		});

		// Adapter for the animation mixer

		this.engine.resources.get(`${this.weapon.name}_AnimationMixer`).addEventListener('finished', e => {
			if(e.type === 'finished') {
				if(
					e.action._clip.name === this.animations[`${this.weapon.name}_reload`]._clip.name
				) {
					this.weapon.setBulletLeft(this.weapon.magazineSize);
					this.weapon.setActive(true);
				}

				if(
					e.action._clip.name === this.animations[`${this.weapon.name}_draw`]._clip.name
				) {
					this.weapon.setActive(true);
				}
			}
		});
	}

	playAnimation(event)
	{
		const wpName = this.weapon.name;
		switch (event) {
			case WeaponAnimationEventEnum.RELIEVE_EQUIP: 
				this.weapon.setVisible(false); 
				this.weapon.setActive(false); 
				this.resetAnimations(wpName);
				break;
			case WeaponAnimationEventEnum.EQUIP:
				this.weapon.setVisible(true); 
				this.animations[`${wpName}_draw`].reset();
				this.animations[`${wpName}_draw`].play();
				this.weapon.setActive(false);
				break;
			case WeaponAnimationEventEnum.FIRE:
				this.animations[`${wpName}_fire`].reset();
				this.animations[`${wpName}_fire`].play();
				break;
			case WeaponAnimationEventEnum.RELOAD: 
				this.animations[`${wpName}_reload`].reset();
				this.animations[`${wpName}_reload`].play();
				this.weapon.setActive(false);
				break;
		}
	}

	resetAnimations(weaponName)
	{
		this.engine.resources.get(`${this.weapon.name}_AnimationMixer`).stopAllAction();
		if (this.animations[`${weaponName}_fire`]) this.animations[`${weaponName}_shoot`].reset();
		if (this.animations[`${weaponName}_reload`]) this.animations[`${weaponName}_reload`].reset();
		if (this.animations[`${weaponName}_draw`]) this.animations[`${weaponName}_equip`].reset();
	}

	update()
	{
		console.log('update')
		this.engine.resources.get(`${this.weapon.name}_AnimationMixer`).update(this.engine.time.delta);
	}
}