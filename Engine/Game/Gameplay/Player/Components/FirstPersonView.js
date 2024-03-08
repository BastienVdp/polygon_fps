import * as THREE from 'three';
import Engine from "@/Engine";
import { guns } from '@Config/Guns';

/**
 * FirstPersonView class
 * @class FirstPersonView
 * @description Represents the first-person view in the game environment.
 */
export default class FirstPersonView
{
	/**
	 * Constructor
	 * @constructor
	 * @description Creates a new instance of the first-person view.
	 */
	constructor()
	{
		this.engine = new Engine();
		this.scene = this.engine.scenes.player;

		this.initialize();
	}
	
	/**
	 * Initialize the first-person view
	 * @method initialize
	 * @description Initializes the first-person camera and lights.
	 */
	initialize()
	{
		this.initCamera();
		this.initMeshes();
	}

 	/**
     * Initialize the camera
     * @method initCamera
     * @description Sets up the first-person camera with specific configurations.
     */
	initCamera()
	{
		this.camera = this.engine.cameras.firstPersonCamera;
		this.camera.clearViewOffset();
		this.camera.scale.z = 1.2;
		this.camera.position.y = .2;
		this.camera.position.x = -.6;
        this.camera.rotation.y = Math.PI;
	}

	/**
	 * Initialize the meshes
	 * @method initMeshes
	 * @description Sets up the first-person meshes with specific weapons.
	 */
	initMeshes()
	{
		guns.forEach(gun => {
			const weapon = this.engine.resources.get(gun);
			if(!weapon) return console.error(`Weapon ${gun} not found`);
			
			const weapon_armature = weapon.scene.getObjectByName(`${gun}_Armature`);
			const weapon_mesh = weapon.scene.getObjectByName(gun);
			const arms = weapon.scene.getObjectByName('Arms_Mesh');
			
			weapon_mesh.children.forEach(child => {
				child.frustumCulled = false;
				if(child.isMesh)
				{
					child.material.metalness = 0.0;
					child.material.roughness = 1.0;
					child.material.needsUpdate = true;
				}
			});

			arms.children.forEach(child => {
				child.frustumCulled = false;
				if(child.isMesh)
				{
					child.material.metalness = 0.0;
					child.material.roughness = 1.0;
					child.material.envMap = this.engine.resources.get('envMap');
					child.material.needsUpdate = true;
				}
			});

			weapon_armature.rotation.order = 'YXZ';
			// weapon_armature.rotation.y = -Math.PI / 2;
			weapon_armature.position.set(-.62, 0, .2);

			this.scene.add(weapon_armature);

			this.engine.resources.set(`${gun}_Armature`, weapon_armature);

			const animationMixer = new THREE.AnimationMixer(weapon_armature);
			const animations = weapon.animations;

			const animationsActions = new Map();

			animations.forEach(animation => {
				const animationAction = animationMixer.clipAction(animation, weapon_armature);
				animationsActions.set(animation.name, animationAction);
			});

			console.log(animationsActions.get(`${gun}_idle`));
			animationsActions.get(`${gun}_idle`).play();
			this.engine.resources.set(`${gun}_AnimationsActions`, animationsActions);
			this.engine.resources.set(`${gun}_AnimationMixer`, animationMixer);
		
		
		});

	}
}