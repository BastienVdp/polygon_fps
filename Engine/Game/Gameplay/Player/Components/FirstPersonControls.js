import * as THREE from "three";

import Engine from "@/Engine";
import { UserInputEvent, UserInputEventPipe } from "@Pipelines/UserInputEventPipe";
import { UserInputEventEnum } from "@Enums/EventsEnum";

/**
 * FirstPersonControls class
 * @class FirstPersonControls
 * @description A class that represents the first person controls
 */
export default class FirstPersonControls 
{

    /**
     * Constructor
     * @constructor
     * @description Create a new first person controls
     * @param {Object} player - The player
     */
    constructor({ player }) 
    {
        this.engine = new Engine();
        this.octree = this.engine.octree;
        this.keyStates = new Map();

        this.player = player;
        
        this.params = {
            gravity: 15,
            groundControlFactor: 20.0,
            airControlFactor: 2.0,
            dampFactor: -10.0,
            movespeedFactor: 1.4,
        };

        this.initialize();
    }

    /**
     * Initialize
     * @method init
     * @description Initializes the first-person controls by registering input events.
     */
    initialize() 
    {
        this.registerInputEvents();
    }

    /**
     * Register input events
     * @method registerInputEvents
     * @description Registers input events and handles corresponding actions.
     */
    registerInputEvents() 
    {
        UserInputEventPipe.addEventListener(UserInputEvent.type, e => {
            if (this.isMovementEvent(e.detail.enum)) {
                this.handleMovementEvent(e.detail.enum);
            } else if (e.detail.enum === UserInputEventEnum.JUMP) {
                this.jump();
            } else if (e.detail.enum === UserInputEventEnum.BUTTON_SHIFT_DOWN) {
                this.shift();
            } else if (e.detail.enum === UserInputEventEnum.BUTTON_SHIFT_UP) {
                this.unshift();
            }
        });
    }

    /**
     * isMovementEvent
     * @method isMovementEvent
     * @description Checks if the given event type is a movement event.
     * @param {String} eventType - The event type.
     * @returns {Boolean} - True if it is a movement event, otherwise false.
     */
    isMovementEvent(eventType) 
    {
        return [
            UserInputEventEnum.MOVE_FORWARD_DOWN,
            UserInputEventEnum.MOVE_BACKWARD_DOWN,
            UserInputEventEnum.MOVE_LEFT_DOWN,
            UserInputEventEnum.MOVE_RIGHT_DOWN,
            UserInputEventEnum.MOVE_FORWARD_UP,
            UserInputEventEnum.MOVE_BACKWARD_UP,
            UserInputEventEnum.MOVE_LEFT_UP,
            UserInputEventEnum.MOVE_RIGHT_UP,
        ].includes(eventType);
    }

     /**
     * Handle the movement event
     * @method handleMovementEvent
     * @description Handles the movement event by updating key states.
     * @param {String} eventType - The event type.
     */
    handleMovementEvent(eventType) 
    {
        const isKeyDown = eventType.endsWith("_DOWN");
        const keyStateEvent = eventType.replace("_UP", "_DOWN");
        this.keyStates.set(keyStateEvent, isKeyDown);
    }

    /**
     * Update method
     * @method update
     * @description Updates the controls, player, and performs teleportation checks.
     */
    update() 
    {
        this.updateControls();
        this.updatePlayer();
        this.teleportIfOut();
    }

    /**
     * Update the controls
     * @method updateControls
     * @description Updates the controls based on input and updates player direction and velocity.
     */
    updateControls() 
    {
        const controlFactor = this.getControlFactor();
        this.resetDirection();
        this.updateDirectionBasedOnInput();
        this.updateVelocity(controlFactor);
    }

    /**
     * getControlFactor
     * @method getControlFactor
     * @description Get the control factor depending on whether the player is on the ground or in the air.
     * @returns {number} - The calculated control factor.
     */
    getControlFactor() 
    {
        return this.engine.time.delta * (this.player.onFloor ? this.params.groundControlFactor : this.params.airControlFactor);
    }

    /**
     * resetDirection
     * @method resetDirection
     * @description Reset the player's movement direction.
     */
    resetDirection() 
    {
        this.player.direction.set(0, 0, 0);
    }

    /**
     * updateDirectionBasedOnInput
     * @method updateDirectionBasedOnInput
     * @description Update the player's direction based on user input.
     */
    updateDirectionBasedOnInput() 
    {
        let isMovement = false;
        if (this.keyStates.get(UserInputEventEnum.MOVE_FORWARD_DOWN)) {
            this.player.currentMovement = "FORWARD";
            this.player.direction.add(this.getForwardVector());
            isMovement = true;
        }
        if (this.keyStates.get(UserInputEventEnum.MOVE_BACKWARD_DOWN)) {
            this.player.currentMovement = "BACKWARD";
            this.player.direction.sub(this.getForwardVector());
            isMovement = true;
        }
        if (this.keyStates.get(UserInputEventEnum.MOVE_LEFT_DOWN)) {
            this.player.currentMovement = "LEFT";
            this.player.direction.sub(this.getSideVector());
            isMovement = true;
        }
        if (this.keyStates.get(UserInputEventEnum.MOVE_RIGHT_DOWN)) {
            this.player.currentMovement = "RIGHT";
            this.player.direction.add(this.getSideVector());
            isMovement = true;
        }
        if (!isMovement) {
            this.player.currentMovement = "IDLE";
        }

        this.player.direction.normalize();      
    }

