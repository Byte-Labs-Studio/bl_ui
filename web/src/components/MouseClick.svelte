<script lang="ts">
    import { type IMouseClickState } from '@typings/mouseClick';
    import { scale } from 'svelte/transition';
    import Line from './MouseClick/Line.svelte';
    import { type KeyGameParam, type LevelState } from '@typings/gameState';
    import { TempInteractListener } from '@utils/interactHandler';
    import GAME_STATE from '@stores/GAME_STATE';
    import { GameType } from '@enums/gameTypes';
    import { delay } from '@utils/misc';
    import { MOUSE_CLICK } from './config/gameConfig';
    import { tweened } from 'svelte/motion';
    import { get } from 'svelte/store';
    import { Mouse } from '@enums/events';

    let MouseClickState: IMouseClickState = null;

    let Visible: boolean = false;

    let IterationState: LevelState = null;

    let MouseListener: ReturnType<typeof TempInteractListener>;

    //The code above shows the circle progress when the game is active and type is circle progress
    GAME_STATE.subscribe(state => {
        let shouldShow =
            state.active &&
            state.type === GameType.MouseClick &&
            !MouseClickState;

        if (shouldShow) {
            Visible = true;
            initialise();
        } else if (Visible && !shouldShow) {
            Visible = false;
            MouseClickState = null;
            IterationState = null;
            clearMouseListeners();
        }
    });

    /** This code is responsible for clearing the key listeners.
     */
    function clearMouseListeners() {
        MouseListener?.removeListener();
        MouseListener = null;
    }

    /** This code is responsible for playing the iteration of the minigame.
     * This code should be called when the user presses the spacebar.
     * The code will return a promise that resolves to true if the user has
     * correctly input the key, and false otherwise.
     */
    async function playIteration() {
        if (!Visible) return;

        return new Promise((resolve, _) => {
            const { lines, zone } = MouseClickState;

            const { ZONE_FROM_RIGHT } = MOUSE_CLICK;

            const zoneRange = {
                max: ZONE_FROM_RIGHT,
                min: ZONE_FROM_RIGHT - zone,
            };

            let lineSubscriptions = [];

            function clearLineSubscriptions(success: boolean) {
                lineSubscriptions.forEach(sub => sub());
                lineSubscriptions = [];
                console.log('clearing', success);
                lines.forEach((line, i) => {
                    let { left } = line;
                    left.set(get(left), { duration: 0 });
                    MouseClickState.lines[i].state = success
                        ? 'success'
                        : 'fail';
                });

                resolve(success);
            }

            lines.forEach((key, i) => {
                let originalLine = MouseClickState.lines[i];
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
                            console.log(
                                'fail',
                                i,
                                MouseClickState.lines[i],
                                value,
                                originalLine.state,
                                MouseClickState.lines[i],
                            );
                            originalLine.state = 'fail';
                            clearLineSubscriptions(false);
                        }
                        MouseClickState.lines[i] = originalLine;
                    }),
                );
            });

            MouseListener = TempInteractListener(
                Mouse.click,
                (e: KeyboardEvent) => {
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

                    console.log(anyInZone, furthestLine, furthestLineIndex);

                    if (!anyInZone) {
                        clearLineSubscriptions(false);
                    } else {
                        const targetLine =
                            MouseClickState.lines[furthestLineIndex];
                        targetLine.state = 'success';

                        MouseClickState.lines[furthestLineIndex] = targetLine;

                        console.log(
                            furthestLineIndex,
                            MouseClickState.lines[furthestLineIndex],
                        );

                        const allSuccess = MouseClickState.lines.every(
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
    async function startGame(iterations, config: KeyGameParam) {
        if (!Visible) return;

        clearMouseListeners();

        let { difficulty, numberOfKeys } = config;
        difficulty =
            (difficulty || MOUSE_CLICK.FALLBACK_DIFFICULTY) >= 100
                ? 99
                : difficulty <= 0
                  ? 5
                  : difficulty;
        numberOfKeys = numberOfKeys || MOUSE_CLICK.FALLBACK_NUM_LINES;

        const duration = generateDuration(difficulty);
        const lines = generateLines(numberOfKeys, duration);
        const zone = generateZone(difficulty);
        MouseClickState = {
            duration,
            lines,
            zone,
        };

        IterationState = null;

        await delay(500);

        const success = await playIteration();

        clearMouseListeners();

        IterationState = success ? 'success' : 'fail';

        setTimeout(() => {
            if (!Visible) return;

            if (success && iterations > 0) {
                iterations--;
                if (iterations > 0) {
                    startGame(iterations, config);
                } else {
                    GAME_STATE.finish(true);
                    MouseClickState = null;
                    return;
                }
            } else {
                GAME_STATE.finish(false);
                MouseClickState = null;
                return;
            }
        }, 500);
    }

    /** This code is responsible for generating a duration for a progress bar based on the difficulty.
     */
    function initialise() {
        if (!$GAME_STATE.active || MouseClickState) return;

        const { iterations, config } = $GAME_STATE;
        startGame(iterations, config as KeyGameParam);
    }

    /**
     * Generate the zone size on the difficulty
     * @param difficulty The difficulty should be between 0 and 100.
     */
    function generateZone(difficulty: number): number {
        /** Set the minimum and maximum duration for a progress bar */
        const { MIN, MAX } = MOUSE_CLICK.ZONE;

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
        const { MIN, MAX } = MOUSE_CLICK.DURATION;

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
        class="primary-shadow default-game-position w-[20vw] h-[0.5vw] bg-primary-50 flex items-center"
    >
        <div
            class="h-[2.5vw] w-[5vw] absolute grid place-items-center center-y secondary-shadow bg-primary-50 -translate-x-[120%]"
        >
            <p
                transition:scale={{ duration: 100 }}
                class="text-shadow absolute font-bold text-[2vw]"
            >
                LMB
            </p>
        </div>
        {#if MouseClickState}
            <div
                style="width: {MouseClickState.zone}%; left: {MOUSE_CLICK.ZONE_FROM_RIGHT}%;"
                class="bg-primary secondary-shadow h-[2.5vw] z-0 absolute -translate-x-full"
            />

            {#each MouseClickState.lines as line, i}
                <Line {...line} />
            {/each}
        {/if}
    </div>
{/if}
