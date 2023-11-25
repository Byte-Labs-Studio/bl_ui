<script lang="ts">
    import GAME_STATE from '@stores/GAME_STATE';
    import { type ICircleProgressGameState } from '@typings/circleProgress';
    import { delay } from '@utils/misc';
    import { type Tweened, tweened } from 'svelte/motion';
    import { scale } from 'svelte/transition';
    import {
        GetRandomKeyFromSet,
        KEYS,
        PROGRESS
    } from './config/gameConfig';
    import { GameType } from '@enums/gameTypes';
    import {type DifficultyParam, type LevelState } from '@typings/gameState';
    import { Key } from '@enums/events';
    import { TempInteractListener } from '@utils/interactHandler';

    const UserSegmentSize: number = 2;
    const UserRotation: Tweened<number> = tweened(0);

    const STROKE_WIDTH: number = 1;
    const RADIUS: number = 4;
    const DIAMETER: number = RADIUS * 2;
    const CIRCUMFERENCE: number = 2 * Math.PI * RADIUS;

    const SIZE_STYLES: string = `
        width: ${DIAMETER}vw;
        height: ${DIAMETER}vw;
    `;

    const SIZE_STYLES_HALF: string = `
        width: ${DIAMETER / 2}vw;
        height: ${DIAMETER / 2}vw;
    `;

    let Visible: boolean = false;

    let CircleState: ICircleProgressGameState = null;

    let IterationState: LevelState = null;

    let KeyListener: ReturnType<typeof TempInteractListener>;

    //The code above shows the circle progress when the game is active and type is circle progress
    GAME_STATE.subscribe(state => {
        let shouldShow =
            state.active &&
            state.type === GameType.CircleProgress &&
            !CircleState;
        if (shouldShow) {
            Visible = true;
            initialise();
        } else if (Visible && !shouldShow) {
            Visible = false;
            CircleState = null;
            IterationState = null;
            clearKeyListener();
        }
    });

    /** This code is responsible for clearing the key listeners.
     */
    function clearKeyListener() {
        KeyListener?.removeListener();
        KeyListener = null;
    }

    /** This code is responsible for playing the iteration of the minigame.
     * This code should be called when the user presses the spacebar.
     * The code will return a promise that resolves to true if the user has
     * correctly input the key, and false otherwise.
     */
    async function playIteration() {
        if (!Visible) return;

        const duration = CircleState.duration;
        UserRotation.set(100, {
            duration,
        });

        return new Promise((resolve, _) => {
            let timeout = setTimeout(() => {
                resolve(false);
            }, duration);

            KeyListener = TempInteractListener(Key.pressed, (e: KeyboardEvent) => {

                const key = e.key.toUpperCase();

                if (!KEYS.Numbers.includes(key)) {
                    return;
                }

                clearTimeout(timeout);

                UserRotation.set($UserRotation, {
                    duration: 0,
                });

                


                if (key === CircleState.key) {
                    const userRotDeg = ($UserRotation / 100) * 360;
                    const targetRotDeg = CircleState.target.rotation;
                    const targetSize = CircleState.target.size * 3.6;

                    const userSize = UserSegmentSize * 3.6;
                    if (
                        userRotDeg > targetRotDeg - userSize &&
                        userRotDeg < targetSize + targetRotDeg
                    ) {
                        resolve(true);
                    } else {
                        resolve(false);
                        return;
                    }
                } else {
                    resolve(false);
                }
            });
        });
    }

    /** This code is responsible for starting the game.
     * @param iterations The number of iterations to play.
     * @param difficulty The difficulty of the game.
     */
    async function startGame(iterations, config: DifficultyParam) {
        if (!Visible) return;

        clearKeyListener();

        UserRotation.set(0, {
            duration: 0,
        });

        let { difficulty } = config;

        difficulty = (difficulty || PROGRESS.FALLBACK_DIFFICULTY ) >= 100 ? 99 : difficulty <= 0 ? 5 : difficulty;

        CircleState = {
            target: generateTargetSegment(difficulty),
            duration: generateDuration(difficulty),
            key: GetRandomKeyFromSet('Numbers'),
        };
        IterationState = null;

        await delay(500);

        const success = await playIteration();
        IterationState = success ? 'success' : 'fail';

        setTimeout(() => {
            if (!Visible) return;

            if (success && iterations > 0) {
                iterations--;
                if (iterations > 0) {
                    startGame(iterations, config);
                } else {
                    GAME_STATE.finish(true);
                    CircleState = null;
                    return;
                }
            } else {
                GAME_STATE.finish(false);
                CircleState = null;
                return;
            }
        }, 500);
    }

    /** This code is responsible for generating a duration for a progress bar based on the difficulty.
     */
    function initialise() {
        if (!$GAME_STATE.active || CircleState) return;

        const { iterations, config } = $GAME_STATE;
        startGame(iterations, config);
    }

    /**
     * Generate a duration for a progress bar based on the difficulty
     * @param difficulty The difficulty should be between 0 and 100.
     */
    function generateDuration(difficulty: number): number {
        /** Set the minimum and maximum duration for a progress bar */
        const { MIN, MAX } = PROGRESS.DURATION;

        /** Calculate the duration based on the difficulty */
        let duration: number = MIN + (MAX - MIN) * ((100 - difficulty) / 100);

        /** Make the duration vary by 20% */
        const variation: number = duration * 0.2;
        const randomVariation: number = Math.random() * variation;
        duration += randomVariation;

        // Return the duration
        return duration;
    }

    /** Generate a target segment for the given difficulty.
     * The higher the difficulty, the harder the target will be to hit.
     * @param difficulty The difficulty should be between 0 and 100.
     */
    function generateTargetSegment(difficulty: number): {
        size: number;
        rotation: number;
    } {
        /** Make sure the difficulty is between 0 and 100. */
        difficulty = difficulty >= 100 ? 99 : difficulty <= 0 ? 5 : difficulty;

        /** Calculate the target size based on the difficulty. */
        const { MAX } = PROGRESS.SIZE;
        const size = MAX - (difficulty / 100) * MAX;

        /**
         * Calculate the target rotation.
         * This is a number between 90 and 230.
         * */
        let rotation = 90 + Math.random() * 120;

        /**
         * Make sure the target size plus the target rotation is less than 360.
         * If it's not, subtract the difference from the target rotation.
         **/
        if (size * 3.6 + rotation > 360) {
            rotation -= size * 3.6 + rotation - 360;
        }

        return {
            size: size,
            rotation: rotation,
        };
    }
