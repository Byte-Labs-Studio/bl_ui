export type Itarget = {
    /** The target rotation, degrees. */
    rotation: number;
    /** The target size, degrees. */
    size: number;
}


export interface IRapidCircleGameState {
    targets: Itarget[];
    currentTarget: Itarget;
    duration: number;
}