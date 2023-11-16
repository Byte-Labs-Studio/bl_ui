<script lang="ts">
    import { GameType } from '@enums/gameTypes';
    import GAME_STATE from '@stores/GAME_STATE';
    import { type LevelState } from '@typings/gameState';
    import { type IKeyCircleGameState } from '@typings/keyCircle';
    import { TempReceiveEvent } from '@utils/eventsHandlers';
    import { delay } from '@utils/misc';
    import { type Tweened, tweened } from 'svelte/motion';
    import { scale } from 'svelte/transition';
    import { GetRandomKeyFromSet, KEY_CIRCLE_DURATION, KEY_CIRCLE_STAGES, PROGRESS_DURATION } from './config/gameConfig';
    import { Receive } from '@enums/events';

    const UserRotation: Tweened<number> = tweened(0);

    let UserPressedKeys: { [key: string]: boolean } = {};

    const STROKE_WIDTH: number = 0.5;
    const RADIUS: number = 5;
    const DIAMETER: number = RADIUS * 2;
    const CIRCUMFERENCE: number = 2 * Math.PI * RADIUS;

    const SIZE_STYLES: string = `
        width: ${DIAMETER}vw;
        height: ${DIAMETER}vw;
    `;

    const SIZE_STYLES_QUARTER: string = `
        width: ${DIAMETER / 4}vw;
        height: ${DIAMETER / 4}vw;
    `;

    let Visible: boolean = false;

    let KeyCircleState: IKeyCircleGameState = null;

    let IterationState: LevelState = null;

    let KeyListeners: {
        Down: ReturnType<typeof TempReceiveEvent>;
        Up: ReturnType<typeof TempReceiveEvent>;
    } = {
        Down: null,
        Up: null,
    };

    //The code above shows the circle progress when the game is active and type is circle progress
    GAME_STATE.subscribe(state => {
        let shouldShow =
            state.active &&
            state.type === GameType.KeyCircle &&
            !KeyCircleState;
        if (shouldShow) {
            Visible = true;
            initialise();
        } else if (Visible && !shouldShow) {
            Visible = false;
            KeyCircleState = null;
            IterationState = null;
            clearKeyListeners();
        }
    });

    /** This code is responsible for clearing the key listeners.
     */
    function clearKeyListeners() {
        KeyListeners.Down?.removeListener();
        KeyListeners.Up?.removeListener();
        KeyListeners = {
            Down: null,
            Up: null,
        };

        UserPressedKeys = {};
    }

    /** This code is responsible for playing the iteration of the minigame.
     * This code should be called when the user presses the spacebar.
     * The code will return a promise that resolves to true if the user has
     * correctly input the key, and false otherwise.
     */
    async function playIteration() {
        const duration = KeyCircleState.duration;

        const { currentStage, stages, keys } = KeyCircleState;
        const newValue = Math.floor((currentStage / stages) * 100);

        UserRotation.set(newValue, {
            duration,
        });

        return new Promise((resolve, _) => {
            let timeout = setTimeout(() => {
                resolve(false);
                return;
            }, duration);

            clearKeyListeners();

            KeyListeners.Down = TempReceiveEvent(
                Receive.keydown,
                (e: KeyboardEvent) => {
                    UserPressedKeys[e.key.toUpperCase()] = true;

                    if (IterationState) return;

                    const pressedKeys = Object.keys(UserPressedKeys);

                    if (pressedKeys.length === 2) {
                        clearTimeout(timeout);
                        clearKeyListeners();

                        const containsFirstKey = pressedKeys.includes(keys[0]);
                        const containsSecondKey = pressedKeys.includes(keys[1]);

                        UserRotation.set(newValue, {
                            duration: 0,
                        });

                        if (containsFirstKey && containsSecondKey) {
                            KeyCircleState.currentStage++;

                            if (
                                KeyCircleState.currentStage >
                                KeyCircleState.stages
                            ) {
                                resolve(true);
                                return;
                            }

                            KeyCircleState.keys = [
                                GetRandomKeyFromSet('PrimarySet'),
                                GetRandomKeyFromSet('SecondarySet'),
                            ];

                            resolve(playIteration());
                        } else {
                            resolve(false);
                            return;
                        }
                    }
                },
            );

            KeyListeners.Up = TempReceiveEvent(
                Receive.keyup,
                (e: KeyboardEvent) => {
                    delete UserPressedKeys[e.key.toUpperCase()];
                },
            );
        });
    }

    /** This code is responsible for starting the game.
     * @param iterations The number of iterations to play.
     * @param difficulty The difficulty of the game.
     */
    async function startGame(iterations, difficulty) {
        if (!$GAME_STATE.active) return;

        clearKeyListeners();

        UserRotation.set(0, {
            duration: 0,
        });

        KeyCircleState = {
            stages: generateStages(difficulty),
            currentStage: 1,
            duration: generateDuration(difficulty),
            keys: [
                GetRandomKeyFromSet('PrimarySet'),
                GetRandomKeyFromSet('SecondarySet'),
            ],
        };
        IterationState = null;

        await delay(500);

        const success = await playIteration();
        IterationState = success ? 'success' : 'fail';

        setTimeout(() => {
            if (success && iterations > 0) {
                iterations--;
                if (iterations > 0) {
                    startGame(iterations, difficulty);
                } else {
                    GAME_STATE.finish(true);
                    KeyCircleState = null;
                    return;
                }
            } else {
                GAME_STATE.finish(false);
                KeyCircleState = null;
                return;
            }
        }, 500);
    }

    /** This code is responsible for generating a duration for a progress bar based on the difficulty.
     */
    function initialise() {
        if (!$GAME_STATE.active || KeyCircleState) return;

        const { iterations, difficulty } = $GAME_STATE;
        startGame(iterations, difficulty);
    }

    /**
     * Generate a duration for a progress bar based on the difficulty
     * @param difficulty The difficulty should be between 0 and 100.
     */
    function generateDuration(difficulty): number {
        /** Set the minimum and maximum duration for a progress bar */
        const { MIN, MAX } = KEY_CIRCLE_DURATION;

        /** Calculate the duration based on the difficulty */
        let duration: number = MIN + (MAX - MIN) * ((100 - difficulty) / 100);

        /** Make the duration vary by 20% */
        const variation: number = duration * 0.2;
        const randomVariation: number = Math.random() * variation;
        duration += randomVariation;

        // Return the duration
        return duration;
    }

    function generateStages(difficulty): number {
        // Make sure the difficulty is between 0 and 100.
        difficulty = difficulty >= 100 ? 99 : difficulty <= 0 ? 5 : difficulty;

        // Calculate the target size based on the difficulty.
        const { MIN, MAX } = KEY_CIRCLE_STAGES;
        const _stages = MIN + (MAX - MIN) * (difficulty / 100);

        const stages = Math.floor(_stages);

        return stages;
    }

