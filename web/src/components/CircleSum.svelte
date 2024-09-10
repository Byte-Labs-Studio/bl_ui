<script lang="ts">
    import { GameType } from '@enums/gameTypes';
    import HackWrapper from '@lib/HackWrapper.svelte';
    import GAME_STATE from '@stores/GAME_STATE';
    import type {
        TCircleSumGameState,
        TCirleSumToggle,
    } from '@typings/circleSum';
    import type { TLengthHackGameParam, TLevelState } from '@typings/gameState';
    import { TempInteractListener } from '@utils/interactHandler';
    import {
        delay,
        getRandomIntFromIntOrArray,
        randomBetween,
    } from '@utils/misc';
    import { type Tweened, tweened } from 'svelte/motion';
    import radial from './CircleSum/radial';
    import RadialSegment from './CircleSum/RadialSegment.svelte';
    import { scale } from 'svelte/transition';

    let Visible: boolean = false;

    let CircleSumState: TCircleSumGameState = null;

    let IterationState: TLevelState = null;

    const UserDuration: Tweened<number> = tweened(0);

    let UserRotation: number = 0;
    let UserValue: number = 0;

    let hoveredIndex: number = null;

    let Iterations: number = null;

    let containerRef: SVGSVGElement = null;
    let circleRef: HTMLDivElement = null;

    let SuccessChecker: Function = null;

    GAME_STATE.subscribe(state => {
        let shouldShow =
            state.active &&
            state.type === GameType.CircleSum &&
            !IterationState;
        if (shouldShow) {
            Visible = true;
            initialise();
        } else if (Visible && !shouldShow) {
            Visible = false;
            CircleSumState = null;
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
            UserDuration.set(CircleSumState.duration, {
                duration: CircleSumState.duration,
            });
        }, 500);

        return new Promise((resolve, _) => {
            let durationCheck = setTimeout(() => {
                finish(false);
            }, CircleSumState.duration + 500);


            // Dont know if this is the best way but oh well. PR a better approach
            SuccessChecker = () => {
                if (UserValue === CircleSumState.target) {
                    finish(true);
                }
            };

            function finish(bool: boolean) {
                const currentValue = $UserDuration;
                UserDuration.set(currentValue, {
                    duration: 0,
                });

                SuccessChecker = null;

                clearTimeout(durationCheck);
                resolve(bool);
            }
        });
    }

    /** This code is responsible for starting the game.
     * @param iterations The number of iterations to play.
     * @param difficulty The difficulty of the game.
     */
    async function startGame(iterations, config: TLengthHackGameParam) {
        if (!Visible) return;

        UserDuration.set(0, {
            duration: 0,
        });

        UserRotation = 0;
        UserValue = 0;

        const numToggles = getRandomIntFromIntOrArray(config.length);
        const toggles = generateToggles(numToggles);
        const target = generateTarget(toggles);

        CircleSumState = {
            duration: getRandomIntFromIntOrArray(config.duration),
            target,
            toggles,
            currentIteration: Iterations - iterations,
        };

        IterationState = null;
        startRotation();

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
                    CircleSumState = null;
                    return;
                }
            } else {
                GAME_STATE.finish(false);
                CircleSumState = null;
                return;
            }
        }, 1000);
    }

    /** This code is responsible for generating a duration for a progress bar based on the difficulty.
     */
    function initialise() {
        if (!$GAME_STATE.active || CircleSumState) return;

        const { iterations, config } = $GAME_STATE;
        Iterations = iterations;
        startGame(iterations, config as TLengthHackGameParam);
    }

    function generateTarget(toggles: TCirleSumToggle[]): number {
        if (toggles.length === 0) {
            return 0;
        }

        let target = 0;
        const selectedIndices = new Set<number>();
        const totalToggles = toggles.length;
        const maxIndex = totalToggles - 1;
        const targetLength = randomBetween(0, maxIndex);

        for (let i = 0; i < targetLength; i++) {
            let randomIndex: number = Math.floor(randomBetween(0, maxIndex));

            if (selectedIndices.has(randomIndex)) {
                i--;
                continue;
            } // don't select the same switch twice

            target += toggles[randomIndex].value;
            selectedIndices.add(randomIndex);
        }

        return target;
    }

    function generateToggles(length: number) {
        const toggles: TCirleSumToggle[] = [];
        for (let i = 0; i < length; i++) {
            toggles.push({
                value: Math.floor(Math.random() * 100), // random number between 1 and 100
                active: false,
            });
        }
        return toggles;
    }

    let pieAngle: number = null;
    $: {
        if (Visible && CircleSumState) {
            const { limit, min, max } = radial;
            const togglelength = CircleSumState.toggles.length;
            pieAngle =
                limit /
                (togglelength < min
                    ? min
                    : togglelength > max
                      ? max
                      : togglelength);
        }
    }

    function startRotation() {
        let fpsInterval: number,
            now: number,
            then: number,
            elapsed: number;
        function startAnimating(fps: number) {
            fpsInterval = 1000 / fps;
            then = window.performance.now();
            animate();
        }

        const currentIteration = CircleSumState.currentIteration


        async function animate() {
            if (!Visible || IterationState) return;
            if (currentIteration !== CircleSumState.currentIteration) return;

            requestAnimationFrame(animate);

            now = window.performance.now();
            elapsed = now - then;
            if (elapsed > fpsInterval) {
                then = now - (elapsed % fpsInterval);

                UserRotation += 0.5;
            }
        }

        startAnimating(60);
    }

    function clickHandler(index) {
        if (IterationState) return;

        CircleSumState.toggles[index].active =
            !CircleSumState.toggles[index].active;

        if (CircleSumState.toggles[index].active) {
            UserValue += CircleSumState.toggles[index].value;
        } else {
            UserValue -= CircleSumState.toggles[index].value;
        }

        if (UserValue === CircleSumState.target) SuccessChecker()
    }
