import * as THREE from "three";
import Engine from "@/Engine";
import BaseWeapon from "./BaseWeapon";

import { WeaponAnimationEventEnum } from "@Enums/EventsEnum";
import WeaponSystem from "../WeaponSystem";
import AnimationManager from "@Game/Managers/AnimationManager";

export default class AutomaticWeapon extends BaseWeapon
{
	constructor(bulletPosition, bulletPositionDelta, camera, id) 
    {
        super(id);

        this.engine = new Engine();

        this.bulletPosition = bulletPosition;
        this.bulletPositionDelta = bulletPositionDelta;
        
        this.camera = camera;

        
        this.params = {
            startRecover: true,
			startRecoverLine: 0, 
			cameraRotateTotalX: 0, 
			cameraRotateTotalY: 0,
			cameraRotationBasicTotal: 0, 
			recoverCameraRotateTotalX: 0, 
			recoverCameraRotateTotalY: 0,
			bPointRecoiledScreenCoord: new THREE.Vector2(),
        };

    }

    init()
    {
        super.init();
		this.animationManager = new AnimationManager({ weapon: this });

        this.initializeInterpolants();
    }


    initializeInterpolants() 
    {
        const positions = new Float32Array(this.magazineSize).map((_, i) => i * this.fireRate);
        this.bulletPositionInterpolant = new THREE.LinearInterpolant(
            positions, new Float32Array(this.bulletPosition), 2, new Float32Array(2)
        );
        this.bulletPositionDeltaInterpolant = new THREE.LinearInterpolant(
            positions, new Float32Array(this.bulletPositionDelta), 2, new Float32Array(2)
        );
    }


    fire() 
    {
       // Si l'arme n'est pas entrain de récupérer
       if (!this.params.startRecover) {
            // les paramètres de rotation de caméra sont réinitialisés aux paramètres de la dernière récupération
            this.params.cameraRotateTotalX = this.params.recoverCameraRotateTotalX;
            this.params.cameraRotateTotalY = this.params.recoverCameraRotateTotalY;
        }

        // Calcul de la position du tir en fonction de la ligne de récupération
        const floatTypedArray0 = this.bulletPositionInterpolant.evaluate(this.recoverLine); 
        this.params.bPointRecoiledScreenCoord.set(floatTypedArray0[0], floatTypedArray0[1]); 

        // Correction de la position du tir en fonction de la précision de l'arme * facteur aléatoire
        const deltaRecoiledX = (1 / this.accurateRange) * (Math.random() - 0.2); 
        const deltaRecoiledY = (1 / this.accurateRange) * Math.random(); // 
        
        // Applique la correction de la position du tir
        this.params.bPointRecoiledScreenCoord.x += deltaRecoiledX;
        this.params.bPointRecoiledScreenCoord.y += deltaRecoiledY;

        // Ajustement de la rotation de la caméra
        const basicPitch = 0.04 * Math.PI * (1 / this.recoilControl);
        this.camera.pitch += basicPitch;
        this.params.cameraRotationBasicTotal += basicPitch; // Rotation totale de la caméra

        const floatTypedArray1 = this.bulletPositionDeltaInterpolant.evaluate(this.recoverLine);

        // Calcul la différence de rotation de la caméra (yaw/pitch) après le tir 
        const deltaYaw = - floatTypedArray1[0] * Math.PI * (1 / this.recoilControl); 
        const deltaPitch = floatTypedArray1[1] * Math.PI * (1 / this.recoilControl);

        // Applique la différence de rotation de la caméra
        this.camera.pitch += deltaPitch;
        this.camera.yaw += deltaYaw; 
        
        // Enregistre la différence de rotation de la caméra
        this.params.cameraRotateTotalX += deltaPitch; 
        this.params.cameraRotateTotalY += deltaYaw;

        // Après le tir 
        this.recoverLine += this.fireRate; // Augmente la ligne de récupération en fonction du taux de tir
        
        // Dispatch l'événement de tir
        this.dispatchAnimationWeapon(WeaponAnimationEventEnum.FIRE);
        this.dispatchWeaponFireEvent();

        this.bulletLeft -= 1; // Réduit le nombre de balles dans le chargeur
        this.params.startRecover = true; // Indique que la récupération commence
        // ADD UI
        // console.log(`${this.bulletLeft + '/' + this.magazineSize}`);
    }

	recover()
	{
        if (this.params.cameraRotationBasicTotal > 0) {
            if (this.params.cameraRotationBasicTotal - 0.001 > 0) {
                this.camera.pitch -= 0.001;
                this.params.cameraRotationBasicTotal -= 0.001;
            } else {
                this.camera.pitch -= this.params.cameraRotationBasicTotal;
                this.params.cameraRotationBasicTotal = 0;
            }
        }
        const triggleDown = this.weaponSystem.triggerDown;
        let deltaRecoverScale = this.engine.time.delta / this.recoverTime; 
        
        // Si la gachette n'est pas enfoncée ou qu'il n'y a plus de balles ou que l'arme n'est pas active
        if (!triggleDown || this.bulletLeft <= 0 || !this.active) {
            // Si c'est le début de la phase de récupération, on initialise les paramètres de récupération
            if (this.params.startRecover) 
            { 
                this.params.recoverCameraRotateTotalX = this.params.cameraRotateTotalX; 
                this.params.recoverCameraRotateTotalY = this.params.cameraRotateTotalY;
                this.params.startRecoverLine = this.recoverLine;
            }
            // Si la récupération est terminée, on réinitialise les paramètres de récupération
            if (this.recoverLine != 0) { 
                const recoverLineBeforeMinus = this.recoverLine;
                // Réduit la ligne de récupération en fonction de la proportion de la ligne de départ.
                if (this.recoverLine - (deltaRecoverScale * this.startRecoverLine) > 0) this.recoverLine -= (deltaRecoverScale * this.params.startRecoverLine);
                else { 
                    
                    deltaRecoverScale = this.recoverLine / this.startRecoverLine;
                    this.recoverLine = 0; 
                    this.params.cameraRotateTotalX = 0;
                    this.params.cameraRotateTotalY = 0;
                    this.params.recoverCameraRotateTotalX = 0;
                    this.params.recoverCameraRotateTotalY = 0;
                }

                // Calcule la récupération basée sur la proportion de la ligne de récupération.
                const minusScale = recoverLineBeforeMinus - this.recoverLine;
                const recoverLineScale = minusScale / this.params.startRecoverLine;
                const deltaYaw = this.params.cameraRotateTotalY * recoverLineScale;
                const deltaPitch = this.params.cameraRotateTotalX * recoverLineScale;
                
                this.camera.pitch -= deltaPitch;
                this.camera.yaw -= deltaYaw; // yaw
                this.recoverCameraRotateTotalX -= deltaPitch;
                this.recoverCameraRotateTotalY -= deltaYaw;
                this.startRecover = false; // On indique que la récupération est terminée
            }
        }
	}

    update()
	{
        super.update();

		if (this.shouldFire()) {
            this.lastFireTime = performance.now();
            this.fire();

        }
	}

    shouldFire() 
    {
        return this.bulletLeft > 0 &&
               this.active &&
               this.weaponSystem.triggerDown &&
               performance.now() - this.lastFireTime >= this.fireRate * 1000;
    }
}