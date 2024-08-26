<script lang="ts">
    import { Key, Mouse } from '@enums/events';
    import { GameType } from '@enums/gameTypes';
    import HackWrapper from '@lib/HackWrapper.svelte';
    import GAME_STATE from '@stores/GAME_STATE';
    import type { TLengthHackGameParam, TLevelState } from '@typings/gameState';
    import type { TNumberCrackGameState } from '@typings/numberCrack';
    import { TempInteractListener } from '@utils/interactHandler';
    import { delay, getRandomIntFromIntOrArray } from '@utils/misc';
    import { type Tweened, tweened } from 'svelte/motion';
    import { scale } from 'svelte/transition';

    let Visible: boolean = false;

    let NumberCrackState: TNumberCrackGameState = null;

    let IterationState: TLevelState = null;

    const UserDuration: Tweened<number> = tweened(0);

    let CodeLength: number = null;
    let UserCode: number[] = [];

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
                    const key = e.key.toUpperCase();
                    if (key === 'BACKSPACE') {
                        UserCode.pop();
                        UserCode = UserCode;
                    }
                },
            );

            KeyListener = TempInteractListener(
                Key.pressed,
                (e: KeyboardEvent) => {
                    // if its a number, add it to the code
                    console.log(e.key);
                    const key = e.key.toUpperCase();
                    if (
                        key.length === 1 &&
                        key >= '0' &&
                        key <= '9' &&
                        UserCode.length < CodeLength
                    ) {
                        UserCode.push(Number(key));
                        UserCode = UserCode;
                    } else if (key === 'ENTER') {
                    }
                },
            );

            function finish(bool: boolean) {
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
</script>

{#if Visible}
    <HackWrapper
        state={IterationState}
        title={['Digit', 'Dazzle']}
        subtitle="Find the correct code."
        iterations={Iterations}
    >
        <div class=" w-fit h-fit flex flex-col gap-[1vh]">
            <div class="flex font-bold text-[5vh] gap-[3vh]">
                {#each { length: CodeLength } as _, i}
                    <div
                        class="grid place-items-center w-[10vh] primary-bg aspect-square"
                    >
                        {#if UserCode && UserCode[i] !== undefined}
                            <p transition:scale={{ duration: 250 }}>
                                {UserCode[i]}
                            </p>
                        {/if}
                    </div>
                {/each}
            </div>

            <button
                class="w-full h-[5vh] font-bold uppercase btn-accent default-all-transition"
            >
                Crack
            </button>
        </div>
    </HackWrapper>
{/if}
