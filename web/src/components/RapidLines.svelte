<script lang="ts">
    import { type TRapidLinesState } from '@typings/rapidLines';
    import { scale } from 'svelte/transition';
    import Line from './RapidLines/Line.svelte';
    import { type TKeyGameParam, type TLevelState } from '@typings/gameState';
    import { TempInteractListener } from '@utils/interactHandler';
    import GAME_STATE from '@stores/GAME_STATE';
    import { GameType } from '@enums/gameTypes';
    import { delay } from '@utils/misc';
    import { KEYS, RAPID_LINES } from './config/gameConfig';
    import { tweened } from 'svelte/motion';
    import { get } from 'svelte/store';
    import { Key } from '@enums/events';

    let RapidLinesState: TRapidLinesState = null;

    let Visible: boolean = false;

    let IterationState: TLevelState = null;

    let KeyListener: ReturnType<typeof TempInteractListener>;

        let CleanUpFunctions: Function[] = [];

function clearCleanUpFunctions() {
    CleanUpFunctions.forEach(fn => fn());
    CleanUpFunctions = [];
}

    //The code above shows the circle progress when the game is active and type is circle progress
    GAME_STATE.subscribe(state => {
        let shouldShow =
            state.active &&
            state.type === GameType.RapidLines &&
            !RapidLinesState;

        if (shouldShow) {
            clearCleanUpFunctions();
            Visible = true;
            initialise();
        } else if (Visible && !shouldShow) {
            Visible = false;
            RapidLinesState = null;
            IterationState = null;
            clearKeyListeners();
            clearCleanUpFunctions();
        }
    });

    /** This code is responsible for clearing the key listeners.
     */
    function clearKeyListeners() {
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

        return new Promise((resolve, _) => {
            const { lines, zone } = RapidLinesState;

            const { ZONE_FROM_RIGHT } = RAPID_LINES;

            const zoneRange = {
                max: ZONE_FROM_RIGHT,
                min: ZONE_FROM_RIGHT - zone,
            };

            let lineSubscriptions = [];


            function clearLineSubscriptions(success: boolean) {
                lineSubscriptions.forEach(sub => sub());
                lineSubscriptions = [];

                lines.forEach((line, i) => {
                    let { left } = line;
                    left.set(get(left), { duration: 0 });
                    RapidLinesState.lines[i].state = success
                        ? 'success'
                        : 'fail';
                });

                resolve(success);
            }

            
            CleanUpFunctions.push(() => {
                lineSubscriptions?.forEach(sub => sub());
                resolve(false);
            })

            lines.forEach((key, i) => {
                let originalLine = RapidLinesState.lines[i];
                lineSubscriptions.push(
                    key.left.subscribe(value => {
                        if (
                            value > zoneRange.min &&
                            value < zoneRange.max &&
                            originalLine.state !== 'success'
                        ) {
                            originalLine.state = 'active';
                        } else if (
                            (value == 100 || value > zoneRange.max) &&
                            originalLine.state !== 'success'
                        ) {
                            originalLine.state = 'fail';
                            clearLineSubscriptions(false);
                        }
                        RapidLinesState.lines[i] = originalLine;
                    }),
                );
            });

            KeyListener = TempInteractListener(
                Key.pressed,
                (e: KeyboardEvent) => {
                    const key = e.key.toUpperCase();

                    if (key !== KEYS.Primary) {
                        return;
                    }

                    let anyInZone = false;

                    let furthestLine = 0;
                    let furthestLineIndex = 0;

                    lines.forEach((line, i) => {
                        let { left, state } = line;

                        if (state === 'active') {
                            const leftValue = get(left);
                            if (
                                leftValue > zoneRange.min &&
                                leftValue < zoneRange.max
                            ) {
                                anyInZone = true;
                                if (leftValue > furthestLine) {
                                    furthestLineIndex = i;
                                    furthestLine = leftValue;
                                }
                            }
                        }
                    });

                    if (!anyInZone) {
                        clearLineSubscriptions(false);
                    } else {

                        GAME_STATE.playSound('primary');

                        const targetLine =
                            RapidLinesState.lines[furthestLineIndex];
                        targetLine.state = 'success';

                        RapidLinesState.lines[furthestLineIndex] = targetLine;

                        const allSuccess = RapidLinesState.lines.every(
                            line => line.state === 'success',
                        );

                        if (allSuccess) {
                            clearLineSubscriptions(true);
                        }
                    }
                },
            );
        });
    }

    /** This code is responsible for starting the game.
     * @param iterations The number of iterations to play.
     * @param gameData The difficulty data of the game.
     */
    async function startGame(iterations: number, config: TKeyGameParam) {
        if (!Visible) return;

        clearKeyListeners();

        let { difficulty, numberOfKeys } = config;
        difficulty =
            (difficulty || RAPID_LINES.FALLBACK_DIFFICULTY) >= 100
                ? 99
                : difficulty <= 0
                  ? 5
                  : difficulty;
        numberOfKeys = numberOfKeys || RAPID_LINES.FALLBACK_NUM_LINES;

        const duration = generateDuration(difficulty);
        const lines = generateLines(numberOfKeys, duration);
        const zone = generateZone(difficulty);
        RapidLinesState = {
            duration,
            lines,
            zone,
        };

        IterationState = null;

        await delay(500);

        if (!RapidLinesState) return

        const success = await playIteration();

        clearKeyListeners();

        if (!RapidLinesState) return

        IterationState = success ? 'success' : 'fail';

        const isGameOver = success && iterations <= 1;
        if (success && isGameOver) {
            GAME_STATE.playSound('win');
        } else if (!isGameOver && success) {
            GAME_STATE.playSound('iteration');
        } else {
            GAME_STATE.playSound('lose');
        }


        let timeout = setTimeout(() => {
            if (!Visible) return;

            if (success && iterations > 0) {
                iterations--;
                if (iterations > 0) {
                    startGame(iterations, config);
                } else {
                    GAME_STATE.finish(true);
                    RapidLinesState = null;
                    return;
                }
            } else {
                GAME_STATE.finish(false);
                RapidLinesState = null;
                return;
            }
        }, 500);

        CleanUpFunctions.push(() => {
            if (timeout) clearTimeout(timeout);
            IterationState = null;
        })
    }

    /** This code is responsible for generating a duration for a progress bar based on the difficulty.
     */
    function initialise() {
        if (!$GAME_STATE.active || RapidLinesState) return;

        const { iterations, config } = $GAME_STATE;
        startGame(iterations, config as TKeyGameParam);
    }

    /**
     * Generate the zone size on the difficulty
     * @param difficulty The difficulty should be between 0 and 100.
     */
    function generateZone(difficulty: number): number {
        /** Set the minimum and maximum duration for a progress bar */
        const { MIN, MAX } = RAPID_LINES.ZONE;

        /** Calculate the duration based on the difficulty */
        let size: number = MIN + (MAX - MIN) * ((100 - difficulty) / 100);

        /** Make the duration vary by 20% */
        const variation: number = size * 0.2;
        const randomVariation: number = Math.random() * variation;
        size += randomVariation;

        // Return the duration
        return size;
    }

    /**
     * Generate a duration for a line duration bar based on the difficulty
     * @param difficulty The difficulty should be between 0 and 100.
     */
    function generateDuration(difficulty: number): number {
        /** Set the minimum and maximum duration for a progress bar */
        const { MIN, MAX } = RAPID_LINES.DURATION;

        /** Calculate the duration based on the difficulty */
        let duration: number = MIN + (MAX - MIN) * ((100 - difficulty) / 100);

        /** Make the duration vary by 20% */
        const variation: number = duration * 0.2;
        const randomVariation: number = Math.random() * variation;
        duration += randomVariation;

        // Return the duration
        return duration;
    }

    /**
     * Generate the keys to be pressed.
     */
    function generateLines(numLines: number, duration: number) {
        const lines = [];
        for (let i = 0; i < numLines; i++) {
            const random = Math.random() * 100;
            const durationRandom = duration * (0.2 + Math.random() * 0.6);
            const timeoutDuration = durationRandom + (random / 100 + i * 10);

            const line = {
                left: tweened(0, { duration: 0 }),
                state: null,
            };

            setTimeout(() => {
                if (IterationState) return;
                line.left.set(100, { duration });
            }, timeoutDuration * i);

            lines.push(line);
        }

        return lines;
    }
</script>

{#if Visible}
    <div
        transition:scale
        class="primary-shadow default-game-position w-[20vw] h-[0.5vw] primary-bg flex items-center"
    >
        <div
            class="h-[2.5vw] aspect-square absolute grid place-items-center center-y primary-shadow  primary-bg -translate-x-[130%]"
        >
            <p
                transition:scale={{ duration: 100 }}
                class="text-shadow absolute font-bold text-[2vw]"
            >
                {KEYS.Primary}
            </p>
        </div>

        {#if RapidLinesState}
            <div
                style="width: {RapidLinesState.zone}%; left: {RAPID_LINES.ZONE_FROM_RIGHT}%;"
                class="bg-tertiary primary-shadow h-[1vw] z-0 absolute -translate-x-full"
            />

            {#each RapidLinesState.lines as line, i}
                <Line {...line} />
            {/each}
        {/if}
    </div>
{/if}
