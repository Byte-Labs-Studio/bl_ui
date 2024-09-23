export type TCircleProgressGameState = {
    target: {
        /** The target rotation, degrees. */
        rotation: number;
        /** The target size, degrees. */
        size: number;
    }
    duration: number;
    key : string;

    sessionId: string;
}