
export type TPrintLockPrint = string[]

export type TPrintLockSection = {
    print: number;
    locked: boolean;
}

export type TPrintLockGameState = {
    prints: TPrintLockPrint[];

    sections: TPrintLockSection[]

    currentIteration: number;

    duration: number;
}