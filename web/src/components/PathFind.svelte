<script lang="ts">
    import { GameType } from '@enums/gameTypes';
    import GAME_STATE from '@stores/GAME_STATE';
    import type { TLevelState, TNodeHackGameParam } from '@typings/gameState';
    import type {
        TPathFindTarget,
        TPathFindGameState,
    } from '@typings/pathFind';
    import { TempInteractListener } from '@utils/interactHandler';
    import { delay, distanceBetween, getRandomIntFromIntOrArray, randomBetween } from '@utils/misc';
    import { Mouse } from '@enums/events';
    import HackWrapper from '@lib/HackWrapper.svelte';
    import { type Tweened, tweened } from 'svelte/motion';
    import Node from './Nodes/Node.svelte';

    let Visible: boolean = false;

    let PathFindState: TPathFindGameState = null;

    let IterationState: TLevelState = null;

    const UserDuration: Tweened<number> = tweened(0);

    let Iterations: number = null;

    let MouseListener: ReturnType<typeof TempInteractListener>;

    let WIDTH: number;
    let HEIGHT: number;
    let canvasEl: HTMLCanvasElement;

    let MousePos: { x: number; y: number } = { x: 0, y: 0 };
    let clickedWrongNode: boolean = false;

    const _BODY = getComputedStyle(document.body);
    const TERTIARY_COLOUR: string = `rgba(${_BODY.getPropertyValue('--tertiary').split(' ').join(',')}, 1)`;

    // Viewport Height
    const ROOT_SIZE: number = 2.5;
    const POINT_SIZE: number = 2;

    let CleanUpFunctions: Function[] = [];

function clearCleanUpFunctions() {
    CleanUpFunctions.forEach(fn => fn());
    CleanUpFunctions = [];
}

    GAME_STATE.subscribe(state => {
        let shouldShow =
            state.active && state.type === GameType.PathFind && !IterationState;
        if (shouldShow) {
            clearCleanUpFunctions();
            Visible = true;
            initialise();
        } else if (Visible && !shouldShow) {
            Visible = false;
            PathFindState = null;
            IterationState = null;
            clearMouseListener();
            clearCleanUpFunctions();
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

        let timeout = setTimeout(() => {
            UserDuration.set(PathFindState.duration, {
                duration: PathFindState.duration,
            });
        }, 500);

        CleanUpFunctions.push(() => {
            if (timeout) clearTimeout(timeout);
        })
        return new Promise((resolve, _) => {
            let durationCheck = setTimeout(() => {
                finish(false);
            }, PathFindState.duration + 500);

            CleanUpFunctions.push(() => {
                if (durationCheck) clearTimeout(durationCheck);
                resolve(false);
            })

            MouseListener = TempInteractListener(
                Mouse.move,
                (e: MouseEvent) => {
                    if (!Visible) return;
                    if (!canvasEl) return;

                    let { targets, activeIndex } = PathFindState;

                    if (activeIndex == targets.length - 1) {
                        finish(true);
                        return;
                    }

                    if (clickedWrongNode) {
                        finish(false);
                        return;
                    }

                    const canvasRect = canvasEl?.getBoundingClientRect();
                    const canvasX = e.clientX - canvasRect.left;
                    const canvasY = e.clientY - canvasRect.top;

                    MousePos.x = canvasX;
                    MousePos.y = canvasY;
                },
            );

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
    async function startGame(iterations: number, config: TNodeHackGameParam) {
        if (!Visible) return;

        clearMouseListener();

        UserDuration.set(0, {
            duration: 0,
        });

        const duration = getRandomIntFromIntOrArray(config.duration);

        PathFindState = {
            targets: generateTargets(config.numberOfNodes),
            activeIndex: 0,
            duration,
            currentIteration: Iterations - iterations,
        };

        IterationState = null;

        await delay(500);

        if (!PathFindState) return
        const success = await playIteration();

        if (!PathFindState) return
        
        IterationState = success ? 'success' : 'fail';

        const isGameOver = success && iterations <= 1;
        if (success && isGameOver) {
            GAME_STATE.playSound('win');
        } else if (!isGameOver && success) {
            GAME_STATE.playSound('iteration');
        } else {
            GAME_STATE.playSound('lose');
        }

        await delay(500);

        let timeout = setTimeout(() => {
            if (!Visible || !canvasEl) return;
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

        CleanUpFunctions.push(() => {
            if (timeout) clearTimeout(timeout);
            IterationState = null;
        })
    }

    /** This code is responsible for generating a duration for a progress bar based on the difficulty.
     */
    function initialise() {
        if (!$GAME_STATE.active || PathFindState) return;

        const { iterations, config } = $GAME_STATE;
        Iterations = iterations;
        startGame(iterations, config as TNodeHackGameParam);
    }

    /** Generate points for the given difficulty.
     * The higher the difficulty, the harder the more the points.
     * @param difficulty The difficulty should be between 0 and 100.
     */
    function generateTargets(numberOfNodes: number | [number, number]): TPathFindTarget[] {

        const numPoints = getRandomIntFromIntOrArray(numberOfNodes);

        const points: TPathFindTarget[] = [];

        for (let i = 0; i < numPoints; i++) {
            points.push({
                x: randomBetween(3, 97),
                y: randomBetween(3, 97),
                selected: i === 0,
            });
        }

        return sortPoints(points);
    }

    function checkPoint(index: number) {
        const { activeIndex } = PathFindState;
        if (index !== activeIndex + 1) {
            clickedWrongNode = true;
        } else {
            GAME_STATE.playSound('primary');
            PathFindState.activeIndex++;
            PathFindState.targets[index].selected = true;
        }
    }

    function sortPoints(points: TPathFindTarget[]) {
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

        ctx.strokeStyle = TERTIARY_COLOUR;
        ctx.lineWidth = (vh * ROOT_SIZE) / 4;

        // round the stroke
        ctx.lineCap = 'round';

        ctx.stroke();
    }
</script>

{#if Visible}
    {@const { targets } = PathFindState}

    <HackWrapper
        state={IterationState}
        title={['Path', 'Find']}
        subtitle="Go to the next point closest point."
        iterations={Iterations}
        iteration={PathFindState.currentIteration}
        progress={($UserDuration / PathFindState.duration) * 100}
    >
        <div
            bind:clientWidth={WIDTH}
            bind:clientHeight={HEIGHT}
            class=" w-[60vh] h-[60vh] aspect-square bg-secondary/90 border-[0.15vh] border-tertiary/50"
        >
            <canvas width={WIDTH} height={HEIGHT} bind:this={canvasEl} />

            {#each targets as { x, y, selected }, i}
                {@const size = `${i == 0 ? ROOT_SIZE : POINT_SIZE}vh`}
                <Node root={i == 0} iterationState={IterationState} {selected} {x} {y} size={size} on:click={() => checkPoint(i)} />
            {/each}
        </div>
    </HackWrapper>
{/if}