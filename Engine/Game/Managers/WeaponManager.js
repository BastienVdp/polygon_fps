import * as THREE from "three";
import Engine from "@/Engine";
import { UserInputEvent, UserInputEventPipe } from "@Pipes/UserInputEventPipe";
import { GameEventPipe, WeaponFireEvent, ShotOutWeaponFireEvent, BulletImpactEvent } from "@Pipes/GameEventPipe";
import { WeaponEnum } from "@Enums/WeaponEnum";
import { MaterialsEnum } from "@Enums/MaterialsEnum";
import { UserInputEventEnum } from "@Enums/EventsEnum";

/**
 * @class WeaponManager
 * @description A class to manage the weapon
 */
export default class WeaponManager
{
    static instance;
    constructor() 
    {
        if (WeaponManager.instance) {
            return WeaponManager.instance;
        }
        WeaponManager.instance = this;
        
        this.engine = new Engine();
        this.scene = this.engine.scenes.level;
        this.camera = this.engine.cameras.playerCamera;

        this.triggerDown = false;
        this.raycaster = new THREE.Raycaster();
        this.intersectedObjects = [];

        this.initializeEventListeners();
    }


    /**
     * @method initializeEventListeners
     * @description Initialize the event listeners
     * @listens UserInputEvent
     * @listens WeaponFireEvent
     */
    initializeEventListeners() 
    {
        UserInputEventPipe.addEventListener(UserInputEvent.type, this.handleUserInput);
        GameEventPipe.addEventListener(WeaponFireEvent.type, this.handleWeaponFiring);
    }

    /**
     * @method handleUserInput
     * @description Handle the user input
     * @param {UserInputEvent} e - The user input event
     * @returns {void}
     */
    handleUserInput = (e) => 
    {
        switch (e.detail.enum) 
        {
            case UserInputEventEnum.BUTTON_TRIGGLE_DOWN:
                this.triggerDown = true;
                break;
            case UserInputEventEnum.BUTTON_TRIGGLE_UP:
                this.triggerDown = false;
                break;
        }
    }

    /**
     * @method handleWeaponFiring
     * @description Handle the weapon firing
     * @param {WeaponFireEvent} e - The weapon fire event with the weapon data
     * @emits ShotOutWeaponFireEvent
     * @returns {void}
     */
    handleWeaponFiring = (e) => 
    {
        if (e.detail.weapon && e.detail.weapon.classification !== WeaponEnum.MELEE) {
            GameEventPipe.dispatchEvent(ShotOutWeaponFireEvent);
        }

        this.processRaycasting(e);
    }

    /**
     * @method processRaycasting
     * @description Process the raycasting
     * @param {WeaponFireEvent} e - The weapon fire event with the weapon data
     * @returns {void}
     */
    processRaycasting = (e) => 
    {
		this.intersectedObjects.length = 0;
		let generatedBullet = false;
		const bpPointScreenCoord = e.detail.params.impact;
        this.raycaster.setFromCamera(bpPointScreenCoord, this.camera); 
        this.raycaster.params.Mesh.threshold = 1;

        this.raycaster.intersectObjects(this.scene.children, true, this.intersectedObjects);

        this.intersectedObjects.filter((intersectedObject) => intersectedObject.object.userData['type'] === MaterialsEnum.LEVEL);

        if (this.intersectedObjects.length > 0) {
            const firstIntersection = this.intersectedObjects[0];
            this.handleBulletImpact(e, generatedBullet, firstIntersection);
        }
    }

    /**
     * @method handleBulletImpact
     * @description Handle the bullet impact
     * @param {WeaponFireEvent} e - The weapon fire event with the weapon data
     * @param {boolean} generatedBullet - The generated bullet
     * @param {Object} firstIntersection - The first intersection object
     * @returns {void}
     */
    handleBulletImpact = (e, generatedBullet, firstIntersection) =>
    {
        if (generatedBullet) return;

        if(
            firstIntersection.object.parent.name === MaterialsEnum.PLAYER_HEAD || 
            firstIntersection.object.parent.name === MaterialsEnum.PLAYER_CHEST || 
            firstIntersection.object.parent.name === MaterialsEnum.PLAYER_LEGS
        ) {
       
                this.handlePlayerHit(firstIntersection, e);
                generatedBullet = true;
        }
        else 
        {
            this.handleEnvironmentHit(firstIntersection, e);
            generatedBullet = true;
        }
        
    }

    /**
     * @method handlePlayerHit
     * @description Handle the player hit
     * @param {Object} intersectedObject - The intersected object
     * @param {WeaponFireEvent} e - The weapon fire event with the weapon data
     * @returns {void}
     */
    handlePlayerHit = (intersectedObject, e) => 
    {
        const playerInstance = intersectedObject.object.parent.parent.parent.userData.instance;
        switch (intersectedObject.object.parent.name) 
        {
            case MaterialsEnum.PLAYER_HEAD:
                playerInstance.getHit(MaterialsEnum.PLAYER_HEAD);
                break;
            case MaterialsEnum.PLAYER_CHEST:
                playerInstance.getHit(MaterialsEnum.PLAYER_CHEST);
                break;
            case MaterialsEnum.PLAYER_LEGS:
                playerInstance.getHit(MaterialsEnum.PLAYER_LEGS);
                break;
        }
    }

    /**
     * @method handleEnvironmentHit
     * @description Handle the environment hit
     * @param {Object} intersectedObject - The intersected object
     * @param {WeaponFireEvent} e - The weapon fire event with the weapon data
     * @emits BulletImpactEvent
     */
    handleEnvironmentHit = (intersectedObject, e) => 
    {

        console.log('handleEnvironmentHit', intersectedObject.face.normal);
        if (e.detail.weapon && e.detail.weapon.classification === WeaponEnum.MELEE) 
        {
            return; // Pas de point d'impact pour les armes de mêlée
        }

        // Logique pour gérer l'impact des balles sur les objets de l'environnement
        const point = intersectedObject.point;
        const normal = intersectedObject.face.normal;


        // Préparation de l'événement pour l'impact de la balle
        BulletImpactEvent.detail.point.copy(point);
        BulletImpactEvent.detail.normal.copy(normal);
        BulletImpactEvent.detail.cameraPosition.copy(this.camera.position);
        BulletImpactEvent.detail.recoiledScreenCoord.copy(e.detail.params.impact);

        // Envoi de l'événement pour l'affichage de l'impact de la balle
        // console.log('dispatching bullet fallen point event');
        GameEventPipe.dispatchEvent(BulletImpactEvent);
    };

}