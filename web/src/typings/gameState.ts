
export enum GameType {
    CircleProgress = "CircleProgress",
    Progress = "Progress",
}

type GameTypeKeys = keyof typeof GameType;


export interface IGameParams {
    type: GameTypeKeys;
    iterations: number;
    difficulty: number;
}

export interface IGameState extends IGameParams {
    active: boolean;
}

