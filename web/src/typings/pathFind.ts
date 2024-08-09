export type TPathFindTarget = {
    x: number;
    y: number;
    // If it has already been selected
    selected: boolean;
}

export type TPathFindGameState = {
    // Percentages of the container
    targets: TPathFindTarget[],
    
    activeIndex: number;

    duration: number;

    currentIteration: number;
}