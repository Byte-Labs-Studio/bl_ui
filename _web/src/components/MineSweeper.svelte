<script lang="ts">
    import { GameType } from '@enums/gameTypes';
    import HackWrapper from '@lib/HackWrapper.svelte';
    import GAME_STATE from '@stores/GAME_STATE';
    import type { TGridHackGameParam, TLevelState } from '@typings/gameState';
    import { delay, getRandomIntFromIntOrArray } from '@utils/misc';
    import { type Tweened, tweened } from 'svelte/motion';
    import type {
        TMineSweeperCellUser,
        TMineSweeperGameState,
    } from '@typings/mineSweeper';
    import Cell from './MineSweeper/Cell.svelte';
    import { scale } from 'svelte/transition';
    import { MINE_SWEEPER } from './config/gameConfig';

    let Visible: boolean = false;

    let MineSweeperState: TMineSweeperGameState = null;

    let Preview: boolean = false;

    let IterationState: TLevelState = null;

    const UserDuration: Tweened<number> = tweened(0);

    let UserMistakes: number = 0;
    let UserCorrect: number = 0;
    let GameNumberMines: number = 0;

    let Iterations: number = null;

    let SuccessChecker: Function = null;

    let GameTimeout: ReturnType<typeof setTimeout>;

    GAME_STATE.subscribe(state => {
        let shouldShow =
            state.active &&
            state.type === GameType.MineSweeper &&
            !IterationState;
        if (shouldShow) {
            clearTimeout(GameTimeout);
            Visible = true;
            initialise();
        } else if (Visible && !shouldShow) {
            Visible = false;
            MineSweeperState = null;
            IterationState = null;
            clearTimeout(GameTimeout);
        }
    });

    /** This code is responsible for playing the iteration of the minigame.
     * The code will return a promise that resolves to true if the user has
     * correctly input the key, and false otherwise.
     */
    async function playIteration() {
        if (!Visible) return;

        UserMistakes = 0;
        UserCorrect = 0;
    

        await delay(500);

        UserDuration.set(MineSweeperState.duration, {
            duration: MineSweeperState.duration,
        });

        return new Promise((resolve, _) => {
            GameTimeout = setTimeout(() => {
                finish(false);
            }, MineSweeperState.duration + 500);

            SuccessChecker = () => {
                console.log(UserCorrect, GameNumberMines, UserMistakes);
                if (UserCorrect === GameNumberMines) {
                    finish(true);
                } else if (UserMistakes >= MINE_SWEEPER.MISTAKES) {
                    finish(false);
                }
            };

            function finish(bool: boolean) {
                const currentValue = $UserDuration;
                UserDuration.set(currentValue, {
                    duration: 0,
                });

                SuccessChecker = null;

                clearTimeout(GameTimeout);
                resolve(bool);
            }
        });
    }

    /** This code is responsible for starting the game.
     * @param iterations The number of iterations to play.
     * @param difficulty The difficulty of the game.
     */
    async function startGame(iterations, config: TGridHackGameParam) {
        if (!Visible) return;

        UserMistakes = 0;
        UserCorrect = 0;

        UserDuration.set(0, {
            duration: 0,
        });

        const duration = getRandomIntFromIntOrArray(config.duration);
        const gridSize = getRandomIntFromIntOrArray(config.grid);
        GameNumberMines = getRandomIntFromIntOrArray(config.target);
        const grid = generateGrid(gridSize, GameNumberMines);

        MineSweeperState = {
            grid,
            duration: duration,
            currentIteration: Iterations - iterations,
        };

        IterationState = null;

        await delay(500);

        Preview = true;

        await delay(5000);

        Preview = false;

        const success = await playIteration();
        IterationState = success ? 'success' : 'fail';

        await delay(500);

        GameTimeout = setTimeout(() => {
            if (!Visible) return;

            clearTimeout(GameTimeout);

            if (success && iterations > 0) {
                iterations--;
                if (iterations > 0) {
                    startGame(iterations, config);
                } else {
                    GAME_STATE.finish(true);
                    MineSweeperState = null;
                    return;
                }
            } else {
                GAME_STATE.finish(false);
                MineSweeperState = null;
                return;
            }
        }, 1000);
    }

    /** This code is responsible for generating a duration for a progress bar based on the difficulty.
     */
    function initialise() {
        if (!$GAME_STATE.active || MineSweeperState) return;

        const { iterations, config } = $GAME_STATE;
        Iterations = iterations;
        startGame(iterations, config as TGridHackGameParam);
    }

    function generateGrid(gridSize: number, targetSize: number) {
        const grid: TMineSweeperCellUser[][] = [];

        for (let i = 0; i < gridSize; i++) {
            const gridRow: TMineSweeperCellUser[] = [];
            for (let j = 0; j < gridSize; j++) {
                gridRow.push({
                    mine: false,
                    state: null,
                });
            }
            grid.push(gridRow);
        }

        let minesPlaced = 0;
        while (minesPlaced < targetSize) {
            const indexRow = Math.floor(Math.random() * gridSize);
            const indexCol = Math.floor(Math.random() * gridSize);

            if (!grid[indexRow][indexCol].mine) {
                grid[indexRow][indexCol].mine = true;
                minesPlaced++;
            }
        }

        return grid;
    }

    function clickCell(row: number, col: number) {
        if (IterationState) return;

        const cell = MineSweeperState.grid[row][col];

        cell.state = cell.mine ? 'success' : 'fail';

        if (cell.state === 'success') {
            UserCorrect++;
        } else {
            UserMistakes++;
        }

        MineSweeperState.grid[row][col] = cell;

        if (SuccessChecker) SuccessChecker();
    }
</script>

{#if Visible}
    <HackWrapper
        state={IterationState}
        title={['Mine', 'Sweeper']}
        subtitle="Remember the mines and clear them all."
        iterations={Iterations}
        iteration={MineSweeperState.currentIteration}
        progress={($UserDuration / MineSweeperState.duration) * 100}
    >
        <div
            style="grid-template-columns: repeat({MineSweeperState?.grid
                .length}, 1fr);"
            class=" w-[60vh] h-[60vh] aspect-square grid-cols-5 gap-[2vh] grid"
        >
            {#if MineSweeperState}
                {@const { grid } = MineSweeperState}
                {#each grid as row, rowIndex}
                    {#each row as cell, colIndex}
                        <div
                            class="w-full h-full grid place-items-center"
                            transition:scale|global={{
                                delay: (colIndex + rowIndex) * 25,
                            }}
                        >
                            <Cell
                                state={IterationState}
                                mine={cell.mine}
                                bombState={cell.state}
                                preview={Preview}
                                on:click={() => clickCell(rowIndex, colIndex)}
                            />
                        </div>
                    {/each}
                {/each}
            {/if}
        </div>
    </HackWrapper>
{/if}
