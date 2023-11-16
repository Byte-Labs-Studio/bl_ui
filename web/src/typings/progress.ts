export interface IProgressGameState {
    target: {
        /** The target rotation, degrees. */
        progress: number;
        /** The target size, degrees. */
        size: number;
    }
    duration: number;
    key : string;
}