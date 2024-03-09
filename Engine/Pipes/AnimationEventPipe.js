
import { Pipe } from "@Core/Pipe";

export const AnimationEventPipe = new Pipe();

export const FirstPersonAnimationEvent = new CustomEvent('pov animation', {
    detail: {
        enum: undefined,
        weapon: undefined,
    }
});