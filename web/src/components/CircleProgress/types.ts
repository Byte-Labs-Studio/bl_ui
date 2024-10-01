
export type TCircleProgressGameState = {
    target: {
        /** The target rotation, degrees. */
        rotation: number;
        /** The target size, degrees. */
        size: number;
    }

    /** The key to display on the circle. */
    key : string;

    /** The duration of the game. */
    duration: number;
}