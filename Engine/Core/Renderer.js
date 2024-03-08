import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FXAAShader } from  'three/addons/shaders/FXAAShader.js';

import Engine from "@/Engine";

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

		this.settings = {
			exposure: 0.87,

		}
		this.folder = this.debug.addFolder({ title: 'Renderer', expanded: false });
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
			depth: true,
			stencil: true,
			
        });

        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1;

        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
		
		this.renderer.autoClear = false;
		this.renderer.autoClearDepht = false;
		this.renderer.autoClearStencil = false;

		this.target = new THREE.WebGLRenderTarget(this.sizes.width, this.sizes.height, {
			format: THREE.RGBAFormat,
			colorSpace: THREE.ACESFilmicToneMapping,
		});
		this.target.samples = 8;

		this.setEffectComposer();
		this.setDebug();
	}

	setEffectComposer()
	{
		const pixelRatio = this.renderer.getPixelRatio();

		this.composer = new EffectComposer(this.renderer, this.target);

		const renderPass = new RenderPass(this.engine.scenes.level, this.engine.cameras.playerCamera);
		renderPass.clearAlpha = 0;

		const fxaaPass = new ShaderPass( FXAAShader );
		fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( this.sizes.width * pixelRatio );
		fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( this.sizes.height * pixelRatio );

		const outputPass = new OutputPass();

		this.composer.addPass(renderPass);
		this.composer.addPass(outputPass);
		this.composer.addPass(fxaaPass);
	}
	
	setDebug()
	{
		this.folder.addBinding(this.settings, 'exposure', { 
			label: 'Exposure', 
			min: 0, 
			max: 2, 
			step: 0.001 
		}).on('change', ({ value }) => this.renderer.toneMappingExposure = value);

	}

	resize()
	{
		this.renderer.setSize(this.sizes.width, this.sizes.height);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.composer.setSize(this.sizes.width, this.sizes.height);
	}

	update()
	{
		// this.composer.render();

		this.renderer.render(this.engine.scenes.skybox, this.engine.cameras.playerCamera);
		this.renderer.clearDepth();

		this.renderer.render(this.engine.scenes.level, this.engine.cameras.playerCamera);
		this.renderer.clearDepth();

		this.renderer.render(this.engine.scenes.player, this.engine.cameras.firstPersonCamera);
		this.renderer.clearDepth();

		
	}
}