import { Vector3, Vector2 } from 'three';
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
export const WeaponEquipEvent = new CustomEvent('weapon equiped', {
    detail: { 
        enum: undefined,
        weapon: undefined, 
    }
});

export const WeaponFireEvent = new CustomEvent('weapon fired', {
    detail: {
        params: undefined,
        weapon: undefined,
    }
});

export const BulletImpactEvent = new CustomEvent('bullet impact', {
    detail: {
        point: new Vector3(),
        normal: new Vector3(),
        cameraPosition: new Vector3(),
        recoiledScreenCoord: new Vector2(),
    }
});

export const ShotOutWeaponFireEvent = new CustomEvent('shoutoutweapon fired', {});

export const NetworkEvent = new CustomEvent('network event', {
    detail: {
        enum: undefined,
        data: undefined,
    }
});

