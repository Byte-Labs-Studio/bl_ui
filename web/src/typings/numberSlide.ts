import { Tweened } from "svelte/motion";

export type INumberSlideKeyState = 'success' | 'fail' | null


export interface INumberSlideGameState {
    keys: {
        key: string;
        left: Tweened<number>;
        state: INumberSlideKeyState;
    }[];

    /**
     * The duration of one number to slide from left to right.
     */
    duration: number;
}