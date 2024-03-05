import { Pipe } from '@Core/Pipe';

/**
 * EngineEventPipe class
 * @class EngineEventPipe
 * @description A class that represents the pipe for the engine events
 */
export const EngineEventPipe = new Pipe();


/**
 * Events
 */
export const PointLockEvent = new CustomEvent('window pointlock', {
    detail: { 
        enum: undefined, 
        movementX: 0, 
        movementY: 0 
    }
});

export const ResizeEvent = new CustomEvent('window resized', {
    detail: {
        width: undefined,
        height: undefined,
    }
});

export const LoadingEvent = new CustomEvent('assets loading', {
    detail: {
        enum: undefined,
        progress: undefined,
        resource: undefined,
    }
});
