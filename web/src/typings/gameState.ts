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

export type TTHackGameParams = THackGameParam | TNodeHackGameParam;

export type TGameTypeParams = TDifficultyParam | TKeyGameParam | TTHackGameParams

export type TGameParams = {
    type: GameTypeKeys;
    iterations: number;
    config: TGameTypeParams;
}

export type TGameState = TGameParams & {
    active: boolean;
}

