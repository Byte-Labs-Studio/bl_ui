<script lang="ts">
    import { Key as KeyEnum } from '@enums/events';
    import { GameType } from '@enums/gameTypes';
    import GAME_STATE from '@stores/GAME_STATE';
    import {
        type KeyGameParam,
        type LevelState,
    } from '@typings/gameState';
    import { type INumberSlideGameState } from '@typings/numberSlide';
    import { delay } from '@utils/misc';
    import { GetRandomKeyFromSet, KEYS, NUMBER_SLIDE } from './config/gameConfig';
    import { tweened } from 'svelte/motion';
    import { get } from 'svelte/store';
    import { scale } from 'svelte/transition';
    import { TempInteractListener } from '@utils/interactHandler';
    import Key from './NumberSlide/Key.svelte';

    let CurrentKeyIndex: number = null;

    let Visible: boolean = false;

    let NumberSlideState: INumberSlideGameState = null;

    let IterationState: LevelState = null;

    let KeyListener: ReturnType<typeof TempInteractListener>;

    //The code above shows the circle progress when the game is active and type is circle progress
    GAME_STATE.subscribe(state => {
        let shouldShow =
            state.active &&
            state.type === GameType.NumberSlide &&
            !NumberSlideState;
        if (shouldShow) {
            Visible = true;
            initialise();
        } else if (Visible && !shouldShow) {
            Visible = false;
            NumberSlideState = null;
            IterationState = null;
            clearKeyListeners();
        }
    });

    /** This code is responsible for clearing the key listeners.
     */
    function clearKeyListeners() {
        KeyListener?.removeListener();
        KeyListener = null;
    }


    /** This code is responsible for playing the iteration of the minigame.
     * This code should be called when the user presses the spacebar.
     * The code will return a promise that resolves to true if the user has
     * correctly input the key, and false otherwise.
     */
    async function playIteration() {
        if (!Visible) return;

        CurrentKeyIndex = null;

        return new Promise((resolve, _) => {
            const { keys } = NumberSlideState;

            const { ZONE_SIZE } = NUMBER_SLIDE;

            let keySubscriptions = [];

            function clearKeySubscriptions(success: boolean) {
                keySubscriptions.forEach(sub => sub());
                keySubscriptions = [];

                keys.forEach((key, i) => {
                    let { left } = key;
                    left.set(get(left), { duration: 0 });
                    NumberSlideState.keys[i].state = success ? 'success' : 'fail';
                });

                resolve(success);
            }

            keys.forEach((key, i) => {
                let originalKey = NumberSlideState.keys[i];
                keySubscriptions.push(key.left.subscribe(value => {
                    if (
                        value >= 50 - ZONE_SIZE / 2 &&
                        value <= 50 + ZONE_SIZE / 2
                    ) {
                        CurrentKeyIndex = i;
                    } else if (
                        value > 50 + ZONE_SIZE / 2 &&
                        originalKey.state !== 'success'
                    ) {
                        originalKey.state = 'fail';
                        NumberSlideState.keys[i] = originalKey;
                        clearKeySubscriptions(false)
                    }
                }));
            });

            KeyListener = TempInteractListener(
                KeyEnum.pressed,
                (e: KeyboardEvent) => {
                    const key = e.key.toUpperCase();

                    if (!KEYS.Numbers.includes(key)) {
                        return;
                    }

                    const targetKey = NumberSlideState.keys[CurrentKeyIndex];

                    if (!targetKey) {
                        clearKeySubscriptions(false)
                    };

                    if (key === targetKey.key) {
                        targetKey.state = 'success';
                        NumberSlideState.keys[CurrentKeyIndex] = targetKey;

                        const allSuccess = NumberSlideState.keys.every(
                            key => key.state === 'success',
                        );

                        if (allSuccess) {
                            clearKeySubscriptions(true)
                        }
                    } else {
                        clearKeySubscriptions(false)
                    }
                },
            );
        });
    }

    /** This code is responsible for starting the game.
     * @param iterations The number of iterations to play.
     * @param gameData The difficulty data of the game.
     */
    async function startGame(iterations, config: KeyGameParam) {
        if (!Visible) return;

        clearKeyListeners();

        let { difficulty, numberOfKeys } = config;
        difficulty = (difficulty || NUMBER_SLIDE.FALLBACK_DIFFICULTY ) >= 100 ? 99 : difficulty <= 0 ? 5 : difficulty;
        numberOfKeys = numberOfKeys || NUMBER_SLIDE.FALLBACK_NUM_KEYS;

        const duration = generateDuration(difficulty);
        const keys = generateKeys(numberOfKeys, duration);
        NumberSlideState = {
            duration,
            keys,
        };

        IterationState = null;

        CurrentKeyIndex = null;

        await delay(500);

        const success = await playIteration();

        clearKeyListeners();

        IterationState = success ? 'success' : 'fail';

        setTimeout(() => {
            if (!Visible) return;

            if (success && iterations > 0) {
                iterations--;
                if (iterations > 0) {
                    startGame(iterations, config);
                } else {
                    GAME_STATE.finish(true);
                    NumberSlideState = null;
                    return;
                }
            } else {
                GAME_STATE.finish(false);
                NumberSlideState = null;
                return;
            }
        }, 500);
    }

    /** This code is responsible for generating a duration for a progress bar based on the difficulty.
     */
    function initialise() {
        if (!$GAME_STATE.active || NumberSlideState) return;

        const { iterations, config } = $GAME_STATE;
        startGame(iterations, config as KeyGameParam);
    }

    /**
     * Generate a duration for a progress bar based on the difficulty
     * @param difficulty The difficulty should be between 0 and 100.
     */
    function generateDuration(difficulty: number): number {
        /** Set the minimum and maximum duration for a progress bar */
        const { MIN, MAX } = NUMBER_SLIDE.DURATION;

        /** Calculate the duration based on the difficulty */
        let duration: number = MIN + (MAX - MIN) * ((100 - difficulty) / 100);

        /** Make the duration vary by 20% */
        const variation: number = duration * 0.2;
        const randomVariation: number = Math.random() * variation;
        duration += randomVariation;

        // Return the duration
        return duration;
    }

    /**
     * Generate the keys to be pressed.
     */
    function generateKeys(numKeys: number, duration: number) {
        // So there is enough time, so that only one key is in the zone.
        const zoneSize = NUMBER_SLIDE.ZONE_SIZE;
        const timeoutDuration = duration * (zoneSize / 100)

        const keys = [];
        for (let i = 0; i < numKeys; i++) {
            const key = {
                key: GetRandomKeyFromSet('Numbers'),
                left: tweened(0, { duration: 0 }),
                state: null,
            };

            setTimeout(() => {
                if (IterationState) return;
                key.left.set(100, { duration });
            }, timeoutDuration * i);

            keys.push(key);
        }

        return keys;
    }
</script>

{#if Visible}
    <div
    transition:scale
        class="primary-shadow default-game-position w-[20vw] h-[0.5vw] bg-primary-50 flex items-center justify-center"
    >
        <div
            style="width: {NUMBER_SLIDE.ZONE_SIZE}%;"
            class="bg-primary secondary-shadow h-[2.5vw]"
        />

        {#if NumberSlideState}
            {#each NumberSlideState.keys as key, i}
                <Key {...key} active={CurrentKeyIndex === i} />
            {/each}
        {/if}
    </div>
{/if}
