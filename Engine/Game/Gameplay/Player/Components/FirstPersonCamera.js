import Engine from "@/Engine";
import { EngineEventPipe, PointLockEvent } from "@Pipelines/EngineEventPipe";
import { PointLockEventEnum } from "@Enums/EventsEnum";


const mouseConfig = { 
    dpi: 1000,
    mouseSensitivity: 0.5
}

const _PI_2 = Math.PI / 2; // PI/2

/**
 * FirstPersonCamera class
 * @class FirstPersonCamera
 * @description @description Represents the first-person camera in the game environment.
 */
export default class FirstPersonCamera 
{
	constructor()
	{
		this.engine = new Engine();
		this.camera = this.engine.cameras.playerCamera;
		this.camera.rotation.order = 'YXZ';
		
		this.initialize();
	}

	/**
	 * Initialize
	 * @method initialize
	 * @description Sets up the first-person camera and handles mouse movement events for rotation.
	 */
	initialize()
	{
		EngineEventPipe.addEventListener(PointLockEvent.type, (e) => {
			switch (e.detail.enum) {
                case PointLockEventEnum.MOUSEMOVE:
                    const { dpi, mouseSensitivity } = mouseConfig; 

                    const screenTrasformX = e.detail.movementX / dpi * mouseSensitivity; 
                    const screenTrasformY = e.detail.movementY / dpi * mouseSensitivity; 
                    this.camera.rotation.y = this.camera.rotation.y - screenTrasformX;
                    this.camera.rotation.x = Math.max(_PI_2 - Math.PI, Math.min(_PI_2 - 0, this.camera.rotation.x - screenTrasformY));
                    break;
			}
		})
	}
}