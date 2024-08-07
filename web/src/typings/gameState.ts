import { type GameType } from "@enums/gameTypes";

type GameTypeKeys = keyof typeof GameType;

export type LevelState = 'success' | 'fail' | null


export type DifficultyParam = IGameParams & {
    difficulty: number;
}

export type KeyGameParam = IGameParams & {
    difficulty: number;
    numberOfKeys: number;
}

export type HackGameParam = IGameParams & {
    /** In Seconds. The duration of the game. If its an array, the first number is the min duration and the second is the max duration. when randomized */
    duration: number | [number, number];
}

export type NodeHackGameParam = HackGameParam & {
    /** The number of nodes to draw on the path. If its an array, the first number is the min number of nodes and the second is the max number of nodes. when randomized */
    numberOfNodes: number | [number, number];
}

export type HackGameParams = HackGameParam | NodeHackGameParam;

export type IGameTypeParams = DifficultyParam | KeyGameParam | HackGameParams

export type IGameParams = {
    type: GameTypeKeys;
    iterations: number;
    config: IGameTypeParams;
}

export type IGameState = IGameParams & {
    active: boolean;
}

