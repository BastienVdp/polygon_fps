import { UserInputEvent, UserInputEventPipe } from "@Pipes/UserInputEventPipe";
import { UserInputEventEnum } from "@Enums/EventsEnum";

/**
 * InputManager class
 * @class InputManager
 * @description A class that handles user input events and dispatches them through the event pipeline.
 */
export default class InputManager 
{
    constructor() 
    {
        this.registerEventListeners();
    }

    /**
     * Register event listeners
     * @method registerEventListeners
     * @description Registers event listeners for mouse and keyboard inputs.
     */
    registerEventListeners() 
    {
        document.addEventListener('mousedown', e => this.handleMouseDown(e));
        document.addEventListener('mouseup', e => this.handleMouseUp(e));
        document.addEventListener('keydown', e => this.handleKeyDown(e));
        document.addEventListener('keyup', e => this.handleKeyUp(e));
    }

    /**
     * Handle mouse down event
     * @method handleMouseDown
     * @description Handles the mouse down event and dispatches the corresponding user input event.
     * @param {MouseEvent} e - The mouse event.
     */
    handleMouseDown(e)
    {
        if (e.button === 0) {
            this.dispatchEvent(UserInputEventEnum.BUTTON_TRIGGLE_DOWN);
        }
    }

    /**
     * Handle mouse up event
     * @method handleMouseUp
     * @description Handles the mouse up event and dispatches the corresponding user input event.
     * @param {MouseEvent} e - The mouse event.
     */
    handleMouseUp(e) 
    {
        if (e.button === 0) {
            this.dispatchEvent(UserInputEventEnum.BUTTON_TRIGGLE_UP);
        }
    }

    /**
     * Handle key down event
     * @method handleKeyDown
     * @description Handles the key down event and dispatches the corresponding user input event.
     * @param {KeyboardEvent} e - The key event.
     */
    handleKeyDown(e) 
    {
        const keyEventMapping = {
            'KeyW': UserInputEventEnum.MOVE_FORWARD_DOWN,
            'KeyA': UserInputEventEnum.MOVE_LEFT_DOWN,
            'KeyS': UserInputEventEnum.MOVE_BACKWARD_DOWN,
            'KeyD': UserInputEventEnum.MOVE_RIGHT_DOWN,
            'Space': UserInputEventEnum.JUMP,
            'KeyR': UserInputEventEnum.BUTTON_RELOAD,
            'Digit1': UserInputEventEnum.BUTTON_SWITCH_PRIMARY_WEAPON,
            'Digit2': UserInputEventEnum.BUTTON_SWITCH_SECONDARY_WEAPON,
            'Digit3': UserInputEventEnum.BUTTON_SWITCH_MELEE_WEAPON,
            'KeyQ': UserInputEventEnum.BUTTON_SWITCH_LAST_WEAPON,
            'ShiftLeft': UserInputEventEnum.BUTTON_SHIFT_DOWN
        };

        if (keyEventMapping[e.code]) {
            this.dispatchEvent(keyEventMapping[e.code]);
        }
    }

    /**
     * Handle key up event
     * @method handleKeyUp
     * @description Handles the key up event and dispatches the corresponding user input event.
     * @param {KeyboardEvent} e - The key event.
     */
    handleKeyUp(e) 
    {
        const keyEventMapping = {
            'KeyW': UserInputEventEnum.MOVE_FORWARD_UP,
            'KeyA': UserInputEventEnum.MOVE_LEFT_UP,
            'KeyS': UserInputEventEnum.MOVE_BACKWARD_UP,
            'KeyD': UserInputEventEnum.MOVE_RIGHT_UP,
            'ShiftLeft': UserInputEventEnum.BUTTON_SHIFT_UP
        };

        if (keyEventMapping[e.code]) {
            this.dispatchEvent(keyEventMapping[e.code]);
        }
    }

    /**
     * Dispatch user input event
     * @method dispatchEvent
     * @description Dispatches the user input event through the event pipeline.
     * @param {String} eventType - The type of user input event to dispatch.
     */
    dispatchEvent(eventType) 
    {
        UserInputEvent.detail.enum = eventType;
        UserInputEventPipe.dispatchEvent(UserInputEvent);
    }
}
