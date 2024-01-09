<script lang="ts">
    import { GameType } from "@enums/gameTypes";
    import GAME_STATE from "@stores/GAME_STATE";
    import { KeyGameParam, LevelState } from "@typings/gameState";
    import { IRapidCircleGameState } from "@typings/rapidCircle";
    import { TempInteractListener } from "@utils/interactHandler";
    import { Tweened, tweened } from "svelte/motion";
    import { KEYS, RAPID_CIRCLE } from "./config/gameConfig";
    import { delay } from "@utils/misc";
    import { Key } from "@enums/events";
    import { scale } from "svelte/transition";

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

    let RapidCircleState: IRapidCircleGameState = null;

    let IterationState: LevelState = null;

    let KeyListener: ReturnType<typeof TempInteractListener>;

        GAME_STATE.subscribe(state => {
        let shouldShow =
            state.active &&
            state.type === GameType.RapidCircle &&
            !RapidCircleState;
        if (shouldShow) {
            Visible = true;
            initialise();
        } else if (Visible && !shouldShow) {
            Visible = false;
            RapidCircleState = null;
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

    function userCycle() {
        if (!Visible) return;

        const duration = RapidCircleState.duration;
        UserRotation.set(100, {
            duration,
        });

        return new Promise((resolve, _) => {
            let timeout = setTimeout(() => {
                resolve(false);
            }, duration);

            KeyListener = TempInteractListener(Key.pressed, (e: KeyboardEvent) => {

                const key = e.key.toUpperCase();

                if (key !== KEYS.Primary) {
                    return;
                }

                clearTimeout(timeout);

                UserRotation.set($UserRotation, {
                    duration: 0,
                });

            });
        });
    }+
    
    /** This code is responsible for playing the iteration of the minigame.
     * This code should be called when the user presses the spacebar.
     * The code will return a promise that resolves to true if the user has
     * correctly input the key, and false otherwise.
     */
     async function playIteration() {
        if (!Visible) return;

        const duration = RapidCircleState.duration;
        UserRotation.set(100, {
            duration,
        });

        return new Promise((resolve, _) => {
            let timeout = setTimeout(() => {
                resolve(false);
            }, duration);

            KeyListener = TempInteractListener(Key.pressed, (e: KeyboardEvent) => {

                const key = e.key.toUpperCase();

                if (key !== KEYS.Primary) {
                    return;
                }

                clearTimeout(timeout);

                UserRotation.set($UserRotation, {
                    duration: 0,
                });

                


                const userRotDeg = ($UserRotation / 100) * 360;

                const { currentTarget } = RapidCircleState;

                const targetRotDeg = currentTarget.rotation;
                const targetSize = currentTarget.size * 3.6;

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
            });
        });
    }



        /** This code is responsible for starting the game.
     * @param iterations The number of iterations to play.
     * @param difficulty The difficulty of the game.
     */
     async function startGame(iterations, config: KeyGameParam) {
        if (!Visible) return;

        clearKeyListener();

        UserRotation.set(0, {
            duration: 0,
        });

        let { difficulty } = config;

        difficulty = (difficulty || RAPID_CIRCLE.FALLBACK_DIFFICULTY ) >= 100 ? 99 : difficulty <= 0 ? 5 : difficulty;

        // CircleState = {
        //     target: generateTargetSegment(difficulty),
        //     duration: generateDuration(difficulty),
        //     key: GetRandomKeyFromSet('Numbers'),
        // };
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
                    RapidCircleState = null;
                    return;
                }
            } else {
                GAME_STATE.finish(false);
                RapidCircleState = null;
                return;
            }
        }, 500);
    }


    /** This code is responsible for generating a duration for a progress bar based on the difficulty.
     */
     function initialise() {
        if (!$GAME_STATE.active || RapidCircleState) return;

        const { iterations, config } = $GAME_STATE;
        startGame(iterations, config as KeyGameParam);
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
                <p transition:scale={{duration: 100}} class="text-shadow absolute font-bold text-[2vw]">
                    {KEYS.Primary}
                </p>
        </div>

        <svg
            style={SIZE_STYLES}
            version="1.1"
            class="z-0 absolute overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
        >
            {#if RapidCircleState}
                <circle
                    style="stroke-width: {RADIUS * 0.1}vw"
                    class="absolute fill-none stroke-primary-50"
                    cx="50%"
                    cy="50%"
                    r="{RADIUS * 0.95}vw"
                />

                {@const { size, rotation } = RapidCircleState.currentTarget}
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