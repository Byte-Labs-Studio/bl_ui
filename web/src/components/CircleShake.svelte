<script lang="ts">
    import { GameType } from '@enums/gameTypes';
    import GAME_STATE from '@stores/GAME_STATE';
    import type { TCircleShakeGameState } from '@typings/circleShake';
    import type { TKeyGameParam, TLevelState } from '@typings/gameState';
    import { scale } from 'svelte/transition';
    import { CIRCLE_SHAKE } from './config/gameConfig';
    import { delay, angle, numberToAngle } from '@utils/misc';
    import { TempInteractListener } from '@utils/interactHandler';
    import { Mouse } from '@enums/events';

    let Main_El: HTMLElement = null;

    const UserSegmentSize: number = 2;

    const STROKE_WIDTH: number = 0.5;
    const RADIUS: number = 5;
    const DIAMETER: number = RADIUS * 2;
    const CIRCUMFERENCE: number = 2 * Math.PI * RADIUS;

    const INNER_RADIUS: number = RADIUS / 1.5;
    const INNER_CIRCUMFERENCE: number = 2 * Math.PI * INNER_RADIUS;

    const SIZE_STYLES: string = `
        width: ${DIAMETER}vw;
        height: ${DIAMETER}vw;
    `;

    const SIZE_STYLES_HALF: string = `
        width: ${DIAMETER / 2}vw;
        height: ${DIAMETER / 2}vw;
    `;

    let Visible: boolean = false;

    let CircleState: TCircleShakeGameState = null;
    let UserRotation: number = 0;

    let IterationState: TLevelState = null;

    let MouseListener: ReturnType<typeof TempInteractListener>;

    let isOverTarget: boolean = false;

    let CleanUpFunctions: Function[] = [];

