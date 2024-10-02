<script lang="ts">
    import HackWrapper from '@lib/HackWrapper.svelte';
    import type { TLevelState, TNodeHackGameParam } from '@typings/gameState';
    import type {
        TLine,
        TuntangleGameState,
        TUntangleNode,
    } from '@typings/untangle';
    import { TempInteractListener } from '@utils/interactHandler';
    import { type Tweened, tweened } from 'svelte/motion';
    import Node from './Nodes/Node.svelte';
    import {
        delay,
        getRandomIntFromIntOrArray,
        randomBetween,
    } from '@utils/misc';
    import GAME_STATE from '@stores/GAME_STATE';
    import { GameType } from '@enums/gameTypes';
    import { Mouse } from '@enums/events';

    let Visible: boolean = false;

    let UntangleState: TuntangleGameState = null;

    let IterationState: TLevelState = null;

    const UserDuration: Tweened<number> = tweened(0);

    let Iterations: number = null;

    let MouseListener: ReturnType<typeof TempInteractListener>;

    let IsDragging: boolean = false;
    let selectedNode: number = null;

    let WIDTH: number;
    let HEIGHT: number;
    let canvasEl: HTMLCanvasElement;

    let achievedNoIntersections: boolean = false;

    const vh = window.innerHeight / 100;
    function getPoint(x: number, y: number) {
        const xPos = (x / 100) * WIDTH;
        const yPos = (y / 100) * HEIGHT;
        const diff = (POINT_SIZE * vh) / 2;
        return [xPos + diff, yPos + diff];
    }

    // Viewport Height
    const POINT_SIZE: number = 2.5;

    const _BODY = getComputedStyle(document.body);
    const TERTIARY_COLOUR: string = `rgba(${_BODY.getPropertyValue('--tertiary').split(' ').join(',')}, 1)`;
    const ERROR_COLOUR: string = `rgba(${_BODY.getPropertyValue('--error').split(' ').join(',')}, 1)`;

    let CleanUpFunctions: Function[] = [];

