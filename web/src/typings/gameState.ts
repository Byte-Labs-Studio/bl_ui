import { type GameType } from "@enums/gameTypes";

type GameTypeKeys = keyof typeof GameType;

export type LevelState = 'success' | 'fail' | null


export type ProgressGameParams = IGameParams & {
    difficulty: number;
}

export type KeyCircleGameParams = IGameParams & {
    difficulty: number;
    numberOfKeys: number;
}

export type KeySpamGameParams = IGameParams & {
    difficulty: number;
}

export type NumberSlideGameParams = IGameParams & {
    difficulty: number;
    numberOfKeys: number;
}

export type IGameTypeParams = ProgressGameParams | KeyCircleGameParams | KeySpamGameParams | NumberSlideGameParams;

export type IGameParams = {
    type: GameTypeKeys;
    iterations: number;
    config: IGameTypeParams;
}

export type IGameState = IGameParams & {
    active: boolean;
}