</script>

{#if Visible}
    <div
        transition:scale
        style={SIZE_STYLES}
        class="grid place-items-center primary-shadow center-x bottom-[5vh] rounded-full w-fit h-fit"
    >
        {#if KeyCircleState}
            {#key KeyCircleState}
                <div
                    transition:scale
                    class="flex flex-row items-center justify-center absolute"
                >
                    {#each KeyCircleState?.keys as key}
                        <div
                            style={SIZE_STYLES_QUARTER}
                            class="grid place-items-center secondary-shadow bg-primary-50"
                        >
                            <!-- {#key CircleState.target} -->
                            <p
                                transition:scale={{ duration: 100 }}
                                class="text-shadow absolute font-bold text-[2vw]"
                            >
                                {key}
                            </p>
                            <!-- {/key} -->
                        </div>
                    {/each}
                </div>
            {/key}
        {/if}

        <svg
            style={SIZE_STYLES}
            version="1.1"
            class="z-0 absolute overflow-visible -rotate-90"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle
                style="stroke-width: {RADIUS * 0.1}vw"
                class="absolute fill-none stroke-primary-50"
                cx="50%"
                cy="50%"
                r="{RADIUS * 0.95}vw"
            />

            {#if KeyCircleState}
                {@const { stages } = KeyCircleState}
                <circle
                    style="transform: rotate({(1 / stages) * 360 - 90}deg);"
                    class=" absolute stroke-primary origin-center"
                    stroke-dasharray="{CIRCUMFERENCE}vw"
                    stroke-dashoffset="{CIRCUMFERENCE *
                        ((100 - $UserRotation) / 100)}vw"
                    stroke-width="{STROKE_WIDTH}vw"
                    fill-opacity="0"
                    cx="50%"
                    cy="50%"
                    r="{RADIUS * 0.95}vw"
                />
            {/if}
        </svg>
        {#if KeyCircleState}
            {@const { stages, currentStage } = KeyCircleState}
            {#each { length: stages } as _, i}
                <div
                    style="transform: rotate({((i + 1) / stages) * 360 -
                        90}deg);{SIZE_STYLES}"
                    class="  origin-center absolute"
                >
                    <div
                        class="absolute w-[0.5vw] h-[1vw] duration-100 transition-colors -translate-y-1/4 center-x {IterationState ==
                        'fail'
                            ? 'bg-fail glow-fail'
                            : currentStage === i ||
                              (currentStage === stages && i === 0)
                            ? 'bg-accent glow-accent'
                            : (currentStage >= i && i !== 0) ||
                              IterationState === 'success'
                            ? 'bg-success glow-success'
                            : 'bg-primary primary-shadow'} "
                    />
                </div>
            {/each}
        {/if}
    </div>
{/if}
