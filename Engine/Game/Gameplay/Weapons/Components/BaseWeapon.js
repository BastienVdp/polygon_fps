
import * as THREE from "three";
import Engine from "@/Engine";

import WeaponSystem from "../WeaponSystem";

import { 
	UserInputEventPipe, 
	UserInputEvent 
} from "@Pipes/UserInputEventPipe";
import { 
	AnimationEventPipe, 
	FirstPersonAnimationEvent 
} from "@Pipes/AnimationEventPipe";
import { 
	GameEventPipe, 
	WeaponFireEvent 
} from "@Pipes/GameEventPipe";
import { 
	UserInputEventEnum, 
	WeaponAnimationEventEnum 
} from "@Enums/EventsEnum";

import { WeaponEnum } from "@Enums/WeaponEnum";

import { guns } from "@Config/Guns";
import { traverseGraph } from "@Utils/Three";
import { SniperWeanponAimEvent } from "../../../../Pipes/GameEventPipe";

const { RELOAD } = WeaponAnimationEventEnum;

const { 
	BUTTON_RELOAD, 
	BUTTON_TRIGGLE_DOWN,
	BUTTON_ADS_DOWN,
	BUTTON_ADS_UP
} = UserInputEventEnum;

import vertexShader from "@Assets/shaders/scope/vertex.glsl";
import fragmentShader from "@Assets/shaders/scope/fragment.glsl";
export default class BaseWeapon
{
	constructor(id)
	{
		this.engine = new Engine();
		this.scene = this.engine.scenes.level;

		this.weaponSystem = new WeaponSystem();

		this.lastFireTime = 0;
		this.bulletLeft = null;
		this.bulletLeftMax = null;

		this.active = false;
	
		this.id = THREE.MathUtils.generateUUID();

		this.recoverLine = 0;
		this.startRecover = true; 
		this.startRecoverLine = 0; 
		this.cameraRotateTotalX = 0; 
		this.cameraRotateTotalY = 0;
		this.cameraRotationBasicTotal = 0; 
		this.recovercameraRotateTotalX = 0; 
		this.recovercameraRotateTotalY = 0;
		this.bPointRecoiledScreenCoord = new THREE.Vector2(); 

	
		this.guns = new Map();
		this.animationsActions = new Map();
	}

	init()
	{
		this.registerEventListeners();
		this.initWeapons();

		if(this.classification === WeaponEnum.SNIPER) {
			this.initSniperScope();
		}
	}

	initSniperScope()
	{
		this.scope = new THREE.Mesh(
			new THREE.PlaneGeometry(1, 1),
			new THREE.ShaderMaterial({
				transparent: true,
				side: THREE.DoubleSide,
				vertexShader: vertexShader,
				fragmentShader: fragmentShader,
			})
		);
		this.scope.position.z = -0.2;
		// this.scope.rotation.y = Math.PI;
		this.scope.position.y = 0.2;
		this.scope.visible = false;
		this.engine.scenes.player.add(this.scope);
	}

	registerEventListeners()
	{
		UserInputEventPipe.addEventListener(UserInputEvent.type, (e) => this.handleUserInput(e));
	}

	handleUserInput(e) 
    {   
        if(!this.active) return;
		switch (e.detail.enum) {
			case BUTTON_RELOAD:
				this.reloadWeapon();
				break;
			case BUTTON_TRIGGLE_DOWN:
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
		console.log('reloadWeapon');
		// Si le chargeur est plein ou qu'il n'y a plus de balles, on ne recharge pas
		if(this.bulletLeft === this.magazineSize || (this.bulletLeftMax) <= 0) return;
		this.setActive(false);
		if(this.bulletLeftMax >= this.magazineSize) {
			this.dispatchAnimationWeapon(RELOAD);

		} else {
			this.setBulletLeftMax(0);
		}
		this.setBulletLeftMax(this.bulletLeftMax - (this.magazineSize - this.bulletLeft));

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
		WeaponFireEvent.detail.params = { bPointRecoiledScreenCoord: this.bPointRecoiledScreenCoord, bulletCount: this.bulletLeft };
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