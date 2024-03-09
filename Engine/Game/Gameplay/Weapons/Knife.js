import * as THREE from "three";
import Experience from "@/Experience";

import { WeaponEnum } from "@Enums/Weapon";
import DaggerWeapon from "./Components/DaggerWeapon";

export default class Knife extends DaggerWeapon
{
	constructor({ id })
	{
		super(id);

		this.experience = new Experience();

		this.chamberPosition = new THREE.Vector3(-0.4, 1, 1.3);

		this.initialize();
	}

	initialize()
	{
		this.setClassification(WeaponEnum.MELEE);
		this.setName("knife");
		this.setMagazineSize(30);
		this.setFireRate(100 / 600);
		this.setRecoverTime(0.001);
		this.setReloadTime(0);
		this.setRecoilControl(8);
		this.setAccurateRange(50);
		this.setBulletLeft(this.magazineSize);

		super.init();
	}
	
}