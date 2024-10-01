export type TWaveOptions = {
    speed: number;
    amplitude: number;
    wavelength: number;
    segmentLength: number;
    lineWidth: number;
    strokeStyle?: string;
    timeModifier?: number;
}


export type TWaveMatchGameState = {
    duration: number;

    currentIteration: number;

    userWave: TWaveOptions;

    targetWave: TWaveOptions;

    
    match: number;
}