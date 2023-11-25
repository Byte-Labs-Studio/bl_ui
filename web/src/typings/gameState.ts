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

export type IGameTypeParams = DifficultyParam | KeyGameParam;

export type IGameParams = {
    type: GameTypeKeys;
    iterations: number;
    config: IGameTypeParams;
}

export type IGameState = IGameParams & {
    active: boolean;
}

