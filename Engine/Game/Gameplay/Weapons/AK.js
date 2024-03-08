import * as THREE from "three";
import Experience from "@/Experience";
import AutomaticWeapon from "./Components/AutomaticWeapon";

import { bulletDeltaPositionArray2ScreenCoordArray, bulletPositionArray2ScreenCoordArray } from "@Utils/Weapon";
import { WeaponEnum } from "@Enums/Weapon";

// AK47
const ak47BulletPositionArray = [
    222, 602, 230, 585, 222, 540, 228, 472, 231, 398,
    200, 320, 180, 255, 150, 208, 190, 173, 290, 183,
    343, 177, 312, 150, 350, 135, 412, 158, 420, 144,
    323, 141, 277, 124, 244, 100, 179, 102, 100, 124,
    149, 130, 134, 123, 149, 100, 170, 92, 125, 100,
    110, 87, 160, 88, 237, 95, 346, 147, 381, 146
];

// 
const bulletPosition = bulletPositionArray2ScreenCoordArray(ak47BulletPositionArray, 30, 0.2, 0.15, 1.4); // 计算弹道图
const bulletPositionDelta = bulletDeltaPositionArray2ScreenCoordArray(ak47BulletPositionArray, 30, 0.2, 0.15, 1); // 影响相机抖动

export default class AK extends AutomaticWeapon
{
	constructor({ camera, id })
	{
		super(bulletPosition, bulletPositionDelta, camera, id);

		this.experience = new Experience();

		this.chamberPosition = new THREE.Vector3(.8, 1, -3);

		this.initialize();
	}

	initialize()
	{
		this.setClassification(WeaponEnum.RIFLE);
		this.setName("AK");
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