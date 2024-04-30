import * as THREE from 'three';
import { WeaponEnum } from "@Enums/WeaponEnum";
import SemiAutomaticWeapon from "./Components/SemiAutomaticWeapon";

export default class AWP extends SemiAutomaticWeapon
{
	static instance;
	constructor({ camera, id})
	{
		super(camera, id);
		if(AWP.instance) return AWP.instance;
		AWP.instance = this;

		this.chamberPosition = new THREE.Vector3(-0.3, .8, 1.3);

		this.initialize();
	}

	initialize()
	{
		this.setClassification(WeaponEnum.SNIPER);
		this.setName("AWP");
		this.setMagazineSize(12); // The magazine size
		this.setBulletLeftMax(12); // The maximum bullet left
		this.setFireRate(90 / 60); // The fire rate per second
		this.setRecoverTime(0.34); // The recover time for the recoil
		this.setReloadTime(2.25); // The reload time
		this.setRecoilControl(1.5);  // The recoil control
		this.setAccurateRange(120); // The accurate range
		this.setBulletLeft(this.magazineSize);

		this.init();
	}

}