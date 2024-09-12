<script lang="ts">
    import { GameType } from '@enums/gameTypes';
    import HackWrapper from '@lib/HackWrapper.svelte';
    import GAME_STATE from '@stores/GAME_STATE';
    import type { TLengthHackGameParam, TLevelState } from '@typings/gameState';
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
    async function startGame(iterations, config: TLengthHackGameParam) {
        if (!Visible) return;

        UserDuration.set(0, {
            duration: 0,
        });

        const length = getRandomIntFromIntOrArray(config.length);
        const lengthIndex = length - 1;
        const prints = generatePrints(length);
        const lockedIndex = getRandomIntFromIntOrArray([0, lengthIndex]);

        console.log(prints);
        PrintLockState = {
            prints,
            lockedSection: lockedIndex,
            sections: Array.from({ length: 5 }, (_, i) => ({
                print: getRandomIntFromIntOrArray([0, lengthIndex]),
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
        startGame(iterations, config as TLengthHackGameParam);
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

    function calculateContainerSize() {
        const vhWidthInPx = (VH_WIDTH * window.innerHeight) / 100;
        const containerWidth = vhWidthInPx * 0.85; // 85% of VH_WIDTH
        return {
            width: containerWidth,
            height: containerWidth, // It's a square, so height = width
        };
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
        if (IterationState) return;

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
        {@const { prints, sections, lockedSection } = PrintLockState}
        <div
            style="width: calc({CONST_SIZE}px + 7.5vh); height: {CONST_SIZE}px;"
            class=" flex flex-col items-center justify-center"
        >
            <div
                bind:this={containerRef}
                class="w-[85%] aspect-square grid place-items-center absolute"
            >
                <div
                    class="w-[20%] aspect-square absolute bg-accent/50 glow-accent border-accent rounded-full border"
                ></div>

                {#each sections as section, i}
                    {#key section.print}
                        <svg
                            transition:blur={{ duration: 250 }}
                            version="1.1"
                            class="w-full aspect-square absolute overflow-visible"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 {CONST_SIZE} {CONST_SIZE}"
                        >
                            <mask id="mask-{i}_{section.print}">
                                <rect
                                    x="0"
                                    y={(CONST_SIZE / 5) * i}
                                    width={CONST_SIZE}
                                    height={CONST_SIZE / 5}
                                    fill="white"
                                />
                            </mask>

                            {#each prints[section.print] as path}
                                <path
                                    d={path}
                                    fill="none"
                                    mask="url(#mask-{i}_{section.print})"
                                    class="stroke-tertiary"
                                    stroke-width={RIDGE_SIZE}
                                />
                            {/each}
                        </svg>
                    {/key}
                {/each}
                <div class="w-[101%] h-[101%] bg-secondary/90 absolute -z-10" />
            </div>

            {#each sections as _, i}
                <div
                    class="w-full h-full flex items-center justify-center z-10"
                >
                    <button
                        on:click={() => onButtonClick(i, -1)}
                        class="w-[4vh] h-[80%] bg-accent glow-accent"
                    />
                    <div
                        class="{lockedSection == i
                            ? 'border-accent/50 border-[0.5vh]'
                            : 'border-tertiary/50 border-[0.25vh]'} w-full h-full"
                    />
                    <button
                        on:click={() => onButtonClick(i, 1)}
                        class="w-[4vh] h-[80%] bg-accent glow-accent"
                    />
                </div>
            {/each}
        </div>
    </HackWrapper>
{/if}
