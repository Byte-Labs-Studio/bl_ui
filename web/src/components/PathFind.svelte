<script lang="ts">
    import { GameType } from '@enums/gameTypes';
    import GAME_STATE from '@stores/GAME_STATE';
    import type { DifficultyParam, LevelState } from '@typings/gameState';
    import type {
        IPathFindTarget,
        IPathFindGameState,
    } from '@typings/pathFind';
    import { TempInteractListener } from '@utils/interactHandler';
    import { delay, distanceBetween, randomBetween } from '@utils/misc';
    import { scale } from 'svelte/transition';
    import { PATH_FIND } from './config/gameConfig';
    import { Mouse } from '@enums/events';
    import HackWrapper from '@lib/HackWrapper.svelte';

    let Visible: boolean = false;

    let PathFindState: IPathFindGameState = null;

    let IterationState: LevelState = null;

    let MouseListener: ReturnType<typeof TempInteractListener>;

    let WIDTH: number;
    let HEIGHT: number;
    let canvasEl: HTMLCanvasElement;

    let MousePos: { x: number; y: number } = { x: 0, y: 0 };
    let clickedWrongNode: boolean = false;

    const _BODY = getComputedStyle(document.body);

    const PRIMARY_COLOUR: string = `rgba(${_BODY.getPropertyValue('--tertiary').split(' ').join(',')}, 1)`;

    // Viewport Height
    const ROOT_SIZE: number = 2.5;
    const POINT_SIZE: number = 2;

    GAME_STATE.subscribe(state => {
        let shouldShow =
            state.active && state.type === GameType.PathFind && !IterationState;
        if (shouldShow) {
            Visible = true;
            initialise();
        } else if (Visible && !shouldShow) {
            Visible = false;
            PathFindState = null;
            IterationState = null;
            clearMouseListener();
        }
    });

    /** This code is responsible for clearing the key listeners. */
    function clearMouseListener() {
        MouseListener?.removeListener();
        MouseListener = null;
    }

    /** This code is responsible for playing the iteration of the minigame.
     * The code will return a promise that resolves to true if the user has
     * correctly input the key, and false otherwise.
     */
    async function playIteration() {
        if (!Visible) return;

        clickedWrongNode = false;

        drawTick();
        return new Promise((resolve, _) => {
            let firstTick = true;

            let checkInterval = setInterval(
                () => {
                    if (!Visible || IterationState) {
                        clearInterval(checkInterval);
                        return;
                    }

                    if (firstTick) {
                        firstTick = false;
                    }

                    if (clickedWrongNode) {
                        clearInterval(checkInterval);
                        resolve(false);
                        return;
                    }

                    let { targets, activeIndex } = PathFindState;

                    if (activeIndex == targets.length - 1) {
                        clearInterval(checkInterval);
                        resolve(true);
                        return;
                    }

                    PathFindState.duration--;

                    if (PathFindState.duration <= 0) {
                        clearInterval(checkInterval);
                        resolve(false);
                    }
                },
                firstTick ? 1500 : 1000,
            );

            MouseListener = TempInteractListener(
                Mouse.move,
                (e: MouseEvent) => {
                    if (!Visible) return;
                    if (!canvasEl) return;

                    if (clickedWrongNode) {
                        clearInterval(checkInterval);
                        resolve(false);
                        return;
                    }

                    const canvasRect = canvasEl?.getBoundingClientRect();
                    const canvasX = e.clientX - canvasRect.left;
                    const canvasY = e.clientY - canvasRect.top;

                    MousePos.x = canvasX;
                    MousePos.y = canvasY;
                },
            );
        });
    }

    /** This code is responsible for starting the game.
     * @param iterations The number of iterations to play.
     * @param difficulty The difficulty of the game.
     */
    async function startGame(iterations, config: DifficultyParam) {
        if (!Visible) return;

        clearMouseListener();

        let { difficulty } = config;
        difficulty =
            (difficulty || PATH_FIND.FALLBACK_DIFFICULTY) >= 100
                ? 99
                : difficulty <= 0
                  ? 5
                  : difficulty;

        PathFindState = {
            targets: generateTargets(difficulty),
            activeIndex: 0,
            duration: generateDuration(difficulty),
        };

        // console.log(PathFindState);

        IterationState = null;

        await delay(500);

        const success = await playIteration();
        IterationState = success ? 'success' : 'fail';

        setTimeout(() => {
            if (!Visible) return;
            const ctx = canvasEl.getContext('2d');
            ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

            if (success && iterations > 0) {
                iterations--;
                if (iterations > 0) {
                    startGame(iterations, config);
                } else {
                    GAME_STATE.finish(true);
                    PathFindState = null;
                    return;
                }
            } else {
                GAME_STATE.finish(false);
                PathFindState = null;
                return;
            }
        }, 1000);
    }

    /** This code is responsible for generating a duration for a progress bar based on the difficulty.
     */
    function initialise() {
        if (!$GAME_STATE.active || PathFindState) return;

        const { iterations, config } = $GAME_STATE;
        startGame(iterations, config as DifficultyParam);
    }

    /** Generate points for the given difficulty.
     * The higher the difficulty, the harder the more the points.
     * @param difficulty The difficulty should be between 0 and 100.
     */
    function generateTargets(difficulty): IPathFindTarget[] {
        // Make sure the difficulty is between 0 and 100.
        difficulty = difficulty >= 100 ? 99 : difficulty <= 0 ? 5 : difficulty;
        // Calculate the target size based on the difficulty.
        const { MIN, MAX } = PATH_FIND.POINTS;
        const numPoints = MIN + (difficulty / 100) * (MAX - MIN);

        const points: IPathFindTarget[] = [];

        for (let i = 0; i < numPoints; i++) {
            points.push({
                x: randomBetween(3, 97),
                y: randomBetween(3, 97),
                selected: i === 0,
            });
        }

        return sortPoints(points);
    }

    /**
     * Generate a duration for a progress bar based on the difficulty
     * @param difficulty The difficulty should be between 0 and 100.
     */
    function generateDuration(difficulty: number): number {
        /** Set the minimum and maximum duration for a progress bar */
        const { MIN, MAX } = PATH_FIND.DURATION;

        /** Calculate the duration based on the difficulty */
        let duration: number = MIN + (MAX - MIN) * ((100 - difficulty) / 100);

        /** Make the duration vary by 20% */
        const variation: number = duration * 0.2;
        const randomVariation: number = Math.random() * variation;
        duration =
            Math.random() > 0.5
                ? duration + randomVariation
                : duration - randomVariation;

        // Return the duration
        return Math.floor(duration);
    }

    function checkPoint(index: number) {
        const { activeIndex } = PathFindState;
        if (index !== activeIndex + 1) {
            clickedWrongNode = true;
        } else {
            PathFindState.activeIndex++;
            PathFindState.targets[index].selected = true;
        }
    }

    function sortPoints(points: IPathFindTarget[]) {
        // sort the points by distance from the first point
        // Sort the points by nearest neighbor
        const sortedPoints = [points[0]]; // Start with the first point
        const remainingPoints = points.slice(1); // All points except the first

        for (let i = 0; i < points.length - 1; i++) {
            const lastPoint = sortedPoints[i];
            let nearestIndex = 0;
            let nearestDistance = Infinity;

            for (let j = 0; j < remainingPoints.length; j++) {
                const distance = distanceBetween(
                    lastPoint.x,
                    lastPoint.y,
                    remainingPoints[j].x,
                    remainingPoints[j].y,
                );
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestIndex = j;
                }
            }

            sortedPoints.push(remainingPoints[nearestIndex]);
            remainingPoints.splice(nearestIndex, 1);
        }

        return sortedPoints;
    }

    function drawTick() {
        if (IterationState || !canvasEl) return;
        const ctx = canvasEl.getContext('2d');
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
        drawLines(ctx);
        requestAnimationFrame(drawTick);
    }

    function drawLines(ctx: CanvasRenderingContext2D) {
        if (IterationState || !canvasEl || !Visible || !PathFindState) return;

        ctx.beginPath();

        const { targets, activeIndex } = PathFindState;
        const length =
            activeIndex < targets.length - 1 ? activeIndex : targets.length - 1;
        const vh = window.innerHeight / 100;

        function getPoint(x: number, y: number, root: boolean = false) {
            const diff = ((root ? ROOT_SIZE : POINT_SIZE) * vh) / 2;
            return [x + diff, y + diff];
        }
        const firstTarget = targets[0];
        let [finalXPos, finalYPos] = getPoint(
            (firstTarget.x / 100) * WIDTH,
            (firstTarget.y / 100) * HEIGHT,
            true,
        );

        for (let i = 0; i < length; i++) {
            const target = targets[i];

            const x = (target.x / 100) * WIDTH;
            const y = (target.y / 100) * HEIGHT;
            const nextTarget = targets[i + 1];
            const nextX = (nextTarget.x / 100) * WIDTH;
            const nextY = (nextTarget.y / 100) * HEIGHT;

            const [xPoint, yPoint] = getPoint(x, y);

            const [nextXPoint, nextYPoint] = getPoint(nextX, nextY);

            ctx.moveTo(xPoint, yPoint);
            ctx.lineTo(nextXPoint, nextYPoint);

            if (i === length - 1) {
                finalXPos = nextXPoint;
                finalYPos = nextYPoint;
            }
        }

        if (activeIndex !== targets.length - 1 && finalXPos && finalYPos) {
            ctx.moveTo(finalXPos, finalYPos);
            ctx.lineTo(MousePos.x, MousePos.y);
        }

        ctx.strokeStyle = PRIMARY_COLOUR;
        ctx.lineWidth = (vh * ROOT_SIZE) / 4;

        // round the stroke
        ctx.lineCap = 'round';

        ctx.stroke();
    }