function clearCleanUpFunctions() {
    CleanUpFunctions.forEach(fn => fn());
    CleanUpFunctions = [];
}


    GAME_STATE.subscribe(state => {
        let shouldShow =
            state.active && state.type === GameType.CircleShake && !CircleState;
        if (shouldShow) {
            Visible = true;
            clearCleanUpFunctions()
            initialise();
        } else if (Visible && !shouldShow) {
            Visible = false;
            CircleState = null;
            IterationState = null;
            isOverTarget = false;
            clearCleanUpFunctions()
            clearMouseListener();
        }
    });

    /** This code is responsible for clearing the key listeners.
     */
    function clearMouseListener() {
        MouseListener?.removeListener();
        MouseListener = null;
    }

    /** This code is responsible for playing the iteration of the minigame.
     * This code should be called when the user presses the spacebar.
     * The code will return a promise that resolves to true if the user has
     * correctly input the key, and false otherwise.
     */
    async function playIteration(difficulty: number) {
        if (!Visible) return;

        const randomSpeed = () => Math.random() * (150 - 50) + 50;

        let speed = randomSpeed();

        isOverTarget = false;
        return new Promise((resolve, _) => {
            let checkInterval = setInterval(() => {
                if (!Visible || !isOverTarget) return;
                CircleState.progress += 1;
                if (CircleState.progress >= 100) {
                    if (CircleState.currentStage < CircleState.stages) {
                        CircleState.currentStage++;
                        CircleState.progress = 0;
                        CircleState.target = generateTarget(difficulty);
                        speed = randomSpeed();

                        isOverTarget = false;
                    } else {
                        isOverTarget = false;
                        clearInterval(checkInterval);
                        resolve(true);
                    }
                }
            }, speed);

            CleanUpFunctions.push(async () => {
                if (checkInterval) clearInterval(checkInterval);
            })

            let tempOverTarget: boolean = false;

            MouseListener = TempInteractListener(
                Mouse.move,
                (e: MouseEvent) => {
                    // set the user rotation based on the mouse position relative to the circle

                    const rect = Main_El.getBoundingClientRect();
                    const target = CircleState.target;

                    const mouseX = e.clientX;
                    const mouseY = e.clientY;

                    const anchorX = rect.left + rect.width / 2;
                    const anchorY = rect.top + rect.height / 2;

                    UserRotation = angle(mouseX, mouseY, anchorX, anchorY);

                    const targetAngle = numberToAngle(target.rotation);
                    const targetEndAngle = numberToAngle(
                        target.rotation + target.size * 3.6,
                    );

                    if (
                        UserRotation > targetAngle &&
                        UserRotation < targetEndAngle
                    ) {
                        tempOverTarget = true;
                        setTimeout(() => {
                            if (tempOverTarget) {
                                isOverTarget = true;
                            }
                        }, 500);
                    } else {
                        tempOverTarget = false;
                        isOverTarget = false;
                    }
                },
            );
        });
    }

    /** This code is responsible for starting the game.
     * @param iterations The number of iterations to play.
     * @param difficulty The difficulty of the game.
     */
    async function startGame(iterations, config: TKeyGameParam) {
        if (!Visible) return;

        clearMouseListener();

        UserRotation = 0;
        isOverTarget = false;

        let { difficulty, numberOfKeys } = config;
        difficulty =
            (difficulty || CIRCLE_SHAKE.FALLBACK_DIFFICULTY) >= 100
                ? 99
                : difficulty <= 0
                  ? 5
                  : difficulty;
        numberOfKeys = numberOfKeys || CIRCLE_SHAKE.FALLBACK_NUM_KEYS;

        CircleState = {
            target: generateTarget(difficulty),
            stages: numberOfKeys,
            currentStage: 1,
            progress: 0,
        };
        IterationState = null;

        await delay(500);

        const success = await playIteration(difficulty);
        IterationState = success ? 'success' : 'fail';

        let timeout = setTimeout(() => {
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

        CleanUpFunctions.push(async () => {
            if (timeout) clearTimeout(timeout);
        })
    }

    /** This code is responsible for generating a duration for a progress bar based on the difficulty.
     */
    function initialise() {
        if (!$GAME_STATE.active || CircleState) return;

        const { iterations, config } = $GAME_STATE;
        startGame(iterations, config as TKeyGameParam);
    }

    /** Generate a target segment for the given difficulty.
     * The higher the difficulty, the harder the target will be to hit.
     * @param difficulty The difficulty should be between 0 and 100.
     */
    function generateTarget(difficulty) {
        // Make sure the difficulty is between 0 and 100.
        difficulty = difficulty >= 100 ? 99 : difficulty <= 0 ? 5 : difficulty;
        // Calculate the target size based on the difficulty.
        const { MIN, MAX } = CIRCLE_SHAKE.SIZE;
        const size = MAX - ((difficulty / 100) * (MAX - MIN));


        const minRotation = -180;
        const maxRotation = 180;

        let rotation =
            Math.random() * (maxRotation - minRotation) + maxRotation;

        if (
            numberToAngle(rotation) > 0 &&
            numberToAngle(rotation + size * 3.6) < 0
        ) {
            rotation = rotation - size * 3.6;
        } else if (
            numberToAngle(rotation) < 0 &&
            numberToAngle(rotation + size * 3.6) > 0
        ) {
            rotation = rotation + size * 3.6;
        }

        return {
            size,
            rotation,
        };
    }
</script>

{#if Visible}
    <div
        bind:this={Main_El}
        transition:scale
        style={SIZE_STYLES}
        class="grid place-items-center origin-center primary-shadow default-game-position rounded-full circle-shake-main"
    >
        <div
            class:shake={isOverTarget}
            style={SIZE_STYLES_HALF}
            class="absolute primary-shadow grid place-items-center primary-bg rounded-full"
        >
            {#if CircleState}
                {@const numStage = CircleState.stages}
                {@const prog = CircleState.progress + '%'}
                {@const currentStage = CircleState.currentStage}
                <svg
                    version="1.1"
                    class="z-0 absolute overflow-visible w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {#each { length: numStage } as _, i}
                        {@const size = 100 / numStage}
                        {@const rotation = (i / numStage) * 360}
                        {@const stage = i + 1}
                        <circle
                            style="transform: rotate({-90 + rotation}deg);"
                            class="absolute radial {stage < currentStage
                                ? 'stroke-tertiary'
                                : stage == currentStage
                                  ? 'stroke-accent glow-accent '
                                  : 'primary-stroke'} origin-center "
                            stroke-dasharray="{INNER_CIRCUMFERENCE}vw"
                            stroke-dashoffset="{INNER_CIRCUMFERENCE *
                                ((101 - size) / 100)}vw"
                            stroke-width="{STROKE_WIDTH}vw"
                            fill-opacity="0"
                            cx="50%"
                            cy="50%"
                            r="{INNER_RADIUS}vw"
                        />
                    {/each}
                </svg>
                <div
                    class="absolute aspect-square w-full grid place-items-center rounded-full overflow-hidden z-10"
                >
                    <div
                        class="bg-accent glow-accent rounded-full aspect-square"
                        style="width: {prog}"
                    />
                </div>
            {/if}
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
                    class="absolute fill-none stroke-tertiary"
                    cx="50%"
                    cy="50%"
                    r="{RADIUS * 0.95}vw"
                />

                <circle
                    style="transform: rotate({UserRotation - 180}deg);"
                    class=" absolute origin-center default-colour-transition {IterationState ===
                    'success'
                        ? 'glow-success stroke-success'
                        : IterationState === 'fail'
                          ? 'glow-error stroke-error'
                          : 'stroke-accent glow-accent'}"
                    stroke-dasharray="{CIRCUMFERENCE}vw"
                    stroke-dashoffset="{CIRCUMFERENCE *
                        ((100 - UserSegmentSize) / 100)}vw"
                    stroke-width="{STROKE_WIDTH}vw"
                    fill-opacity="0"
                    cx="50%"
                    cy="50%"
                    r="{RADIUS * 0.95}vw"
                />
            {/if}
        </svg>
    </div>
{/if}

<style>
    .shake {
        animation: shake 0.1s infinite;
    }

    @keyframes shake {
        0% {
            transform: translate(0);
        }
        25% {
            transform: translate(-1px, 1px);
        }
        50% {
            transform: translate(1px, -1px);
        }
        75% {
            transform: translate(-1px, 1px);
        }
        100% {
            transform: translate(0);
        }
    }
</style>
