<script lang="ts">
    import { Key } from '@enums/events';
    import { GameType } from '@enums/gameTypes';
    import HackWrapper from '@lib/HackWrapper.svelte';
    import GAME_STATE from '@stores/GAME_STATE';
    import type { TInputHackGameParam, TLevelState } from "@typings/gameState";
    import type {
        TDigitDazzleCode,
        TDigitDazzleGameState,
    } from '@typings/digitDazzle';
    import { TempInteractListener } from '@utils/interactHandler';
    import { delay, generateNumbers, getRandomIntFromIntOrArray } from '@utils/misc';
    import { type Tweened, tweened } from 'svelte/motion';
    import { scale } from 'svelte/transition';
    import { DIGIT_DAZZLE } from './config/gameConfig';

    let Visible: boolean = false;

    let DigitDazeState: TDigitDazzleGameState = null;

    let IterationState: TLevelState = null;

    const UserDuration: Tweened<number> = tweened(0);

    const DurationCheck = 250;

    let CodeLength: number = null;
    let UserCode: TDigitDazzleCode[] = [];
    let CheckingCode: boolean = false;

    let SuccessChecker: Function = null;

    let Iterations: number = null;

    let KeyListener: ReturnType<typeof TempInteractListener>;

        let CleanUpFunctions: Function[] = [];