   /**
     * getForwardVector
     * @method getForwardVector
     * @description Get the forward vector of the player's camera.
     * @returns {THREE.Vector3} - The forward vector.
     */
    getForwardVector() 
    {
        const forward = new THREE.Vector3();
        this.player.camera.getWorldDirection(forward);
        forward.y = 0;
        return forward;
    }

   /**
     * getSideVector
     * @method getSideVector
     * @description Get the side vector of the player's camera.
     * @returns {THREE.Vector3} - The side vector.
     */
    getSideVector() 
    {
        const side = new THREE.Vector3();
        this.player.camera.getWorldDirection(side);
        side.y = 0;
        side.cross(this.player.camera.up);
        return side;
    }

    /**
     * updateVelocity
     * @method updateVelocity
     * @description Update the player's velocity based on the current direction and control factor.
     * @param {number} controlFactor - The control factor based on the player's state (on ground or in the air).
     */
    updateVelocity(controlFactor) 
    {
        this.player.velocity.add(this.player.direction.multiplyScalar(controlFactor * this.params.movespeedFactor));
    }

   /**
     * updatePlayer
     * @method updatePlayer
     * @description Update the player's state including damping, gravity, movement, and collision detection.
     */
    updatePlayer() 
    {
        this.applyDamping();
        this.applyGravity();
        this.moveCollider();
        this.checkForGroundCollision();
        this.updateCameraPosition();
    }

    /**
     * applyDamping
     * @method applyDamping
     * @description Applies damping to the player's velocity to simulate deceleration.
     */
    applyDamping() 
    {
        let damping = Math.exp(this.params.dampFactor * this.engine.time.delta) - 1;
        if (!this.player.onFloor) damping *= 0.1; // Air resistance
        this.player.velocity.addScaledVector(this.player.velocity, damping);
    }


    /**
     * applyGravity
     * @method applyGravity
     * @description Applies gravity to the player's vertical velocity when not on the floor.
     */
    applyGravity() 
    {
        if (!this.player.onFloor) {
            this.player.velocity.y -= this.params.gravity * this.engine.time.delta;
        }
    }

    /**
     * moveCollider
     * @method moveCollider
     * @description Moves the player's collider based on its velocity and the elapsed time.
     */
    moveCollider() 
    {
        const deltaPosition = this.player.velocity.clone().multiplyScalar(this.engine.time.delta);
        this.player.collider.translate(deltaPosition);
    }

    /**
     * checkForGroundCollision
     * @method checkForGroundCollision
     * @description Checks for ground collision using the octree and adjusts the player's state accordingly.
     */
    checkForGroundCollision() 
    {
        const result = this.octree.capsuleIntersect(this.player.collider);
        this.player.onFloor = result && result.normal.y > 0;

        if (result) {
            if (!this.player.onFloor) {
                this.player.velocity.addScaledVector(result.normal, -result.normal.dot(this.player.velocity));
            }
            this.player.collider.translate(result.normal.multiplyScalar(result.depth));
        }
    }

    /**
     * updateCameraPosition
     * @method updateCameraPosition
     * @description Updates the player's camera position based on the collider's end position.
     */
    updateCameraPosition() 
    {
        this.player.camera.position.copy(this.player.collider.end);
    }

    /**
     * teleportIfOut
     * @method teleportIfOut
     * @description Teleports the player to a reset position if below a specified vertical threshold.
     */
    teleportIfOut() 
    {
        if (this.player.camera.position.y <= -25) {
            this.resetPlayerPosition();
        }
    }

    /**
     * resetPlayerPosition
     * @method resetPlayerPosition
     * @description Resets the player's position and camera orientation to a default state.
     */
    resetPlayerPosition() 
    {
        this.player.collider.start.set(0, 0.35, 0);
        this.player.collider.end.set(0, 1, 0);
        this.player.collider.radius = 0.35;
        this.player.camera.position.copy(this.player.collider.end);
        this.player.camera.rotation.set(0, 0, 0);
    }

    /**
     * jump
     * @method jump
     * @description Initiates a jump action if the player is currently on the floor.
     */
    jump() 
    {
        if (this.player.onFloor) {
            this.player.velocity.y = 8;
            this.player.currentMovement = "JUMP";
        }
    }

    /**
     * shift
     * @method shift
     * @description Increases the player's movement speed factor when the shift button is pressed.
     */
    shift()
    {
        this.params.movespeedFactor = 3.0;
    }

    /**
     * unshift
     * @method unshift
     * @description Resets the player's movement speed factor to the default value when the shift button is released.
     */
    unshift()
    {
        this.params.movespeedFactor = 1.4;
    }

}