</script>

{#if Visible}
    {@const { targets, duration } = PathFindState}

    <HackWrapper state={IterationState}>
        <svelte:fragment slot="title-1">
            Path
        </svelte:fragment>
        <svelte:fragment slot="title-2">
            Find
        </svelte:fragment>

        <svelte:fragment slot="subtitle">
            Go to the next point closest point.
        </svelte:fragment>

        <div
            bind:clientWidth={WIDTH}
            bind:clientHeight={HEIGHT}
            class=" w-[60vh] h-[60vh] aspect-square bg-secondary/90 shadow-box border-[0.15vh] border-tertiary/50"
        >
            <canvas width={WIDTH} height={HEIGHT} bind:this={canvasEl} />

            {#each targets as { x, y, selected }, i}
                {@const size = `${i == 0 ? ROOT_SIZE : POINT_SIZE}vh`}
                <button
                    transition:scale|global={{
                        duration: 250,
                        delay: 100 + Math.random() * 10 * 50,
                    }}
                    on:click={() => checkPoint(i)}
                    class="absolute hover:scale-125 duration-200 transition-all aspect-square rounded-full z-10 {i ==
                        0 &&
                        'border-[0.1vh] border-tertiary'} {IterationState ==
                    'success'
                        ? 'bg-success glow-success scale-125'
                        : IterationState == 'fail'
                          ? 'bg-error glow-error  scale-125'
                          : selected
                            ? 'bg-accent  glow-accent animate-scale'
                            : 'bg-tertiary active:!scale-95 hover:brightness-125 animate-scale-mini primary-shadow'}"
                    style="left: {x}%; top: {y}%; width: {size}; height: {size};"
                />
            {/each}

            {#key duration}
                <p
                    transition:scale={{ duration: 100 }}
                    class="text-shadow absolute font-bold text-[5vh] center"
                >
                    {duration}
                </p>
            {/key}
        </div>
    </HackWrapper>
{/if}

<style>
    @keyframes scale-in-out {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.2);
        }
        100% {
            transform: scale(1);
        }
    }

    .animate-scale {
        animation: scale-in-out 2s infinite;
    }
</style>
