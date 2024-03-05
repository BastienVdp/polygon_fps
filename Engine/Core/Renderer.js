import * as THREE from 'three';

import Engine from "@";

/**
 * Renderer class
 * @class Renderer
 * @description Class that handles the rendering of the game
 */
export default class Renderer
{
	constructor()
	{
		this.engine = new Engine();
		this.debug = this.engine.debug;
		this.sizes = this.engine.sizes;
		this.canvas = this.engine.canvas;

		if(this.debug) {
			this.debugFolder = this.debug.addFolder('Renderer');
			this.debugFolder.open();
		}

		this.initiliaze();
	}

	/**
	 * Initialize the renderer	
	 * @method initiliaze
	 * @description Initialize the renderer
	 */
	initiliaze()
	{
		this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            logarithmicDepthBuffer: true, // Get rid of z-fighting
        });

        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.0;

        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
		
		this.renderer.autoClear = false;
		this.renderer.autoClearDepht = false;
		this.renderer.autoClearStencil = false;

		if(this.debugFolder) {
			this.debugFolder.add(this.renderer, 'toneMappingExposure', 0, 10, 0.001).name('Exposure');
		}
	}

	
	resize()
	{
		this.renderer.setSize(this.sizes.width, this.sizes.height);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	}

	update()
	{
		// this.renderer.render(this.engine.scenes.skybox, this.engine.cameras.playerCamera);
		// this.renderer.clearDepth();

		// this.renderer.render(this.engine.scenes.level, this.engine.cameras.playerCamera);
		// this.renderer.clearDepth();

		// this.renderer.render(this.engine.scenes.sprites, this.engine.cameras.playerCamera);
		// this.renderer.clearDepth();

		// this.renderer.render(this.engine.scenes.player, this.engine.cameras.firstPersonCamera);
		// this.renderer.clearDepth();

		// this.renderer.render(this.engine.scenes.ui, this.engine.cameras.UICamera);
		// this.renderer.clearDepth();
	}
}