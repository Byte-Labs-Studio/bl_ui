<script lang="ts">
    import { Key } from '@enums/events';
    import { GameType } from '@enums/gameTypes';
    import HackWrapper from '@lib/HackWrapper.svelte';
    import GAME_STATE from '@stores/GAME_STATE';
    import type { TLengthHackGameParam, TLevelState } from '@typings/gameState';
    import type { TWordWizCode, TWordWizGameState } from '@typings/wordWiz';
    import { TempInteractListener } from '@utils/interactHandler';
    import {
        delay,
        getRandomIntFromIntOrArray,
        getWordWithLength,
    } from '@utils/misc';
    import { type Tweened, tweened } from 'svelte/motion';
    import { scale } from 'svelte/transition';
    import { WORD_WIZ } from './config/gameConfig';

    let Visible: boolean = false;

    let WordWizState: TWordWizGameState = null;

    let IterationState: TLevelState = null;

    const UserDuration: Tweened<number> = tweened(0);

    const DurationCheck = 250;

    let WordLength: number = null;
    let UserWord: TWordWizCode[] = [];
    let CheckingCode: boolean = false;
    let CrackClick: HTMLButtonElement = null;

    let Iterations: number = null;

    let KeyListener: ReturnType<typeof TempInteractListener>;

        let CleanUpFunctions: Function[] = [];

function clearCleanUpFunctions() {
    CleanUpFunctions.forEach(fn => fn());
    CleanUpFunctions = [];
}

    GAME_STATE.subscribe(state => {
        let shouldShow =
            state.active && state.type === GameType.WordWiz && !IterationState;
        if (shouldShow) {
            clearCleanUpFunctions();
            Visible = true;
            initialise();
        } else if (Visible && !shouldShow) {
            Visible = false;
            WordWizState = null;
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
            UserDuration.set(WordWizState.duration, {
                duration: WordWizState.duration,
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
            }, WordWizState.duration + 500);

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
                        let index = UserWord.findIndex(
                            code => code.letter === null,
                        );

                        index = index === -1 ? WordLength : index;
                        index = index !== 0 ? index - 1 : index;
                        UserWord[index].letter = null;
                    }
                },
            );

            const checkClick = async () => {
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

                    const index = UserWord.findIndex(
                        code => code.letter === null,
                    );
                    if (
                        key.length === 1 &&
                        key >= 'A' &&
                        key <= 'Z' &&
                        index < WordLength &&
                        index !== -1
                    ) {
                        UserWord[index].letter = key;
                        GAME_STATE.playSound('primary');
                    } else if (key === 'ENTER') {
                        GAME_STATE.playSound('primary');
                        checkClick();
                    }
                },
            );

            CrackClick?.addEventListener('click', checkClick);

            function finish(bool: boolean) {
                if (CheckingCode) return;

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
    async function startGame(iterations: number, config: TLengthHackGameParam) {
        if (!Visible) return;

        UserWord = [];
        WordLength = null;
        clearKeyListener();

        UserDuration.set(0, {
            duration: 0,
        });

        const duration = getRandomIntFromIntOrArray(config.duration);
        WordLength = getCodeLength(config.length);
        const word = generateWord(WordLength);

        UserWord = Array.from({ length: WordLength }, () => ({
            letter: null,
            checking: false,
            state: null,
        }));

        WordWizState = {
            word,
            duration,
            currentIteration: Iterations - iterations,
        };

        IterationState = null;

        await delay(500);

        if (!WordWizState) return
        const success = await playIteration();

        if (!WordWizState) return
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
                    WordWizState = null;
                    return;
                }
            } else {
                GAME_STATE.finish(false);
                WordWizState = null;
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
        if (!$GAME_STATE.active || WordWizState) return;

        const { iterations, config } = $GAME_STATE;
        Iterations = iterations;
        startGame(iterations, config as TLengthHackGameParam);
    }

    /** This code is responsible for generating a word of a given length. */
    function generateWord(length: number) {
        const word = getWordWithLength(length);

        return word.toUpperCase().split('');
    }

    function getCodeLength(length: number | [number, number]): number {
        const sizeMin = WORD_WIZ.SIZE.MIN;
        const sizeMax = WORD_WIZ.SIZE.MAX;

        if (Array.isArray(length)) {
            length[0] = length[0] < sizeMin ? sizeMin : length[0];
            length[1] = length[1] > sizeMax ? sizeMax : length[1];

            return getRandomIntFromIntOrArray(length);
        } else if (length < sizeMin || length > sizeMax) {
            length = length < sizeMin ? sizeMin : length;
            length = length > sizeMax ? sizeMax : length;
            return getRandomIntFromIntOrArray(length);
        }

        return WORD_WIZ.DEFAULT_LENGTH;
    }

    async function check() {
        if (!Visible) return;

        const isFull = UserWord.every(code => code.letter !== null);
        if (!isFull) return;

        CheckingCode = true;

        const code = UserWord.map(code => code.letter);

        let allMatch = true;

        for (let index = 0; index < code.length; index++) {
            const currentLetter = code[index];
            const match = currentLetter === WordWizState.word[index];

            UserWord[index].checking = true;

            if (match) {
                UserWord[index].state = 'correct';
            } else {
                const included = WordWizState.word.includes(currentLetter);
                if (included) {
                    UserWord[index].state = 'included';
                } else {
                    UserWord[index].state = null;
                }
                allMatch = false;
            }

            GAME_STATE.playSound('secondary');

            await delay(DurationCheck);

            UserWord[index].checking = false;
        }

        // Because Im smart and I know how JS works ;)
        setTimeout(async () => {
            if (allMatch) return;
            await delay(500);

            for (let index = UserWord.length - 1; index >= 0; index--) {
                UserWord[index].letter = null;
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
        title={['Word', 'Wiz']}
        subtitle="Find the correct word."
        iterations={Iterations}
        iteration={WordWizState.currentIteration}
        progress={($UserDuration / WordWizState.duration) * 100}
    >
        <div class=" w-fit h-fit flex flex-col gap-[1vh]">
            <div class="flex font-bold text-[5vh] gap-[3vh]">
                {#each { length: WordLength } as _, i}
                    {@const code = UserWord[i]}
                    <div
                        class="grid place-items-center w-[10vh] aspect-square {IterationState ==
                        'fail'
                            ? 'bg-error/50 glow-error '
                            : code.checking
                              ? 'bg-accent/25 shadow-accent border border-accent'
                              : code.state === 'correct'
                                ? 'bg-success/25 shadow-success border border-success'
                                : code.state === 'included'
                                  ? 'bg-warning/25 shadow-warning border border-warning'
                                  : ' primary-bg'}"
                    >
                        {#if code.letter}
                            <p transition:scale={{ duration: 250 }}>
                                {code.letter}
                            </p>
                        {/if}
                    </div>
                {/each}
            </div>

            <button
                bind:this={CrackClick}
                class="w-full h-[5vh] {IterationState == 'fail'
                    ? 'bg-error/50 glow-error'
                    : 'btn-accent'} font-bold uppercase default-all-transition"
            >
                Crack
            </button>
        </div>
    </HackWrapper>
{/if}
