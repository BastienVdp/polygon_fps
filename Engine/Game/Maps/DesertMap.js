import { EquirectangularReflectionMapping, LinearFilter } from 'three';

import Map from '@Core/Map';
import Skybox from '@Game/Gameplay/Sky/Skybox';

/**
 * DesertMap class
 * @class DesertMap
 * @description A class that represents the desert map and extends the Map class.
 * @extends Map
 */

export default class DesertMap extends Map 
{
	constructor()
	{
		super();
		this.initialize();
	}

	/**
     * Initialize the desert map
     * @method initialize
     * @description Initializes the desert map by setting up the scene, materials, collider, environment, and skybox.
     */
	initialize()
	{
		this.scene = this.engine.resources.get('map').scene;
		this.engine.scenes.level.add(this.scene);

		this.setMaterials();
		this.setCollider();
		this.setEnvironment();

		this.setSky();
	}

	/**
	 * Set materials for meshes in the scene
	 * @method setMaterial
	 * @description Sets the materials for meshes in the scene, configuring environment mapping, metalness, and roughness.
	 */
	setMaterials()
	{
		this.scene.traverse((child) => {
			if(child.isMesh)
			{
				child.material.envMap = this.environment;
				child.material.needsUpdate = true;
				child.material.metalness = 0.0;
				child.material.roughness = 1.0;
			}
		});
	}
	
	/**
     * Set the skybox
     * @method setSky
     * @description Sets up the skybox for the desert map.
     */
	setSky()
	{
		this.skybox = new Skybox();
	}

	/**
     * Set the collider for the map
     * @method setCollider
     * @description Sets the collider for the map based on the scene's object with the name "collider".
     */
	setCollider()
	{
		this.collider = this.scene.getObjectByName("collider");
		this.collider.visible = false;

		this.engine.octree.fromGraphNode(this.collider);
	}

	/**
     * Set the environment map and lighting
     * @method setEnvironment
     * @description Sets the environment map, mapping type, and filter for the desert map.
     */
	setEnvironment()
	{
		this.environment = this.engine.resources.get('sunset');
		this.environment.mapping = EquirectangularReflectionMapping;
		this.environment.magFilter = LinearFilter;

		this.engine.scenes.level.environment = this.environment;
		// const ambiantLight = new AmbientLight(0xffffff, 0.3);
		// this.engine.scenes.level.add(ambiantLight);

		// const directionalLight = new DirectionalLight(0xffffff, 2.5);
		// directionalLight.position.set(0, 10, 10);
		// this.engine.scenes.level.add(directionalLight);
	}
}