function clearCleanUpFunctions() {
    CleanUpFunctions.forEach(fn => fn());
    CleanUpFunctions = [];
}

    GAME_STATE.subscribe(state => {
        let shouldShow =
            state.active && state.type === GameType.Untangle && !IterationState;
        if (shouldShow) {
            clearCleanUpFunctions();
            Visible = true;
            initialise();
        } else if (Visible && !shouldShow) {
            Visible = false;
            UntangleState = null;
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

        selectedNode = -1;
        achievedNoIntersections = false;

        drawTick();

        let timeout = setTimeout(() => {
            UserDuration.set(UntangleState.duration, {
                duration: UntangleState.duration,
            });
        }, 500);

        CleanUpFunctions.push(() => {
            if (timeout) clearTimeout(timeout);
        })
        return new Promise((resolve, _) => {
            let durationCheck = setTimeout(() => {
                finish(false);
            }, UntangleState.duration + 500);

            CleanUpFunctions.push(() => {
                if (durationCheck) clearTimeout(durationCheck);
                resolve(false);
            })
            MouseListener = TempInteractListener(
                Mouse.move,
                (e: MouseEvent) => {
                    if (!Visible) return;
                    if (!canvasEl) return;

                    if (achievedNoIntersections) {
                        finish(true);
                    }

                    if (!IsDragging) return;

                    let { nodes } = UntangleState;

                    const canvasRect = canvasEl?.getBoundingClientRect();
                    const canvasX = e.clientX - canvasRect.left;
                    const canvasY = e.clientY - canvasRect.top;

                    let x = (canvasX / WIDTH) * 100;
                    let y = (canvasY / HEIGHT) * 100;

                    const max = 100 - POINT_SIZE;
                    x = Math.min(Math.max(x, POINT_SIZE), max);
                    y = Math.min(Math.max(y, POINT_SIZE), max);

                    let offsetSize = (POINT_SIZE / 2) * vh;
                    offsetSize = (offsetSize / WIDTH) * 100;
                    nodes[selectedNode].x = x - offsetSize;
                    nodes[selectedNode].y = y - offsetSize;
                },
            );

            function finish(bool: boolean) {
                const currentValue = $UserDuration;
                UserDuration.set(currentValue, {
                    duration: 0,
                });

                IsDragging = false;

                clearTimeout(durationCheck);
                resolve(bool);
            }
        });
    }

    /** This code is responsible for starting the game.
     * @param iterations The number of iterations to play.
     * @param difficulty The difficulty of the game.
     */
    async function startGame(iterations, config: TNodeHackGameParam) {
        if (!Visible) return;

        clearMouseListener();

        UserDuration.set(0, {
            duration: 0,
        });

        const duration = getRandomIntFromIntOrArray(config.duration);

        UntangleState = {
            nodes: generateTargets(config.numberOfNodes),
            duration: duration,
            currentIteration: Iterations - iterations,
            intersections: 0,
        };

        IterationState = null;

        await delay(500);

        if (!UntangleState) return
        const success = await playIteration();

        if (!UntangleState) return
        IterationState = success ? 'success' : 'fail';

        let timeout = setTimeout(() => {
            if (!Visible) return;
            const ctx = canvasEl.getContext('2d');
            ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

            if (success && iterations > 0) {
                iterations--;
                if (iterations > 0) {
                    startGame(iterations, config);
                } else {
                    GAME_STATE.finish(true);
                    UntangleState = null;
                    return;
                }
            } else {
                GAME_STATE.finish(false);
                UntangleState = null;
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
        if (!$GAME_STATE.active || IterationState) return;

        const { iterations, config } = $GAME_STATE;
        Iterations = iterations;
        startGame(iterations, config as TNodeHackGameParam);
    }

    /** Generate points for the given difficulty.
     * The higher the difficulty, the harder the more the points.
     * @param difficulty The difficulty should be between 0 and 100.
     */
    function generateTargets(
        numberOfNodes: number | [number, number],
    ): TUntangleNode[] {
        const numPoints = getRandomIntFromIntOrArray(numberOfNodes);

        const points: TUntangleNode[] = [];

        for (let i = 0; i < numPoints; i++) {
            const max = 100 - POINT_SIZE;
            points.push({
                x: randomBetween(POINT_SIZE, max),
                y: randomBetween(POINT_SIZE, max),
            });
        }

        return points;
    }

    function drawTick() {
        if (IterationState || !canvasEl) return;
        const ctx = canvasEl.getContext('2d');
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
        drawLines();
        requestAnimationFrame(drawTick);
    }

    function getIntersect(line1: TLine, line2: TLine): boolean {
        const dx1 = line1.x2 - line1.x1;
        const dy1 = line1.y2 - line1.y1;
        const dx2 = line2.x2 - line2.x1;
        const dy2 = line2.y2 - line2.y1;

        const denominator = dy2 * dx1 - dx2 * dy1;
        if (denominator === 0) return false;

        const dx3 = line1.x1 - line2.x1;
        const dy3 = line1.y1 - line2.y1;

        const t = (dx2 * dy3 - dy2 * dx3) / denominator;
        const u = (dx1 * dy3 - dy1 * dx3) / denominator;

        return t > 0 && t < 1 && u > 0 && u < 1;
    }

    function calculateIntersect(lines: TLine[]) {
        UntangleState.intersections = 0;

        const ctx = canvasEl.getContext('2d');

        ctx.lineWidth = (vh * POINT_SIZE) / 4;

        for (let i = 0; i < lines.length; i++) {
            const line1 = lines[i];

            let intersect = false;
            for (let j = 0; j < lines.length; j++) {
                if (
                    Math.abs(i - j) <= 1 ||
                    (i === 0 && j === lines.length - 1) ||
                    (j === 0 && i === lines.length - 1)
                ) {
                    continue;
                }

                const line2 = lines[j];

                intersect = getIntersect(line1, line2);

                if (intersect) {
                    UntangleState.intersections++;
                    break;
                }
            }

            ctx.beginPath();
            ctx.moveTo(line1.x1, line1.y1);
            ctx.lineTo(line1.x2, line1.y2);
            ctx.strokeStyle = intersect ? ERROR_COLOUR : TERTIARY_COLOUR;

            ctx.stroke();
        }
    }

    function drawLines() {
        if (IterationState || !canvasEl) return;
        const nodes = UntangleState.nodes;

        const lines: TLine[] = [];

        for (let i = 0; i < nodes.length; i++) {
            const circle = nodes[i];
            const [x, y] = getPoint(circle.x, circle.y);

            const prevIndex = i === 0 ? nodes.length - 1 : i - 1;
            const prevCircle = nodes[prevIndex];
            const [prevX, prevY] = getPoint(prevCircle.x, prevCircle.y);

            lines.push({
                x1: prevX,
                y1: prevY,
                x2: x,
                y2: y,
                intersecting: false,
            });
        }

        calculateIntersect(lines);
    }
</script>

<svelte:window
    on:mouseup={() => {
        IsDragging = false;
        selectedNode = -1;
        achievedNoIntersections = Visible && UntangleState?.intersections == 0;
    }}
/>

{#if Visible}
    {@const { nodes } = UntangleState}
    <HackWrapper
        title={['Un', 'tangle']}
        subtitle="Make sure none of the lines intersect each other."
        iterations={Iterations}
        iteration={UntangleState.currentIteration}
        progress={($UserDuration / UntangleState.duration) * 100}
        state={IterationState}
    >
        <div
            bind:clientWidth={WIDTH}
            bind:clientHeight={HEIGHT}
            class="w-[60vh] h-[60vh] aspect-square bg-secondary/90 border-[0.15vh] border-tertiary/50"
        >
            <canvas width={WIDTH} height={HEIGHT} bind:this={canvasEl} />

            {#each nodes as { x, y }, i}
                <Node
                    root={selectedNode == i}
                    class="hover:cursor-grab active:cursor-grabbing"
                    on:mousedown={() => {
                        IsDragging = true;
                        selectedNode = i;
                    }}
                    iterationState={IterationState}
                    selected={true}
                    {x}
                    {y}
                />
            {/each}
        </div>
    </HackWrapper>
{/if}
