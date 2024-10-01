<script lang="ts">
    import HackWrapper from '@lib/HackWrapper.svelte';
    import Knob from './LightsOut/Knob.svelte';
    import { scale } from 'svelte/transition';
    import type { TLightsOutGameState } from '@typings/lightsOut';
    import type {
        TLevelHackGameParam,
        TLevelState,
    } from '@typings/gameState';
    import { tweened, type Tweened } from 'svelte/motion';
    import GAME_STATE from '@stores/GAME_STATE';
    import { GameType } from '@enums/gameTypes';
    import { delay, getRandomIntFromIntOrArray } from '@utils/misc';
    import LevelConfig from './LightsOut/levels';

    let Visible: boolean = false;

    let LightsOutState: TLightsOutGameState = null;

    let IterationState: TLevelState = null;

    const UserDuration: Tweened<number> = tweened(0);

    let Iterations: number = null;

    let SuccessCheck: Function = null;

    GAME_STATE.subscribe(state => {
        let shouldShow =
            state.active &&
            state.type === GameType.LightsOut && !IterationState;
        if (shouldShow) {
            Visible = true;
            initialise();
        } else if (Visible && !shouldShow) {
            Visible = false;
            LightsOutState = null;
            IterationState = null;
        }
    });

    /** This code is responsible for playing the iteration of the minigame.
     * The code will return a promise that resolves to true if the user has
     * correctly input the key, and false otherwise.
     */
    async function playIteration() {
        if (!Visible) return;

        setTimeout(() => {
            UserDuration.set(LightsOutState.duration, {
                duration: LightsOutState.duration,
            });
        }, 500);

        return new Promise((resolve, _) => {
            let durationCheck = setTimeout(() => {
                finish(SuccessCheck(true))
            }, LightsOutState.duration + 500);

            SuccessCheck = (_return: boolean = false) => {
                const success = LightsOutState?.items.every(e => e === true);
                if (_return) return success

                if (LightsOutState.items.every(e => e === false)) {
                    finish(true);
                }
            }

            function finish(bool: boolean) {
                const currentValue = $UserDuration;
                UserDuration.set(currentValue, {
                    duration: 0,
                });

                clearTimeout(durationCheck);
                resolve(bool);
            }
        });
    }

    /** This code is responsible for starting the game.
     * @param iterations The number of iterations to play.
     * @param difficulty The difficulty of the game.
     */
    async function startGame(iterations: number, config: TLevelHackGameParam) {
        if (!Visible) return;

        UserDuration.set(0, {
            duration: 0,
        });

        const duration = getRandomIntFromIntOrArray(config.duration);
        const level = getRandomIntFromIntOrArray(config.level);

        LightsOutState = {
            level: level,
            duration: duration,
            currentIteration: Iterations - iterations,
            items: loadLevel(level),
        };

        IterationState = null;

        await delay(500);

        const success = await playIteration();
        IterationState = success ? 'success' : 'fail';

        await delay(500);

        setTimeout(() => {
            if (!Visible) return;
            if (success && iterations > 0) {
                iterations--;
                if (iterations > 0) {
                    startGame(iterations, config);
                } else {
                    GAME_STATE.finish(true);

                    LightsOutState = null;
                    return;
                }
            } else {
                GAME_STATE.finish(false);
                LightsOutState = null;
                return;
            }
        }, 1000);
    }

    /** This code is responsible for generating a duration for a progress bar based on the difficulty.
     */
    function initialise() {
        if (!$GAME_STATE.active || IterationState) return;

        const { iterations, config } = $GAME_STATE;
        Iterations = iterations;
        startGame(iterations, config as TLevelHackGameParam);
    }

    /**
     * Handle Click/Touchstart on Knob
     */
    let handleKnobClick = (index, event) => {
        if (!Visible || (SuccessCheck && SuccessCheck())) return;
        event.preventDefault();
        event.stopPropagation();
        toggleActive(index);

        if (navigator.vibrate) navigator.vibrate(100);

        let otherIndezes = [];
        let column = index % 5;
        let row = Math.floor(index / 5);

        if (column > 0 && column < 4) {
            otherIndezes.push(index - 1);
            otherIndezes.push(index + 1);
        } else if (column == 0) {
            otherIndezes.push(index + 1);
        } else if (column == 4) {
            otherIndezes.push(index - 1);
        }

        if (row > 0 && row < 4) {
            otherIndezes.push(index - 5);
            otherIndezes.push(index + 5);
        } else if (row == 0) {
            otherIndezes.push(index + 5);
        } else if (row == 4) {
            otherIndezes.push(index - 5);
        }

        // toggle active state
        otherIndezes.map(i => {
            toggleActive(i);
        });

        SuccessCheck();
    };

    function toggleActive(index: number) {
        if (!Visible) return;
        if (!LightsOutState) return;
        let item = LightsOutState.items[index];
        if (item === undefined) return;
        LightsOutState.items[index] = !item;
    }

    function loadLevel(level: number) {
        const empty_items = [];
        for (let index = 0; index < 25; index++) {
            if (LevelConfig[level].indexOf(index) !== -1) {
                empty_items.push(true);
            } else {
                empty_items.push(false);
            }
        }

        return empty_items;
    }
</script>

{#if Visible}
    {@const { items } = LightsOutState}
    <HackWrapper
        title={['Lights', 'Out']}
        subtitle="Turn off all the lights."
        iterations={Iterations}
        iteration={LightsOutState.currentIteration}
        progress={($UserDuration / LightsOutState.duration) * 100}
        state={IterationState}
    >
        <div
        style="grid-template-columns: repeat(5, 1fr);"
            class="w-[60vh] h-[60vh] aspect-square gap-[2vh] grid"
        >
            {#each items as item, index}
                <div
                    class="w-full h-full grid place-items-center"
                    transition:scale|global={{
                        delay: index * 25,
                    }}
                >
                    <Knob
                    state={IterationState}
                        active={item}
                        on:click={e => handleKnobClick(index, e)}
                        on:touchstart={e => handleKnobClick(index, e)}
                    />
                </div>
            {/each}
        </div>
    </HackWrapper>
{/if}
