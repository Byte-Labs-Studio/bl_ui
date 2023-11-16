import { type GameType } from "@enums/gameTypes";

type GameTypeKeys = keyof typeof GameType;

export type LevelState = 'success' | 'fail' | null

export interface IGameParams {
    type: GameTypeKeys;
    iterations: number;
    difficulty: number;
}

export interface IGameState extends IGameParams {
    active: boolean;
}

