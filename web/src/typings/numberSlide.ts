import { Tweened } from "svelte/motion";

export type TNumberSlideKeyState = 'success' | 'fail' | null


export type TNumberSlideGameState = {
    keys: {
        key: string;
        left: Tweened<number>;
        state: TNumberSlideKeyState;
    }[];

    /**
     * The duration of one number to slide from left to right.
     */
    duration: number;
}