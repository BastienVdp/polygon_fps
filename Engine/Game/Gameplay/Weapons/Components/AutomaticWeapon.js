import * as THREE from "three";
import Engine from "@/Engine";
import BaseWeapon from "./BaseWeapon";

import { WeaponAnimationEventEnum } from "@Enums/EventsEnum";
import AnimationManager from "@Game/Managers/AnimationManager";

/**
 * @class AutomaticWeapon
 * @description A class to manage the automatic weapon
 */
export default class AutomaticWeapon extends BaseWeapon
{
	constructor(bulletPosition, bulletPositionDelta, camera) 
    {
        super();

        this.engine = new Engine();

        this.bulletPosition = bulletPosition;
        this.bulletPositionDelta = bulletPositionDelta;
        
        this.camera = camera;
    }


    init()
    {
        super.init();
		this.animationManager = new AnimationManager({ weapon: this });

        this.initializeInterpolants();
    }


    
    /**
     * @method initializeInterpolants
     * @description sets up linear interpolants for bullet positions and deltas based on given positions and values.
     * @returns {void}
     */
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

    
   /**
    * @method fire
    * @description Fires the weapon, handles shooting mechanics, including calculating bullet position, adjusting camera rotation, and updating ammunition count.
    * @returns {void}
    * @emits WeaponAnimationEvent
    * @emits WeaponFireEvent
    */
    fire() 
    {
       // Si l'arme n'est pas entrain de récupérer
       if (!this.startRecover) {
            // les paramètres de rotation de caméra sont réinitialisés aux paramètres de la dernière récupération
            this.cameraRotateTotalX = this.recoverCameraRotateTotalX;
            this.cameraRotateTotalY = this.recoverCameraRotateTotalY;
        }

        // Calcul de la position du tir en fonction de la ligne de récupération
        const floatTypedArray0 = this.bulletPositionInterpolant.evaluate(this.recoverLine); 
        this.impact.set(floatTypedArray0[0], floatTypedArray0[1]); 

        // Correction de la position du tir en fonction de la précision de l'arme * facteur aléatoire
        const deltaRecoiledX = (1 / this.accurateRange) * (Math.random() - 0.5); 
        const deltaRecoiledY = (1 / this.accurateRange) * Math.random(); // 
        
        // Applique la correction de la position du tir
        this.impact.x += deltaRecoiledX;
        this.impact.y += deltaRecoiledY;

        // Ajustement de la rotation de la caméra
        const basicPitch = 0.04 * Math.PI * (1 / this.recoilControl);
        this.camera.rotation.x += basicPitch;
        this.cameraRotationBasicTotal += basicPitch; // Rotation totale de la caméra

        const floatTypedArray1 = this.bulletPositionDeltaInterpolant.evaluate(this.recoverLine);

        // Calcul la différence de rotation de la caméra (yaw/pitch) après le tir 
        const deltaYaw = - floatTypedArray1[0] * Math.PI * (1 / this.recoilControl); 
        const deltaPitch = floatTypedArray1[1] * Math.PI * (1 / this.recoilControl);

        // Applique la différence de rotation de la caméra
        this.camera.rotation.x += deltaPitch;
        this.camera.rotation.y += deltaYaw; 

        // Enregistre la différence de rotation de la caméra
        this.cameraRotateTotalX += deltaPitch; 
        this.cameraRotateTotalY += deltaYaw;

        // Après le tir 
        this.recoverLine += this.fireRate; // Augmente la ligne de récupération en fonction du taux de tir
        
        // Dispatch l'événement de tir
        this.dispatchAnimationWeapon(WeaponAnimationEventEnum.FIRE);
        this.dispatchWeaponFireEvent();
        this.bulletLeft -= 1; // Réduit le nombre de balles dans le chargeur
        this.startRecover = true; // Indique que la récupération commence
        // ADD UI
        // console.log(`${this.bulletLeft + '/' + this.magazineSize}`);
    }

	/**
     * @method recover
     * @description Handles the weapon recovery mechanics, including camera rotation and line recovery.
     * @returns {void}
     */
    recover()
	{
        if (this.cameraRotationBasicTotal > 0) {
            if (this.cameraRotationBasicTotal - 0.001 > 0) {
                this.camera.rotation.x -= 0.001;
                this.cameraRotationBasicTotal -= 0.001;
            } else {
                this.camera.rotation.x -= this.cameraRotationBasicTotal;
                this.cameraRotationBasicTotal = 0;
            }
        } 

        const triggleDown = this.weaponManager.triggerDown;
        let deltaRecoverScale = this.engine.time.delta / this.recoverTime; 
        // Si la gachette n'est pas enfoncée ou qu'il n'y a plus de balles ou que l'arme n'est pas active
        if (!triggleDown || this.bulletLeft <= 0 || !this.active) {
            // Si c'est le début de la phase de récupération, on initialise les paramètres de récupération
            if (this.startRecover) 
            { 
                this.recoverCameraRotateTotalX = this.cameraRotateTotalX; 
                this.recoverCameraRotateTotalY = this.cameraRotateTotalY;
                this.startRecoverLine = this.recoverLine;
            }
            // Si la ligne de récupération est supérieure à 0, on récupère
            if (this.recoverLine != 0) { 
                const recoverLineBeforeMinus = this.recoverLine;
                // Réduit la ligne de récupération en fonction de la proportion de la ligne de départ.
                if (this.recoverLine - (deltaRecoverScale * this.startRecoverLine) > 0) {
                    this.recoverLine -= (deltaRecoverScale * this.startRecoverLine);
                } else {
                    deltaRecoverScale = this.recoverLine / this.startRecoverLine;
                    this.recoverLine = 0; 
                    this.cameraRotateTotalX = 0;
                    this.cameraRotateTotalY = 0;
                    this.recoverCameraRotateTotalX = 0;
                    this.recoverCameraRotateTotalY = 0;
                }

                // Calcule la récupération basée sur la proportion de la ligne de récupération.
                const minusScale = recoverLineBeforeMinus - this.recoverLine;
                const recoverLineScale = minusScale / this.startRecoverLine;
                const deltaYaw = this.cameraRotateTotalY * recoverLineScale;
                const deltaPitch = this.cameraRotateTotalX * recoverLineScale;
                
                this.camera.rotation.x -= deltaPitch;
                this.camera.rotation.y -= deltaYaw; // yaw
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
               this.weaponManager.triggerDown &&
               performance.now() - this.lastFireTime >= this.fireRate * 1000;
    }
}