function clearCleanUpFunctions() {
    CleanUpFunctions.forEach(fn => fn());
    CleanUpFunctions = [];
}

    GAME_STATE.subscribe(state => {
        let shouldShow =
            state.active &&
            state.type === GameType.DigitDazzle &&
            !IterationState;
        if (shouldShow) {
            clearCleanUpFunctions();
            Visible = true;
            initialise();
        } else if (Visible && !shouldShow) {
            Visible = false;
            DigitDazeState = null;
            IterationState = null;
            clearKeyListener();
            clearCleanUpFunctions();
        }
    });

    /** This code is responsible for clearing the key listeners. */
    function clearKeyListener() {
        KeyListener?.removeListener();
        KeyListener = null;
    }

    /** This code is responsible for playing the iteration of the minigame.
     * The code will return a promise that resolves to true if the user has
     * correctly input the key, and false otherwise.
     */
    async function playIteration() {
        if (!Visible) return;

        let timeout = setTimeout(() => {
            UserDuration.set(DigitDazeState.duration, {
                duration: DigitDazeState.duration,
            });
        }, 500);

        CleanUpFunctions.push(() => {
            if (timeout) clearTimeout(timeout);
        })

        return new Promise((resolve, _) => {

            let timerDone = false;
            let durationCheck = setTimeout(() => {
                timerDone = true;
                if (CheckingCode) return;
                finish(false);
            }, DigitDazeState.duration + 500);

            CleanUpFunctions.push(() => {
                if (durationCheck) clearTimeout(durationCheck);
                resolve(false);
            })

            let keyDownListener = TempInteractListener(
                Key.down,
                (e: KeyboardEvent) => {
                    if (CheckingCode) return;

                    const key = e.key.toUpperCase();
                    if (key === 'BACKSPACE') {
                        GAME_STATE.playSound('primary');
                        let index = UserCode.findIndex(
                            code => code.code === null,
                        );

                        index = index === -1 ? CodeLength : index;
                        index = index !== 0 ? index - 1 : index;
                        UserCode[index].code = null;
                    }
                },
            );

            SuccessChecker = async () => {
                const result = await check();
                if (result) {
                    finish(true);
                } else if (timerDone) {
                    finish(false);
                }
            };

            KeyListener = TempInteractListener(
                Key.pressed,
                (e: KeyboardEvent) => {
                    if (CheckingCode) return;

                    const key = e.key.toUpperCase();

                    const index = UserCode.findIndex(
                        code => code.code === null,
                    );
                    if (
                        key.length === 1 &&
                        key >= '0' &&
                        key <= '9' &&
                        index < CodeLength &&
                        index !== -1
                    ) {
                        GAME_STATE.playSound('primary');
                        UserCode[index].code = Number(key);
                    } else if (key === 'ENTER') {
                        GAME_STATE.playSound('primary');
                        SuccessChecker();
                    }
                },
            );


            function finish(bool: boolean) {
                if (CheckingCode) return;

                const currentValue = $UserDuration;
                UserDuration.set(currentValue, {
                    duration: 0,
                });

                keyDownListener.removeListener();
                clearTimeout(durationCheck);
                resolve(bool);
            }
        });
    }

    /** This code is responsible for starting the game.
     * @param iterations The number of iterations to play.
     * @param difficulty The difficulty of the game.
     */
    async function startGame(iterations: number, config: TInputHackGameParam) {
        if (!Visible) return;

        SuccessChecker = null;
        UserCode = [];
        CodeLength = null;
        clearKeyListener();

        UserDuration.set(0, {
            duration: 0,
        });

        const duration = getRandomIntFromIntOrArray(config.duration);

        let code: number[]

        if (config.length) {
            CodeLength = getCodeLength(config.length);
			code = generateCode(CodeLength);
        } else {
            const index = config.code.length - iterations
            const input = config.code[index].toString()

            CodeLength = input.length;
            code = Array.from(input).map(Number);
        }

        UserCode = Array.from({ length: CodeLength }, () => ({
            code: null,
            checking: false,
            state: null,
        }));

        DigitDazeState = {
            code,
            duration,
            currentIteration: Iterations - iterations,
        };

        IterationState = null;

        await delay(500);

        if (!DigitDazeState) return

        const success = await playIteration();

        if (!DigitDazeState) return

        IterationState = success ? 'success' : 'fail';

        const isGameOver = success && iterations <= 1;
        if (success && isGameOver) {
            GAME_STATE.playSound('win');
        } else if (!isGameOver && success) {
            GAME_STATE.playSound('iteration');
        } else {
            GAME_STATE.playSound('lose');
        }

        let timeout = setTimeout(() => {
            if (!Visible) return;

            if (success && iterations > 0) {
                iterations--;
                if (iterations > 0) {
                    startGame(iterations, config);
                } else {
                    GAME_STATE.finish(true);
                    DigitDazeState = null;
                    return;
                }
            } else {
                GAME_STATE.finish(false);
                DigitDazeState = null;
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
        if (!$GAME_STATE.active || DigitDazeState) return;

        const { iterations, config } = $GAME_STATE;
        Iterations = iterations;
        startGame(iterations, config as TInputHackGameParam);
    }

    function generateCode(length: number) {
        return generateNumbers(length);
    }

    function getCodeLength(length: number | [number, number]): number {
        const sizeMin = DIGIT_DAZZLE.SIZE.MIN;
        const sizeMax = DIGIT_DAZZLE.SIZE.MAX;

        if (Array.isArray(length)) {
            length[0] = length[0] < sizeMin ? sizeMin : length[0];
            length[1] = length[1] > sizeMax ? sizeMax : length[1];

            return getRandomIntFromIntOrArray(length);
        } else if (length < sizeMin || length > sizeMax) {
            length = length < sizeMin ? sizeMin : length;
            length = length > sizeMax ? sizeMax : length;
            return getRandomIntFromIntOrArray(length);
        }

        return DIGIT_DAZZLE.DEFAULT_LENGTH;
    }

    async function check() {
        if (!Visible) return;

        const isFull = UserCode.every(code => code.code !== null);
        if (!isFull) return;
        

        CheckingCode = true;

        const code = UserCode.map(code => code.code);

        let allMatch = true;

        for (let index = 0; index < code.length; index++) {
            const currentCode = code[index];
            const match = currentCode === DigitDazeState.code[index];

            UserCode[index].checking = true;

            if (match) {
                UserCode[index].state = 'correct';
            } else {
                    const included = DigitDazeState.code.includes(currentCode)
                if (included) {
                    UserCode[index].state = 'included';
                } else {
                    UserCode[index].state = null;
                }
                allMatch = false;
            }

            GAME_STATE.playSound('secondary');

            await delay(DurationCheck);

            UserCode[index].checking = false;
        }
        
        // Because Im smart and I know how JS works ;)
        setTimeout(async () => {
            if (allMatch) return;
            await delay(500);

            for (let index = UserCode.length - 1; index >= 0; index--) {
                UserCode[index].code = null;
                GAME_STATE.playSound('secondary');
                await delay(DurationCheck / 2);
            }
        }, 0);

        CheckingCode = false;
        
        return allMatch;
    }
</script>

{#if Visible}
    <HackWrapper
        state={IterationState}
        title={['Digit', 'Dazzle']}
        subtitle="Find the correct code."
        iterations={Iterations}
        iteration={DigitDazeState.currentIteration}
        progress={($UserDuration / DigitDazeState.duration) * 100}
    >
        <div class=" w-fit h-fit flex flex-col gap-[1vh]">
            <div class="flex font-bold text-[5vh] gap-[3vh]">
                {#each { length: CodeLength } as _, i}
                    {@const code = UserCode[i]}
                    <div
                        class="grid place-items-center w-[10vh] aspect-square {IterationState == 'fail' ? 'bg-error/50 glow-error ' : code.checking
                            ? 'bg-accent/25 shadow-accent border border-accent'
                            : code.state === 'correct'
                              ? 'bg-success/25 shadow-success border border-success'
                              : code.state === 'included'
                                ? 'bg-warning/25 shadow-warning border border-warning'
                                : ' primary-bg'}"
                    >
                        {#if code.code}
                            <p transition:scale={{ duration: 250 }}>
                                {code.code}
                            </p>
                        {/if}
                    </div>
                {/each}
            </div>

            <button
                on:click={()=>SuccessChecker()}
                class="w-full h-[5vh] {IterationState == 'fail' ? 'bg-error/50 glow-error' : 'btn-accent' } font-bold uppercase  default-all-transition"
            >
                Crack
            </button>
        </div>
    </HackWrapper>
{/if}
