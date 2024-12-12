export type TMineSweeperCell = {
    mine: boolean;
    clicked: boolean;
}

export type TMineSweeperCellStates = null | 'success' | 'fail';   
export type TMineSweeperCellUser = TMineSweeperCell & {
    state: TMineSweeperCellStates
}

export type TMineSweeperGameState = {
    // Percentages of the container
    grid: TMineSweeperCellUser[][];

    duration: number;

    currentIteration: number;
}