</script>

{#if Visible}
    <HackWrapper
        state={IterationState}
        title={['Circle', 'Sum']}
        iterations={Iterations}
        iteration={CircleSumState.currentIteration}
        progress={($UserDuration / CircleSumState.duration) * 100}
        subtitle="Find the right combination to match the target."
    >
        <div
            class=" w-[60vh] h-[60vh] grid place-items-center aspect-square rounded-full overflow-hidden"
        >
            <div
            bind:this={circleRef}
            transition:scale|global={{delay: 500}}
                class="w-1/3 h-1/3 grid place-items-center overflow-hidden aspect-square bg-secondary/90 border-[0.15vh] border-tertiary/50 rounded-full"
            >
                {#if UserValue !== null && circleRef}
                    {@const _size = (UserValue / CircleSumState.target) * circleRef.clientWidth}
                    {@const size = _size > containerRef.clientWidth ? containerRef?.clientWidth : _size}
                    <div
                    style="width: {size}px;"
                    class="aspect-square rounded-full absolute default-all-transition {
                        IterationState == 'success'
                            ? 'border-success glow-success bg-success/50'
                            : IterationState == 'fail'
                                ? 'border-error glow-error bg-error/50'
                                : _size > circleRef.clientWidth
                                    ? 'glow-error bg-error/50' 
                                    : 'bg-accent glow-accent'
                    }"
                />
                {/if}
            </div>

            {#if radial}
                {@const containerSize = containerRef?.clientWidth}
                {@const { size, gap, innerHoleSize } = radial}
                <svg
                transition:scale|global={{delay: 250}}
                    bind:this={containerRef}
                    style="width: {size}%; rotate: {UserRotation}deg;"
                    class="absolute z-[100] overflow-visible aspect-square"
                >
                    {#each CircleSumState.toggles as item, index}
                        <RadialSegment
                            {index}
                            {containerSize}
                            {pieAngle}
                            radius={containerSize / 2}
                            {gap}
                            state={IterationState}
                            innerHoleSize={(innerHoleSize / 100) *
                                containerSize}
                            bind:hoveredIndex
                            active={item.active}
                            on:click={_ => clickHandler(index)}
                        />
                    {/each}
                </svg>
            {/if}
        </div>
    </HackWrapper>
{/if}
