import * as THREE from 'three';

/**
 * Time class
 * @class Time
 * @description Class that handles the time of the game
 */
export default class Time 
{
    constructor() 
    {
        this.clock = new THREE.Clock();

        this.elapsed = 0;
        this.delta = 0.016; // 60 fps
    }

    update() 
    {
        this.delta = this.clock.getDelta();

        // Clamper à 60 fps
        if (this.delta > 0.016) this.delta = 0.016; 
        
        this.elapsed = this.clock.getElapsedTime();
    }
}
