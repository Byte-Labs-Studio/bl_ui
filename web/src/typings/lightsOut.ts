

export type TLightsOutLevelState = 'success' | 'fail' | null

export type TLightsOutItem = boolean

export type TLightsOutGameState = {
    level: number;

    duration: number;

    currentIteration: number;

    items: TLightsOutItem[];
}