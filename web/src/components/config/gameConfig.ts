type MinMax = {
    MIN: number;
    MAX: number;
};

/**
 * The minimum and maximum duration of the game in milliseconds.
 */
export const PROGRESS_DURATION: MinMax = {
    MIN: 500,
    MAX: 3000,
};

export const PROGRESS_SIZE: MinMax = {
    MIN: 2,
    MAX: 40,
};

/**
 * The minimum and maximum duration of the game in milliseconds.
 * */
export const KEY_CIRCLE_DURATION: MinMax = {
    MIN: 750,
    MAX: 1500,
};

/**
 * The minimum and maximum number of stages in the game.
 * */
export const KEY_CIRCLE_STAGES: MinMax = {
    MIN: 2,
    MAX: 20,
};

/**
 * Key Sets used for the games.
 */
export const KEYS = {
    /**
     * The Primary go to key.
     * */
    Primary: 'E',

    /**
     * The Secondary go to key.
     * */
    Secondary: 'Q',

    /**
     * All the number keys used for games.
     * */
    Numbers: ['1', '2', '3', '4'],

    /**
     * All the keys used for games. | Named primary since it's the most convenient for the player.
     * */
    PrimarySet: ['W', 'A', 'S', 'D'],

    /**
     * All the keys used for games. | Named secondary since it's not as convenient for the player.
     * */
    SecondarySet: ['I', 'J', 'K', 'L'],
};


/**
 * Get a random key from a set of keys.
 * @param set The set of keys to get a random key from.
 * @returns {string} The random key.
 * */
export function GetRandomKeyFromSet(set: keyof typeof KEYS): string {
    const keys = KEYS[set];
    return keys[Math.floor(Math.random() * keys.length)];
}
