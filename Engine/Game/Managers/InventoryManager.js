import Engine from "@/Engine";

import { AnimationEventPipe, FirstPersonAnimationEvent } from "@Pipes/AnimationEventPipe";
import { UserInputEvent, UserInputEventPipe } from "@Pipes/UserInputEventPipe";
import { GameEventPipe, WeaponEquipEvent } from "@Pipes/GameEventPipe";

import { UserInputEventEnum, WeaponAnimationEventEnum } from "@Enums/EventsEnum";
import { InventoryEnum, mapIventorySlotByWeaponClassificationEnum } from "@Enums/InventoryEnum";

export default class InventoryManager
{
	constructor()
	{
		this.engine = new Engine();

		this.weapons = new Map();

		this.currentWeapon = InventoryEnum.HANDS;
		this.lastWeapon = InventoryEnum.MELEE;

		this.initialize();
	}

	initialize()
	{
		this.weapons.set(InventoryEnum.HANDS, null);
        this.switchWeapon(InventoryEnum.HANDS);

		this.registerEventListeners();
	}

	registerEventListeners()
	{
		UserInputEventPipe.addEventListener(UserInputEvent.type, (e) => this.handleUserInput(e));
    }

	handleUserInput(e)
	{
		switch (e.detail.enum) {
            case UserInputEventEnum.BUTTON_SWITCH_PRIMARY_WEAPON:
                this.switchWeapon(InventoryEnum.PRIMARY);
                break;
            case UserInputEventEnum.BUTTON_SWITCH_SECONDARY_WEAPON:
                this.switchWeapon(InventoryEnum.SECONDARY);
                break;
            case UserInputEventEnum.BUTTON_SWITCH_MELEE_WEAPON:
                this.switchWeapon(InventoryEnum.MELEE);
                break;
            case UserInputEventEnum.BUTTON_SWITCH_LAST_WEAPON:
                this.switchWeapon(this.lastWeapon);
                break;
        }
	}

	switchWeapon(targetInventory) 
	{
        if (this.currentWeapon === targetInventory) return;

        this.animateWeaponSwitch(this.currentWeapon, targetInventory);
        
        WeaponEquipEvent.detail.weapon = this.weapons.get(targetInventory);
        GameEventPipe.dispatchEvent(WeaponEquipEvent);
        
        this.lastWeapon = this.currentWeapon;
        this.currentWeapon = targetInventory;
    }

	animateWeaponSwitch(currentInventory, targetInventory) 
	{
        this.dispatchWeaponEvent(WeaponAnimationEventEnum.RELIEVE_EQUIP, currentInventory);
        this.dispatchWeaponEvent(WeaponAnimationEventEnum.EQUIP, targetInventory);
    }

    dispatchWeaponEvent(animationType, inventorySlot) 
	{
        if (this.weapons.get(inventorySlot)) {

            FirstPersonAnimationEvent.detail.enum = animationType;
            FirstPersonAnimationEvent.detail.weapon = this.weapons.get(inventorySlot);
            AnimationEventPipe.dispatchEvent(FirstPersonAnimationEvent);
        }
    }

	isWeaponAnimation(animationName, inventorySlot) 
	{
        const weapon = this.weapons.get(inventorySlot);
        return weapon && (animationName === weapon.animations.get('Wave'));
    }

	pickUp(weapon) 
	{
        const inventorySlot = mapIventorySlotByWeaponClassificationEnum(weapon.classification);
        if (!this.weapons.get(inventorySlot)) {
            this.weapons.set(inventorySlot, weapon);
        }
    }

	update() 
    {
        this.weapons.forEach(weapon => 
			{
            if (weapon && weapon.recover) {
                weapon.recover();
            }
        });

        const currentWeapon = this.weapons.get(this.currentWeapon);
        if (currentWeapon && currentWeapon.update) {
            currentWeapon.update();
        }
    }
}