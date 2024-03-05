import Engine from '@/index';

import { PointLockEventEnum } from '@Enums/EventsEnum';
import { PointLockEvent, EngineEventPipe } from '@Pipelines/EngineEventPipe';

/**
 * PointLock class
 * @class PointLock
 * @description A class that represents the pointer lock for the game
 */
export default class PointLock 
{
    constructor()
	{
		this.engine = new Engine();

		this.ownerDocument = this.engine.canvas.ownerDocument;
		this.isLocked = false;
	}

    /**
     * Listen to the pointer lock
     * @method pointLockListen
     * @description Listen to the pointer lock
     */
    pointLockListen() 
	{
        this.ownerDocument.addEventListener('mousemove', this.onMouseChange);
        this.ownerDocument.addEventListener('pointerlockchange', this.onPointerlockChange);
        this.ownerDocument.addEventListener('pointerlockerror', this.onPointerlockError);
    }

    /**
     * Dispose the pointer lock
     * @method pointLockDispose
     * @description Dispose the pointer lock
     */
    pointLockDispose() 
	{
        this.ownerDocument.removeEventListener('mousemove', this.onMouseChange);
        this.ownerDocument.removeEventListener('pointerlockchange', this.onPointerlockChange);
        this.ownerDocument.removeEventListener('pointerlockerror', this.onPointerlockError);
    }

    /**
     * On mouse change
     * @method onMouseChange
     * @description Handle the mouse change
     * @param {Event} e The event
     * @emits {PointLockEvent} The Mouse move event
     */
    onMouseChange = (e) =>
	{
        if (!this.isLocked) return;
        PointLockEvent.detail.enum = PointLockEventEnum.MOUSEMOVE;
        PointLockEvent.detail.movementX = e.movementX;
        PointLockEvent.detail.movementY = e.movementY;
        EngineEventPipe.dispatchEvent(PointLockEvent);
    }

    /**
     * On pointer lock change
     * @method onPointerlockChange
     * @description Handle the pointer lock change
     * @emits {PointLockEvent} The Pointer lock event
     */
    onPointerlockChange = () =>
	{
        if (this.ownerDocument.pointerLockElement === this.engine.canvas) {
            PointLockEvent.detail.enum = PointLockEventEnum.LOCK;
            EngineEventPipe.dispatchEvent(PointLockEvent);
            this.isLocked = true;
        } else {
            PointLockEvent.detail.enum = PointLockEventEnum.UNLOCK;
            EngineEventPipe.dispatchEvent(PointLockEvent);
            this.isLocked = false;
        }
    }

    /**
     * On pointer lock error
     * @method onPointerlockError
     * @description Handle the pointer lock error
     */
    onPointerlockError() 
	{
        console.error('THREE.PointerLockControls: Unable to use Pointer Lock API');
    }

    unlock() 
	{ 
		this.ownerDocument.exitPointerLock(); 
	}

    lock () 
	{ 
		this.engine.canvas.requestPointerLock(); 
	}

}