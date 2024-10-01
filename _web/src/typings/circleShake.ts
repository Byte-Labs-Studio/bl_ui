

export type TCircleShakeGameState = {
    stages: number;
    currentStage: number;
    target: {
        /** The target rotation, degrees. */
        rotation: number;
        /** The target size, degrees. */
        size: number;
    }
    progress: number;
}