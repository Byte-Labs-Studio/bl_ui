<script lang="ts">
    import { Key } from '@enums/events';
    import { GameType } from '@enums/gameTypes';
    import HackWrapper from '@lib/HackWrapper.svelte';
    import GAME_STATE from '@stores/GAME_STATE';
    import type { TLengthHackGameParam, TLevelState } from '@typings/gameState';
    import type {
        TDigitDazzleCode,
        TDigitDazzleGameState,
    } from '@typings/digitDazzle';
    import { TempInteractListener } from '@utils/interactHandler';
    import { delay, getRandomIntFromIntOrArray } from '@utils/misc';
    import { type Tweened, tweened } from 'svelte/motion';
    import { scale } from 'svelte/transition';

    let Visible: boolean = false;

    let NumberCrackState: TDigitDazzleGameState = null;

    let IterationState: TLevelState = null;

    const UserDuration: Tweened<number> = tweened(0);

    const DurationCheck = 250;

    let CodeLength: number = null;
    let UserCode: TDigitDazzleCode[] = [];
    let CheckingCode: boolean = false;
    let CrackClick: HTMLButtonElement = null;

    let Iterations: number = null;

    let KeyListener: ReturnType<typeof TempInteractListener>;

    GAME_STATE.subscribe(state => {
        let shouldShow =
            state.active &&
            state.type === GameType.NumberCrack &&
            !IterationState;
        if (shouldShow) {
            Visible = true;
            initialise();
        } else if (Visible && !shouldShow) {
            Visible = false;
            NumberCrackState = null;
            IterationState = null;
            clearKeyListener();
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

        setTimeout(() => {
            UserDuration.set(NumberCrackState.duration, {
                duration: NumberCrackState.duration,
            });
        }, 500);

        return new Promise((resolve, _) => {
            let durationCheck = setTimeout(() => {
                finish(false);
            }, NumberCrackState.duration + 500);

            let keyDownListener = TempInteractListener(
                Key.down,
                (e: KeyboardEvent) => {
                    if (CheckingCode) return;

                    const key = e.key.toUpperCase();
                    if (key === 'BACKSPACE') {
                        let index = UserCode.findIndex(
                            code => code.code === null,
                        );

                        index = index === -1 ? CodeLength : index;
                        index = index !== 0 ? index - 1 : index;
                        UserCode[index].code = null;
                    }
                },
            );

            const checkClick = async () => {
                const result = await check();
                if (result) {
                    finish(true);
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
                        UserCode[index].code = Number(key);
                    } else if (key === 'ENTER') {
                        checkClick();
                    }
                },
            );

            CrackClick?.addEventListener('click', checkClick);

            function finish(bool: boolean) {
                const currentValue = $UserDuration;
                UserDuration.set(currentValue, {
                    duration: 0,
                });

                keyDownListener.removeListener();
                CrackClick?.removeEventListener('click', checkClick);

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

        UserCode = [];
        CodeLength = null;
        clearKeyListener();

        UserDuration.set(0, {
            duration: 0,
        });

        const duration = getRandomIntFromIntOrArray(config.duration);
        CodeLength = getRandomIntFromIntOrArray(config.length);
        const code = generateCode(CodeLength);

        UserCode = Array.from({ length: CodeLength }, () => ({
            code: null,
            checking: false,
            state: null,
        }));

        NumberCrackState = {
            code,
            duration,
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
                    NumberCrackState = null;
                    return;
                }
            } else {
                GAME_STATE.finish(false);
                NumberCrackState = null;
                return;
            }
        }, 1000);
    }

    /** This code is responsible for generating a duration for a progress bar based on the difficulty.
     */
    function initialise() {
        if (!$GAME_STATE.active || NumberCrackState) return;

        const { iterations, config } = $GAME_STATE;
        Iterations = iterations;
        startGame(iterations, config as TLengthHackGameParam);
    }

    function generateCode(length: number) {
        const code = [];

        for (let i = 0; i < length; i++) {
            code.push(Math.floor(Math.random() * 10)); // Generate a random number between 0 and 9
        }

        return code;
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
            const match = currentCode === NumberCrackState.code[index];

            UserCode[index].checking = true;

            await delay(DurationCheck);

            if (match) {
                UserCode[index].state = 'correct';
            } else {
                    const included = NumberCrackState.code.includes(currentCode)
                if (included) {
                    UserCode[index].state = 'included';
                } else {
                    UserCode[index].state = null;
                }
                allMatch = false;
            }

            
            UserCode[index].checking = false;
        }

        await delay(DurationCheck);

        for (let index = UserCode.length - 1; index >= 0; index--) {
            UserCode[index].code = null;
            await delay(DurationCheck);
        }

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
        iteration={NumberCrackState.currentIteration}
        progress={($UserDuration / NumberCrackState.duration) * 100}
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
                        {#if code !== undefined}
                            <p transition:scale={{ duration: 250 }}>
                                {code.code !== null ? code.code : ''}
                            </p>
                        {/if}
                    </div>
                {/each}
            </div>

            <button
                bind:this={CrackClick}
                class="w-full h-[5vh] {IterationState == 'fail' ? 'bg-error/50 glow-error' : 'btn-accent' } font-bold uppercase  default-all-transition"
            >
                Crack
            </button>
        </div>
    </HackWrapper>
{/if}
