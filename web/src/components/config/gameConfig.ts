
/**
 * The Configuration for the Progress games.
 */
export const PROGRESS = {
    /**
     * The minimum and maximum duration of the game in milliseconds.
     */
    DURATION: {
        MIN: 500,
        MAX: 3000,
    },

    /**
     * The minimum and maximum size of the circle in degrees.
     */
    SIZE: {
        MIN: 2,
        MAX: 40,
    },

    FALLBACK_DIFFICULTY: 50,
};



/**
 * The Configuration for the Key Circle game.
 */
export const KEY_CIRCLE = {
    /**
     * The minimum and maximum duration of the game in milliseconds.
     */
    DURATION: {
        MIN: 250,
        MAX: 1500,
    },

    FALLBACK_NUM_KEYS: 3,
    FALLBACK_DIFFICULTY: 50,
};

export const KEY_SPAM = {
    /**
     * The minimum and maximum duration of the game in milliseconds.
     */
    DURATION: {
        MIN: 750,
        MAX: 5000,
    },

    FALLBACK_DIFFICULTY: 50,
};

export const NUMBER_SLIDE = {
    DURATION: {
        MIN: 500,
        MAX: 7500,
    },

    /**
     * The size of the zone in which the user must press the key
     * Default value is 15% of the bar
     */
    ZONE_SIZE: 15,

    FALLBACK_NUM_KEYS: 3,
    FALLBACK_DIFFICULTY: 50,
}

export const RAPID_LINES = {
    /**
     * The minimum and maximum duration of the lines from one side to the other.
     */
    DURATION: {
        MIN: 500,
        MAX: 3000,
    },

    /**
     * The minimum and maximum size of the zone in %.
     */
    ZONE: {
        MIN: 5,
        MAX: 40,
    },

    ZONE_FROM_RIGHT: 95,

    FALLBACK_DIFFICULTY: 50,
    FALLBACK_NUM_LINES: 3,
};

export const RAPID_CIRCLE = {
    /**
     * The minimum and maximum duration of the game in milliseconds.
     */
    DURATION: {
        MIN: 500,
        MAX: 3000,
    },

    
    /**
     * The minimum and maximum size of the zone in %.
     */
    ZONE: {
        MIN: 5,
        MAX: 10,
    },

    FALLBACK_DIFFICULTY: 50,
    FALLBACK_TARGETS: 3,
};

export const CIRCLE_SHAKE = {
    /**
     * The minimum and maximum duration of the game in milliseconds.
     */
    DURATION: {
        MIN: 1000,
        MAX: 10000,
    },

    /**
     * The minimum and maximum size of the circle in degrees.
     */
    SIZE: {
        MIN: 2,
        MAX: 15,
    },

    FALLBACK_DIFFICULTY: 50,
    FALLBACK_NUM_KEYS: 3,
};

export const DIGIT_DAZZLE = {
    /**
     * The minimum and maximum size of numbers.
     */
    SIZE: {
        MIN: 2,
        MAX: 8,
    },

    DEFAULT_LENGTH: 4,
};

export const WORD_WIZ = {
    /**
     * The minimum and maximum size of numbers.
     */
    SIZE: {
        MIN: 2,
        MAX: 8,
    },

    DEFAULT_LENGTH: 4,
};

export const PATH_FIND = {
    /**
     * The minimum and maximum duration of the game in milliseconds.
     */
    POINTS: {
        MIN: 2,
        MAX: 30,
    },

    /**
     * The minimum and maximum duration of the game in seconds.
     */
    DURATION: {
        MIN: 60,
        MAX: 10,
    },

    FALLBACK_DIFFICULTY: 50,
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

    Space: ' ',

    /**
     * All the number keys used for games.
     * */
    Numbers: ['1', '2', '3', '4'],

    // NumbersOnShift: ['!', '@', '#', '$'],

    /**
     * All the keys used for games. | Named primary since it's the most convenient for the player.
     * */
    PrimarySet: ['W', 'A', 'S', 'D'],

    /**
     * All the keys used for games. | Named secondary since it's not as convenient for the player.
     * */
    SecondarySet: ['I', 'J', 'K', 'L'],
};


export const WAVE_MATCH = {
    DEFAULT_WAVE: {
        speed: 1,
        amplitude: 1,
        wavelength: 1,
        segmentLength: 1,
        lineWidth: 10,
        timeModifier: 1,
    },

    MIN_WAVE: {
        speed: 0.1,
        amplitude: 0,
        wavelength: 0,
        segmentLength: 0.1,
        lineWidth: 10,
        timeModifier: 0.1,
    },

    MAX_WAVE: {
        speed: 5,
        amplitude: 100,
        wavelength: 10,
        segmentLength: 10,
        lineWidth: 30,
        timeModifier: 1,
    },

    STEP_WAVE: {
        speed: 0.1,
        amplitude: 0.1,
        wavelength: 0.1,
        segmentLength: 0.1,
        lineWidth: 0.1,
        timeModifier: 0.01,
    },

    MATCH_THRESHOLD: 97.5,
};

export const MINE_SWEEPER = {

    MISTAKES: 3,
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
