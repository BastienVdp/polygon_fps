import * as THREE from "three";
import Engine from "@/Engine";

import BaseWeapon from "./BaseWeapon";
import { WeaponAnimationEventEnum } from "@Enums/EventsEnum";
import AnimationManager from "@Game/Managers/AnimationManager";

export default class SemiAutomaticWeapon extends BaseWeapon
{
    constructor(camera, id) 
	{
        super(id);
        this.engine = new Engine();

        this.camera = camera; 

        this.params = {
            startRecover: true,
            startRecoverLine: 0,
            cameraRotationBasicTotal: 0,
            recoverCameraRotateTotalX: 0,
            bPointRecoiledScreenCoord: new THREE.Vector2()
        };


    }
 
    init()
    {
        super.init();
        
        this.animationManager = new AnimationManager({ weapon: this });
    }
    
    fire() 
	{
        if(!this.params.startRecover)
		{
			// On définit le point de départ de la récupération de l'arme
			this.params.cameraRotationBasicTotal = this.params.recoverCameraRotateTotalX;
		}

		// Calcule du recul aléatoire sur l'axe X et Y en fonction du recul de l'arme
		const bpX = (1 / this.accurateRange) * (Math.random() - 0.5);
        const bpY = (1 / this.accurateRange) * Math.random(); 

		// Calcule l'inclinaison de la caméra due au recul de l'arme
		const deltaPitch = 0.05 * Math.PI * (1 / this.recoilControl);
        this.camera.pitch += deltaPitch;

		// Enregistre le total de l'inclinaison pour la récupération
        this.params.cameraRotationBasicTotal += deltaPitch; 

		// Incrémente la ligne de récupération en fonction du taux de tir
		this.recoverLine += this.fireRate;
        const k = ((this.recoverLine / this.fireRate) - 1.0) * 60 / this.recoilControl;

        const deltaRecoiledX = bpX * k;
        const deltaRecoiledY = bpY * k;
        this.params.bPointRecoiledScreenCoord.set(deltaRecoiledX, deltaRecoiledY);

        // Dispatch fire event
        this.dispatchAnimationWeapon(WeaponAnimationEventEnum.FIRE);
        this.dispatchWeaponFireEvent();

        this.bulletLeft -= 1;
        this.params.startRecover = true;
        // ADD UI
        // console.log(`${this.bulletLeft + '/' + this.magazineSize}`);
    }

    recover() 
	{
        if(this.recoverLine !== 0)
		{
			if(this.params.startRecover)
			{
				// Définit la rotation totale de la caméra pour la récupération à partir de la rotation de base.
				this.params.recoverCameraRotateTotalX = this.params.cameraRotationBasicTotal;
				// Enregistre la ligne de récupération actuelle comme référence de départ.
				this.params.startRecoverLine = this.recoverLine;
			}

			// Calcule le taux de récupération en fonction du temps de récupération et du temps écoulé.
			let deltaRecoverScale = this.engine.time.delta / this.recoverTime; 
            const recoverLineBeforeMinus = this.recoverLine;

			// Si la ligne de récupération est supérieure à la ligne de récupération de départ multipliée par le taux de récupération, la ligne de récupération est réduite.
            if (this.recoverLine - (deltaRecoverScale * this.params.startRecoverLine) > 0) 
			{
				this.recoverLine -= (deltaRecoverScale * this.params.startRecoverLine);
			} 
			// Sinon, la ligne de récupération est réduite à zéro et la récupération est terminée.
			else 
			{ 
                deltaRecoverScale = this.recoverLine / this.params.startRecoverLine;
                this.recoverLine = 0; 
                this.params.cameraRotationBasicTotal = 0;
                this.params.recoverCameraRotateTotalX = 0;
            }

            const minusScale = recoverLineBeforeMinus - this.recoverLine;

            const recoverLineScale = minusScale / this.params.startRecoverLine;
            const deltaPitch = this.params.cameraRotationBasicTotal * recoverLineScale;
            
			this.camera.pitch -= deltaPitch;

            this.params.deltaPitch = deltaPitch;
            // console.log('recover', this.recoverLine);
            // this.dispatchWeaponRecoilEvent()

            this.params.recoverCameraRotateTotalX -= deltaPitch;

            this.params.startRecover = false; 
		}
    }

    update()
    {
        super.update();
    }
}
