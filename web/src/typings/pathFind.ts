import type { Tweened } from "svelte/motion";

export type IPathFindTarget = {
    x: number;
    y: number;
    // If it has already been selected
    selected: boolean;
}

export interface IPathFindGameState {
    // Percentages of the container
    targets: IPathFindTarget[],
    
    activeIndex: number;
}


// export interface IPathGameParam