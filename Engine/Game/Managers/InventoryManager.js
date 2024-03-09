import Engine from "@/Engine";

import { AnimationEventPipe, FirstPersonAnimationEvent } from "@Pipes/AnimationEventPipe";
import { UserInputEvent, UserInputEventPipe } from "@Pipes/UserInputEventPipe";
import { GameEventPipe, WeaponEquipEvent } from "@Pipes/GameEventPipe";

import { UserInputEventEnum, WeaponAnimationEventEnum } from "@Enums/EventsEnum";
import { InventoryEnum, mapIventorySlotByWeaponClassificationEnum } from "@Enums/InventoryEnum";

const {
    BUTTON_SWITCH_PRIMARY_WEAPON,
    BUTTON_SWITCH_SECONDARY_WEAPON,
    BUTTON_SWITCH_MELEE_WEAPON,
    BUTTON_SWITCH_LAST_WEAPON
} = UserInputEventEnum;

/**
 * InventoryManager class
 * @class InventoryManager
 * @description Manages the player's inventory and weapons.
 */
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

    /**
     * Initialize the inventory manager
     * @method initialize
     * @description Initializes the inventory manager.
     */
	initialize()
	{
		this.weapons.set(InventoryEnum.HANDS, null);
        this.switchWeapon(InventoryEnum.HANDS);

		this.registerEventListeners();
	}

    /**
     * Register event listeners
     * @method registerEventListeners
     * @description Registers event listeners for the inventory manager.
     */
	registerEventListeners()
	{
		UserInputEventPipe.addEventListener(UserInputEvent.type, (e) => this.handleUserInput(e));
    }

    /**
     * Handle user input
     * @method handleUserInput
     * @description Handles user input for the inventory manager.
     * @param {Object} e - The user input event.
     */
	handleUserInput(e)
	{
		switch (e.detail.enum) {
            case BUTTON_SWITCH_PRIMARY_WEAPON:
                this.switchWeapon(InventoryEnum.PRIMARY);
                break;
            case BUTTON_SWITCH_SECONDARY_WEAPON:
                this.switchWeapon(InventoryEnum.SECONDARY);
                break;
            case BUTTON_SWITCH_MELEE_WEAPON:
                this.switchWeapon(InventoryEnum.MELEE);
                break;
            case BUTTON_SWITCH_LAST_WEAPON:
                this.switchWeapon(this.lastWeapon);
                break;
        }
	}

    /**
     * Switch weapon
     * @method switchWeapon
     * @description Switches the player's weapon.
     * @param {String} targetInventory - The target inventory slot.
     */
	switchWeapon(targetInventory) 
	{
        if (this.currentWeapon === targetInventory) return;

        this.animateWeaponSwitch(this.currentWeapon, targetInventory);
        
        WeaponEquipEvent.detail.weapon = this.weapons.get(targetInventory);
        GameEventPipe.dispatchEvent(WeaponEquipEvent);
        
        this.lastWeapon = this.currentWeapon;
        this.currentWeapon = targetInventory;
    }

    /**
     * Animate weapon switch
     * @method animateWeaponSwitch
     * @description Animates the player's weapon switch.
     * @param {String} currentInventory - The current inventory slot.
     * @param {String} targetInventory - The target inventory slot.
     */
	animateWeaponSwitch(currentInventory, targetInventory) 
	{
        console.log('animateWeaponSwitch', currentInventory, targetInventory);
        this.dispatchWeaponEvent(WeaponAnimationEventEnum.REMOVE, currentInventory);
        this.dispatchWeaponEvent(WeaponAnimationEventEnum.DRAW, targetInventory);
    }

    /**
     * Dispatch weapon event
     * @method dispatchWeaponEvent
     * @description Dispatches a weapon event.
     * @param {String} animationType - The animation type.
     * @param {String} inventorySlot - The inventory slot.
     * @emits FirstPersonAnimationEvent
     */
    dispatchWeaponEvent(animationType, inventorySlot) 
	{
        if (this.weapons.get(inventorySlot)) {

            FirstPersonAnimationEvent.detail.enum = animationType;
            FirstPersonAnimationEvent.detail.weapon = this.weapons.get(inventorySlot);
            AnimationEventPipe.dispatchEvent(FirstPersonAnimationEvent);
        }
    }

    /**
     * Is weapon animation
     * @method isWeaponAnimation
     * @description Determines if the animation is a weapon animation.
     * @param {String} animationName - The animation name.
     * @param {String} inventorySlot - The inventory slot.
     * @returns {Boolean} - Whether or not the animation is a weapon animation.
     */
	isWeaponAnimation(animationName, inventorySlot) 
	{
        const weapon = this.weapons.get(inventorySlot);
        return weapon && (animationName === weapon.animations.get('Wave'));
    }

    /**
     * Pick up a weapon
     * @method pickUp
     * @description Adds a weapon to the player's inventory.
     * @param {Object} weapon - The weapon to pick up.
     */
	pickUp(weapon) 
	{
        const inventorySlot = mapIventorySlotByWeaponClassificationEnum(weapon.classification);
        if (!this.weapons.get(inventorySlot)) {
            this.weapons.set(inventorySlot, weapon);
        }
    }

    /**
     * Update the inventory manager
     * @method update
     * @description Updates the inventory manager.
     */
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