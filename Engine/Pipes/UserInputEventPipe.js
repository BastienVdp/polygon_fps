import { Pipe } from "@Core/Pipe";

/**
 * UserInputEventPipe class
 * @class UserInputEventPipe
 * @description A class that represents the user input event pipeline.
 */
export const UserInputEventPipe = new Pipe();

/**
 * Events
 */
export const UserInputEvent = new CustomEvent('input', {
    detail: { 
        enum: undefined 
    }
});
