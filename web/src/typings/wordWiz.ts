export type TWordWizGameState = {
    // Array of letters representing the code
    word: string[];

    duration: number;

    currentIteration: number;
}

export type TWordWizCode = {
    letter: string | null;
    checking: boolean;
    state: null | 'correct' | 'included';
}