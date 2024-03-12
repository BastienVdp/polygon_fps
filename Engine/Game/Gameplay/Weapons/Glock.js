import * as THREE from 'three';
import { WeaponEnum } from "@Enums/WeaponEnum";
import SemiAutomaticWeapon from "./Components/SemiAutomaticWeapon";

export default class Glock extends SemiAutomaticWeapon
{
	constructor({ camera })
	{
		super(camera);

		this.chamberPosition = new THREE.Vector3(-0.3, .8, 1.3);

		this.initialize();
	}

	initialize()
	{
		this.setClassification(WeaponEnum.PISTOL);
		this.setName("Glock");
		this.setMagazineSize(12);
		this.setBulletLeftMax(48);
		this.setFireRate(17 / 60);
		this.setRecoverTime(0.34);
		this.setReloadTime(1);
		this.setRecoilControl(5);
		this.setAccurateRange(120);
		this.setBulletLeft(this.magazineSize);

		this.init();
	}

}