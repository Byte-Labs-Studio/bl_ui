import { Tweened } from "svelte/motion";

export type ILineState = 'success' | 'fail' | 'active' | null


export interface IRapidLinesState {
    lines: {
        left: Tweened<number>;
        state: ILineState;
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