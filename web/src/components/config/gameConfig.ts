

/**
 * The minimum and maximum duration of the game in milliseconds.
 */
export const PROGRESS_DURATION = {
    MIN: 500,
    MAX: 3000,
}

export const NUMBER_KEYS: string[] = ['1', '2', '3', '4']

export const GetRandonNumberKey = () => {
    return NUMBER_KEYS[Math.floor(Math.random() * NUMBER_KEYS.length)]
}