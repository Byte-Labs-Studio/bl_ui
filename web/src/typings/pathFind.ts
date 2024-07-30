export interface IPathFindGameState {
    // Percentages of the container
    targets: {
        pos: [number, number];
        // If it has already been selected
        selected: boolean;
    },
    
    // The duration of the game
    duration?: number;
}