</script>

{#if Visible}
    <div
        transition:scale
        style={SIZE_STYLES}
        class="grid place-items-center primary-shadow default-game-position  rounded-full"
    >
        <div
            style={SIZE_STYLES_HALF}
            class="absolute secondary-shadow grid place-items-center bg-primary-50 rounded-full"
        >
            {#key CircleState.target}
                <p transition:scale={{duration: 100}} class="text-shadow absolute font-bold text-[2vw]">
                    {CircleState.key}
                </p>
            {/key}
        </div>

        <svg
            style={SIZE_STYLES}
            version="1.1"
            class="z-0 absolute overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
        >
            {#if CircleState}
                <circle
                    style="stroke-width: {RADIUS * 0.1}vw"
                    class="absolute fill-none stroke-primary-50"
                    cx="50%"
                    cy="50%"
                    r="{RADIUS * 0.95}vw"
                />

                {@const { size, rotation } = CircleState.target}
                <circle
                    style="transform: rotate({-90 + rotation}deg);"
                    class=" absolute radial stroke-primary origin-center target-segment"
                    stroke-dasharray="{CIRCUMFERENCE}vw"
                    stroke-dashoffset="{CIRCUMFERENCE * ((100 - size) / 100)}vw"
                    stroke-width="{STROKE_WIDTH}vw"
                    fill-opacity="0"
                    cx="50%"
                    cy="50%"
                    r="{RADIUS * 0.9}vw"
                />
                <circle
                    style="transform: rotate({-90 +
                        ($UserRotation / 100) * 360}deg);"
                    class=" absolute origin-center default-colour-transition {IterationState ===
                    'success'
                        ? 'glow-success stroke-success'
                        : IterationState === 'fail'
                        ? 'glow-fail stroke-fail'
                        : 'stroke-accent glow-accent'}"
                    stroke-dasharray="{CIRCUMFERENCE}vw"
                    stroke-dashoffset="{CIRCUMFERENCE *
                        ((100 - UserSegmentSize) / 100)}vw"
                    stroke-width="{STROKE_WIDTH}vw"
                    fill-opacity="0"
                    cx="50%"
                    cy="50%"
                    r="{RADIUS * 0.9}vw"
                />
            {/if}
        </svg>
    </div>
{/if}

<style>
    .target-segment {
        filter: drop-shadow(0 0 0.1vw black);
        transition: all 0.1s ease-in-out;
    }
</style>
