import { UserInputEventEnum } from "@Enums/Events";
import BaseWeapon from "./BaseWeapon";
import AnimationManager from "@Gameplay/Manager/AnimationManager";

import { WeaponAnimationEventEnum } from "@Enums/Events";
export default class DaggerWeapon extends BaseWeapon
{
	constructor(id)
	{
		super(id);

		
	}

	init()
	{
		this.animationManager = new AnimationManager({ weapon: this });

		super.init();
	}

	handleUserInput(e) 
    {   
        if(!this.active) return;
		switch (e.detail.enum) {
			case UserInputEventEnum.BUTTON_TRIGGLE_DOWN:
				this.triggerWeapon();
				break;
		}
    }

	fire()
	{
		console.log('fire dagger');
		this.dispatchAnimationWeapon(WeaponAnimationEventEnum.FIRE);
	}
}