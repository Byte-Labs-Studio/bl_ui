import { type GameType } from "@enums/gameTypes";

type GameTypeKeys = keyof typeof GameType;

export type TLevelState = 'success' | 'fail' | null


export type TDifficultyParam = TGameParams & {
    difficulty: number;
}

export type TKeyGameParam = TGameParams & {
    difficulty: number;
    numberOfKeys: number;
}

export type THackGameParam = TGameParams & {
    /** In Seconds. The duration of the game. If its an array, the first number is the min duration and the second is the max duration. when randomized */
    duration: number | [number, number];
}

export type TNodeHackGameParam = THackGameParam & {
    /** The number of nodes to draw on the path. If its an array, the first number is the min number of nodes and the second is the max number of nodes. when randomized */
    numberOfNodes: number | [number, number];
}

export type TLevelHackGameParam = THackGameParam & {
    /** The number of levels to play. If its an array, the first number is the min number of levels and the second is the max number of levels. when randomized */
    level: number | [number, number];
}

export type TLengthHackGameParam = THackGameParam & {
    /** The number of levels to play. If its an array, the first number is the min number of levels and the second is the max number of levels. when randomized */
    length: number | [number, number];
}

export type TInputHackGameParam = THackGameParam &
    ({ code: string[] | number[]; length?: number | [number, number] }
    | { code?: string[] | number[]; length: number | [number, number] });

export type TGridHackGameParam = THackGameParam & {
    /** The size fo the grid to play. If its an array, the first number is the min size and the second is the max size. when randomized */
    grid: number | [number, number];

    /** The targets to play. If its an array, the first number is the min target and the second is the max target. when randomized */
    target?:  number | [number, number];
    previewDuration?:number
}

export type TTHackGameParams = THackGameParam | TNodeHackGameParam;

export type TGameTypeParams = TDifficultyParam | TKeyGameParam | TTHackGameParams | TGridHackGameParam

export type TGameParams = {
    type: GameTypeKeys;
    iterations: number;
    config: TGameTypeParams;
}

export type TGameState = TGameParams & {
    active: boolean;
}

