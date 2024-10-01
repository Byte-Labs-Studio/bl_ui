export type TDigitDazzleGameState = {
    // Percentages of the container
    code: number[]

    duration: number;

    currentIteration: number;
}

export type TDigitDazzleCode = {
    code: number;
    checking: boolean;
    state: null | 'correct' | 'included';
}