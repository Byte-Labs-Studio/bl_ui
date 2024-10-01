<script lang="ts">
    import { GameType } from '@enums/gameTypes';
    import HackWrapper from '@lib/HackWrapper.svelte';
    import GAME_STATE from '@stores/GAME_STATE';
    import type {
        TGridHackGameParam,
        TLengthHackGameParam,
        TLevelState,
    } from '@typings/gameState';
    import { type TPrintLockGameState } from '@typings/printLock';
    import {
        delay,
        getRandomIntFromIntOrArray,
        polarToCartesian,
        randomBetween,
    } from '@utils/misc';
    import { type Tweened, tweened } from 'svelte/motion';
    import { blur } from 'svelte/transition';

    let Visible: boolean = false;

    let PrintLockState: TPrintLockGameState = null;

    let IterationState: TLevelState = null;

    const UserDuration: Tweened<number> = tweened(0);

    let Iterations: number = null;

    let containerRef: HTMLDivElement = null;
    const VH_WIDTH: number = 67.5;
    const vhWidthInPx = (VH_WIDTH * window.innerHeight) / 100;
    const CONST_SIZE = vhWidthInPx * 0.85;

    const NUMBER_OF_RIDGES: number = 100;
    const RIDGE_SIZE: number = 5;
    const RIDGE_SPACING: number = 5;

    let SuccessChecker: Function = null;

    GAME_STATE.subscribe(state => {
        let shouldShow =
            state.active &&
            state.type === GameType.PrintLock &&
            !IterationState;
        if (shouldShow) {
            Visible = true;
            initialise();
        } else if (Visible && !shouldShow) {
            Visible = false;
            PrintLockState = null;
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
            UserDuration.set(PrintLockState.duration, {
                duration: PrintLockState.duration,
            });
        }, 500);

        return new Promise((resolve, _) => {
            let durationCheck = setTimeout(() => {
                finish(false);
            }, PrintLockState.duration + 500);

            SuccessChecker = async () => {
                await delay(250);
                const targetPrint = PrintLockState.sections.find(
                    section => section.locked,
                );
                const allCorrect = PrintLockState.sections.every(
                    section => section.print === targetPrint?.print,
                );
                if (allCorrect) {
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
    async function startGame(iterations: number, config: TGridHackGameParam) {
        if (!Visible) return;

        UserDuration.set(0, {
            duration: 0,
        });

        const length = getRandomIntFromIntOrArray(config.target);
        const prints = generatePrints(length);
        const sectionsLength = getRandomIntFromIntOrArray(config.grid);
        const lockedIndex = getRandomIntFromIntOrArray([0, sectionsLength - 1]);

        PrintLockState = {
            prints,
            sections: Array.from({ length: sectionsLength }, (_, i) => ({
                print: getRandomIntFromIntOrArray([0, sectionsLength - 1]),
                locked: i === lockedIndex,
            })),
            duration: getRandomIntFromIntOrArray(config.duration),
            currentIteration: Iterations - iterations,
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
                    PrintLockState = null;
                    return;
                }
            } else {
                GAME_STATE.finish(false);
                PrintLockState = null;
                return;
            }
        }, 1000);
    }

    /** This code is responsible for generating a duration for a progress bar based on the difficulty.
     */
    function initialise() {
        if (!$GAME_STATE.active || PrintLockState) return;

        const { iterations, config } = $GAME_STATE;
        Iterations = iterations;
        startGame(iterations, config as TGridHackGameParam);
    }

    function describeArc(x, y, radius, startAngle, endAngle) {
        let start = polarToCartesian(x, y, radius, endAngle);
        let end = polarToCartesian(x, y, radius, startAngle);

        let largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

        let d = [
            'M',
            start.x,
            start.y,
            'A',
            radius,
            radius,
            0,
            largeArcFlag,
            0,
            end.x,
            end.y,
        ].join(' ');

        return d;
    }

    function generatePaths() {
        const width = CONST_SIZE;
        const height = CONST_SIZE;

        const centerX = width / 2;
        const centerY = height / 2;

        const minMax = Math.min(width, height);
        const exclusionRadius = width * 0.15;
        const maxRadius = minMax / 2;

        const paths = [];

        const ridges = getRandomIntFromIntOrArray([
            NUMBER_OF_RIDGES / 2,
            NUMBER_OF_RIDGES,
        ]);

        // Calculate the available space for ridges
        const availableSpace = maxRadius - exclusionRadius;

        // Calculate the maximum number of ridges that can fit in the available space
        const maxRidges = Math.floor(availableSpace / RIDGE_SPACING);

        // Use the smaller of the two: calculated max ridges or the random ridge count
        const actualRidges = Math.min(ridges, maxRidges);

        for (let i = 0; i < actualRidges; i++) {
            // Calculate the radius based on the ridge spacing
            let radius = exclusionRadius + (i + 1) * RIDGE_SPACING;

            // Add some randomness to the radius, but keep it within the bounds
            radius += randomBetween(-RIDGE_SPACING / 2, RIDGE_SPACING / 2);
            radius = Math.max(exclusionRadius, Math.min(radius, maxRadius));

            let startAngle = randomBetween(0, 360);
            let endAngle = startAngle + randomBetween(30, 90);

            paths.push(
                describeArc(centerX, centerY, radius, startAngle, endAngle),
            );
        }

        return paths;
    }

    function generatePrints(length: number) {
        const prints = [];
        for (let i = 0; i < length; i++) {
            const paths = generatePaths();
            prints.push(paths);
        }

        return prints;
    }

    function onButtonClick(index: number, direction: number) {
        if (IterationState || !SuccessChecker) return;

        const { sections } = PrintLockState;
        const { prints } = PrintLockState;
        const section = sections[index];

        if (section.locked) {
            return;
        }

        let newPrintIndex = section.print + direction;
        if (newPrintIndex < 0) {
            newPrintIndex = prints.length - 1;
        } else if (newPrintIndex >= prints.length) {
            newPrintIndex = 0;
        }

        section.print = newPrintIndex;

        PrintLockState.sections[index] = section;

        if (SuccessChecker) SuccessChecker();
    }

    function getStateClass(iterationState) {
        switch (iterationState) {
            case 'success':
                return 'bg-success/50 glow-success border-success';
            case 'fail':
                return 'bg-error/50 glow-error border-error';
            default:
                return 'bg-accent/50 glow-accent border-accent';
        }
    }
</script>

{#if Visible}
    <HackWrapper
        state={IterationState}
        title={['Print', 'Lock']}
        subtitle="Sift through the prints and find the matches."
        iterations={Iterations}
        iteration={PrintLockState.currentIteration}
        progress={($UserDuration / PrintLockState.duration) * 100}
    >
        {@const { prints, sections } = PrintLockState}
        {@const sectionsLength = sections.length}
        {@const stateClass = getStateClass(IterationState)}

        <div
            style="width: calc({CONST_SIZE}px + 7.5vh); height: {CONST_SIZE}px;"
            class="flex flex-col items-center justify-center"
        >
            <div
                bind:this={containerRef}
                class="w-[85%] aspect-square grid place-items-center absolute"
            >
                <div
                    class="w-[20%] aspect-square absolute rounded-full border {stateClass}"
                ></div>

                {#each sections as section, i}
                    {#key section.print}
                        <svg
                            transition:blur={{ duration: 250 }}
                            class="w-full aspect-square absolute overflow-visible"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 {CONST_SIZE} {CONST_SIZE}"
                        >
                            <mask id="mask-{i}_{section.print}">
                                <rect
                                    x="0"
                                    y={(CONST_SIZE / sectionsLength) * i}
                                    width={CONST_SIZE}
                                    height={CONST_SIZE / sectionsLength}
                                    fill="white"
                                />
                            </mask>

                            {#each prints[section.print] as path}
                                <path
                                    d={path}
                                    fill="none"
                                    mask="url(#mask-{i}_{section.print})"
                                    class="stroke-tertiary overflow-visible default-colour-transition {stateClass}"
                                    stroke-width={RIDGE_SIZE}
                                />
                            {/each}
                        </svg>
                    {/key}
                {/each}
                <div class="w-[101%] h-[101%] bg-secondary/90 absolute -z-10" />
            </div>
            {#each sections as section, i}
                {@const locked = section.locked}
                {@const lockedClass =
                    locked && !IterationState
                        ? ''
                        : 'hover:scale-x-105 active:scale-x-100'}
                {@const buttonClass = locked
                    ? 'bg-foreground '
                    : 'bg-accent hover:scale-105 active:scale-100 glow-accent'}
                <div
                    class="w-full h-full flex items-center justify-center z-10"
                >
                    <button
                        on:click={() => onButtonClick(i, -1)}
                        class="w-[4vh] h-[80%] default-all-transition {lockedClass} {buttonClass}"
                    />
                    <div
                        class="w-full h-full border-x-[0.2vh] {i === 0
                            ? 'border-b-[0.1vh] border-t-[0.2vh]'
                            : i === sectionsLength - 1
                              ? 'border-t-[0.1vh] border-b-[0.2vh]'
                              : ' border-y-[0.1vh]'}
                        
                        {locked ? 'border-foreground ' : 'border-accent'}"
                    />
                    <button
                        on:click={() => onButtonClick(i, 1)}
                        class="w-[4vh] h-[80%] default-all-transition {lockedClass} {buttonClass}"
                    />
                </div>
            {/each}
        </div>
    </HackWrapper>
{/if}
