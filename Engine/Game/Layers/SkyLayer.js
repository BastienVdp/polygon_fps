import * as THREE from 'three'
import { Sky } from 'three/examples/jsm/objects/Sky'

import Engine from "@/Engine";

/**
 * Skylayer class
 * @class Skylayer 
 * @description Represents the skylayer in the game environment.
 */
export default class SkyLayer
{
	constructor()
	{
		this.engine = new Engine();

		this.config = {
			turbidity: 4,
			rayleigh: 1,
			mieCoefficient: 0.003,
			mieDirectionalG: 0.7,
			elevation: 20,
			azimuth: -10,
			exposure: this.engine.renderer.toneMappingExposure,
		};
		
		this.initialize();
	}

	/**
	 * Initialize the skybox
	 * @method init
	 * @description Initializes the skybox by creating a Sky object and setting its parameters.
	 */
	initialize()
	{
		this.sky = new Sky();
		this.sky.scale.setScalar(1000);
		this.sun = new THREE.Vector3();

		const uniforms = this.sky.material.uniforms;
        uniforms['turbidity'].value = this.config.turbidity;
        uniforms['rayleigh'].value = this.config.rayleigh;
        uniforms['mieCoefficient'].value = this.config.mieCoefficient;
        uniforms['mieDirectionalG'].value = this.config.mieDirectionalG;

		const phi = THREE.MathUtils.degToRad(90 - this.config.elevation);
        const theta = THREE.MathUtils.degToRad(this.config.azimuth);
        this.sun.setFromSphericalCoords(1, phi, theta);

		uniforms['sunPosition'].value.copy(this.sun);

		this.engine.renderer.toneMappingExposure = this.config.exposure;
		this.engine.scenes.skybox.add(this.sky);
	}
}