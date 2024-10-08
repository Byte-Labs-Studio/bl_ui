export type TUntangleNode = {
    x: number;
    y: number;
}

export type TuntangleGameState = {
    // Percentages of the container
    nodes: TUntangleNode[],

    duration: number;
    currentIteration: number;

    /**
     * The number of intersecting lines.
     */
    intersections: number;
}


export type TLine = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    intersecting?: boolean;
}