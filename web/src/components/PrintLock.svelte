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
    const RIDGE_SIZE: number = 4;
    const RIDE_SPACING: number = 5;

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
        const prints = generatePrints(length);
        const lockedIndex = getRandomIntFromIntOrArray(prints.length);

        console.log(prints);
        PrintLockState = {
            prints,
            lockedSection: lockedIndex,
            sections: Array.from({ length: 5 }, (_, i) => ({
                print: getRandomIntFromIntOrArray(prints.length),
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
        height: containerWidth // It's a square, so height = width
    };
}

    function generatePaths() {
        const width = CONST_SIZE;
        const height = CONST_SIZE;
        console.log(width, height);

        const centerX = width / 2;
        const centerY = height / 2;

        const minMax = Math.min(width, height);
        const exclusionRadius = width * 0.2;
        const maxRadius = minMax / 2.2;

        const paths = [];

        for (let i = 0; i < NUMBER_OF_RIDGES; i++) {
            // Ensure radius is not too close to the exclusion radius
            let minRadius = Math.max(
                exclusionRadius + 1,
                maxRadius * ((i + 1) / NUMBER_OF_RIDGES),
            );

            let radius = randomBetween(exclusionRadius + 1, minRadius);

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
                class="w-[85%] aspect-square grid place-items-center absolute "
            >
                <div
                    class="w-[30%] aspect-square absolute bg-accent/50 glow-accent border-accent rounded-full border"
                ></div>

                {#each prints as print}
                    <svg
                        version="1.1"
                        class="w-full aspect-square absolute overflow-visible"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 {CONST_SIZE} {CONST_SIZE}"
                    >
                        {#each print as path}
                            <path
                                d={path}
                                fill="none"
                                class="stroke-tertiary"
                                stroke-width={RIDGE_SIZE}
                            />
                        {/each}
                    </svg>
                {/each}
                <div class="w-[101%] h-[101%] bg-secondary/90 absolute -z-10"/>
            </div>



            {#each sections as section, i}
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
                    >{section.print}</div>
                    <button
                        on:click={() => onButtonClick(i, 1)}
                        class="w-[4vh] h-[80%] bg-accent glow-accent"
                    />
                </div>
            {/each}
        </div>
    </HackWrapper>
{/if}
