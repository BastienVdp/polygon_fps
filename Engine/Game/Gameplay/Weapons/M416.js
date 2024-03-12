import * as THREE from "three";
import Engine from "@/Engine";

import AutomaticWeapon from "./Components/AutomaticWeapon";
import { M416Config } from "@Config/Guns";
import { bulletDeltaPositionArray2ScreenCoordArray, bulletPositionArray2ScreenCoordArray } from "@Utils/Weapons";
import { WeaponEnum } from "@Enums/WeaponEnum";

const ak47BulletPositionArray = [
    222, 602, 230, 585, 222, 540, 228, 472, 231, 398,
    200, 320, 180, 255, 150, 208, 190, 173, 290, 183,
    343, 177, 312, 150, 350, 135, 412, 158, 420, 144,
    323, 141, 277, 124, 244, 100, 179, 102, 100, 124,
    149, 130, 134, 123, 149, 100, 170, 92, 125, 100,
    110, 87, 160, 88, 237, 95, 346, 147, 381, 146
];

const bulletPosition = bulletPositionArray2ScreenCoordArray(ak47BulletPositionArray, M416Config.bulletNumber, M416Config.rateX, M416Config.rateY, M416Config.recoilForce);
const bulletPositionDelta = bulletDeltaPositionArray2ScreenCoordArray(ak47BulletPositionArray, M416Config.bulletNumber, M416Config.rateX, M416Config.rateY, M416Config.recoilForce);

export default class M416 extends AutomaticWeapon
{
	static instance; 
	constructor({ camera, id })
	{
		super(bulletPosition, bulletPositionDelta, camera, id);

		if(M416.instance) return M416.instance;
		M416.instance = this;

		this.engine = new Engine();

		this.chamberPosition = new THREE.Vector3(.8, 1, -3);

		this.initialize();
	}

	initialize()
	{
		this.setClassification(WeaponEnum.RIFLE);
		this.setName("M416");
		this.setMagazineSize(30);
		this.setBulletLeftMax(60);
		this.setFireRate(60 / 600); // Fire rate per second
		this.setRecoverTime(0.368); // Time to recover from recoil
		this.setReloadTime(3); // Time to reload in seconds
		this.setRecoilControl(6); // Recoil control
		this.setAccurateRange(120); // Accurate range in meters
		this.setBulletLeft(this.magazineSize);

		super.init();
	}
	
}