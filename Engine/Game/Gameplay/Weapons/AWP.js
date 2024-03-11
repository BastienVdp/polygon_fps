import * as THREE from 'three';
import { WeaponEnum } from "@Enums/WeaponEnum";
import SemiAutomaticWeapon from "./Components/SemiAutomaticWeapon";

export default class AWP extends SemiAutomaticWeapon
{
	constructor({ camera, id})
	{
		super(camera, id);

		this.chamberPosition = new THREE.Vector3(-0.3, .8, 1.3);

		this.initialize();
	}

	initialize()
	{
		this.setClassification(WeaponEnum.SNIPER);
		this.setName("AWP");
		this.setMagazineSize(12);
		this.setBulletLeftMax(12);
		this.setFireRate(90 / 60);
		this.setRecoverTime(0.34);
		this.setReloadTime(1);
		this.setRecoilControl(1.5);
		this.setAccurateRange(120);
		this.setBulletLeft(this.magazineSize);

		this.init();
	}

}