export type TCircleSumGameState = {
    duration: number;

    target: number;

    toggles: TCirleSumToggle[];

    currentIteration: number;
}

export type TCirleSumToggle = {
    value: number;
    active: boolean;
}