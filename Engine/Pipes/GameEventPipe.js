import { Pipe } from '@Core/Pipe';

/**
 * GameEventPipe class
 * @class GameEventPipe
 * @description A class that represents the pipe for the game events
 */
export const GameEventPipe = new Pipe();

/**
 * Events
 */
export const LoadMapEvent = new CustomEvent('assets loading', {
    detail: {
        enum: undefined,
    }
});
