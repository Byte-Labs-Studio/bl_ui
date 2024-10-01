import { Tweened } from "svelte/motion";

export type TLineState = 'success' | 'fail' | 'active' | null


export type TRapidLinesState = {
    lines: {
        left: Tweened<number>;
        state: TLineState;
    }[];

    /**
     * The duration of one number to slide from left to right.
     */
    duration: number;

    /**
     * The size of the zone.
     */
    zone: number;
}