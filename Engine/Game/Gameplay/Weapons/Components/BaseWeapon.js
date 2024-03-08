

import * as THREE from "three";
import Engine from "@/Engine";

import { UserInputEventPipe, UserInputEvent } from "@Pipes/UserInputEventPipe";
import { AnimationEventPipe, FirstPersonAnimationEvent } from "@Pipes/AnimationEventPipe";
import { GameEventPipe, WeaponFireEvent } from "@Pipes/GameEventPipe";
import { UserInputEventEnum, WeaponAnimationEventEnum } from "@Enums/EventsEnum";
import { traverseGraph } from "@Utils/Three";

// import BulletHole from "../../Sprites/Weapons/BulletHole";
import WeaponSystem from "../WeaponSystem";
import { guns } from "../../../../Config/Guns";

export default class BaseWeapon
{
	constructor(id)
	{
		this.engine = new Engine();
		this.scene = this.engine.scenes.level;

		this.weaponSystem = new WeaponSystem();

		this.containerId = id;
		this.lastFireTime = 0;
		this.bulletLeft = null;
		this.bulletLeftMax = null;

		this.active = false;
	
		this.id = THREE.MathUtils.generateUUID();

		this.recoverLine = 0;
	
		this.guns = new Map();
		this.animationsActions = new Map();
	}

	init()
	{
		this.registerEventListeners();
		this.initWeapons();

		// this.smoke = new Smoke();
		// this.hole = new BulletHole();
	}

	registerEventListeners()
	{
		UserInputEventPipe.addEventListener(UserInputEvent.type, (e) => this.handleUserInput(e));
	}

	handleUserInput(e) 
    {   
        if(!this.active) return;
		switch (e.detail.enum) {
			case UserInputEventEnum.BUTTON_RELOAD:
				this.reloadWeapon();
				break;
			case UserInputEventEnum.BUTTON_TRIGGLE_DOWN:
				this.triggerWeapon();
				break;
		}
    }

	initWeapons()
	{	
		traverseGraph(this.engine.scenes.player, child => {
			guns.forEach(gun => {
				if(child.name === gun) {
					this.guns.set(child.name, child);
				}
			});
		})
		
		this.skinnedMesh = this.guns.get(this.name);
		this.armature = this.engine.resources.get(`${this.name}_Armature`);
	}

	reloadWeapon() 
	{
        if (this.magazineSize <= this.bulletLeft) return;
        this.setActive(false);
		this.dispatchAnimationWeapon(WeaponAnimationEventEnum.RELOAD);
    }

	triggerWeapon() 
	{
        if (!this.engine.pointLock.isLocked || this.bulletLeft <= 0 || !this.active) return;

        if (performance.now() - this.lastFireTime >= this.fireRate * 1000) {
            this.lastFireTime = performance.now();
            this.fire();
			
        }
    }

	update()
	{
		this.animationManager.update();
		this.engine.resources.get(`${this.name}_AnimationMixer`).update(this.engine.time.delta);
		// this.smoke.update();
		// this.hole.update();
	}


	/* 
	 * Events
	 */
    dispatchAnimationWeapon(animationType) 
	{
        FirstPersonAnimationEvent.detail.enum = animationType;
        FirstPersonAnimationEvent.detail.weapon = this;
        AnimationEventPipe.dispatchEvent(FirstPersonAnimationEvent);
    }

	dispatchWeaponFireEvent() 
	{
		WeaponFireEvent.detail.params = this.params;
        WeaponFireEvent.detail.weapon = this;
        GameEventPipe.dispatchEvent(WeaponFireEvent);
    }

	/* 
	 * Setters
	 */
	setVisible(visible)
	{
		this.armature.visible = visible;
	}

	setActive(active)
	{
		this.active = active;
	}

	setLastFireTime(lastFireTime)
	{
		this.lastFireTime = lastFireTime;
	}

	setBulletLeft(bulletLeft)
	{
		this.bulletLeft = bulletLeft;
	}

	setBulletLeftMax(bulletLeftMax)
	{
		this.bulletLeftMax = bulletLeftMax;
	}

	setId(id)
	{
		this.id = id;
	}

	setName(name)
	{
		this.name = name;
	}

	setSuffix(suffix)
	{
		this.suffix = suffix;
	}

	setClassification(classification)
	{
		this.classification = classification;
	}

	setMagazineSize(magazineSize)
	{
		this.magazineSize = magazineSize;
	}

	setRecoverTime(recoverTime)
	{
		this.recoverTime = recoverTime;
	}

	setReloadTime(reloadTime)
	{
		this.reloadTime = reloadTime;
	}

	setSpeed(speed)
	{
		this.speed = speed;
	}

	setKillaward(killaward)
	{
		this.killaward = killaward;
	}

	setDamage(damage)
	{
		this.damage = damage;
	}

	setFireRate(fireRate)
	{
		this.fireRate = fireRate;
	}

	setRecoilControl(recoilControl)
	{
		this.recoilControl = recoilControl;
	}

	setAccurateRange(accurateRange)
	{
		this.accurateRange = accurateRange;
	}

	setArmorPenetration(armorPenetration)
	{
		this.armorPenetration = armorPenetration;
	}

	setMuzzlePosition(muzzlePosition)
	{
		this.muzzlePosition = muzzlePosition;
	}

	setChamberPosition(chamberPosition)
	{
		this.chamberPosition = chamberPosition;
	}
}