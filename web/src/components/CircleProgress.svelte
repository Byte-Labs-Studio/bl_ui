<script lang="ts">
    import GAME_STATE from '@stores/GAME_STATE';
    import { type ICircleProgressGameState } from '@typings/circleProgress';
    import { GameType } from '@typings/gameState';
    import { TempReceiveEvent } from '@utils/eventsHandlers';
    import { delay } from '@utils/misc';
    import { onDestroy } from 'svelte';
    import { type Tweened, tweened } from 'svelte/motion';
    import { scale } from 'svelte/transition';
    import { GetRandonNumberKey, NUMBER_KEYS, PROGRESS_DURATION, PROGRESS_SIZE } from './config/gameConfig';

    const UserSegmentSize: number = 2;
    const UserRotation: Tweened<number> = tweened(0);

    const RADIUS: number= 4;
    const DIAMETER: number = RADIUS * 2;
    const CIRCUMFERENCE: number = 2 * Math.PI * RADIUS;

    const SIZE_STYLES: string = `
        width: ${DIAMETER}vw;
        height: ${DIAMETER}vw;
    `;

    const SIZE_STYLES_HALF: string = `
        width: ${DIAMETER / 2}vw;
        height: ${DIAMETER / 2}vw;
    `;

    let Visible: boolean = false;

    let CircleState: ICircleProgressGameState = null;

    let IterationState: 'success' | 'fail' | null = null;

    let KeyListener: ReturnType<typeof TempReceiveEvent>;

    GAME_STATE.subscribe(state => {
        let shouldShow =
            state.active &&
            state.type === GameType.CircleProgress &&
            !CircleState;
        if (shouldShow) {
            Visible = true;
            initialise();
        } else if (Visible && !shouldShow) {
            Visible = false;
            CircleState = null;
            IterationState = null;
            KeyListener?.removeListener();
            KeyListener = null;
        }
    });

    async function playIteration() {
        const duration = CircleState.duration;
        UserRotation.set(100, {
            duration,
        });

        return new Promise((resolve, reject) => {
            let timeout = setTimeout(() => {
                resolve(false);
            }, duration);

            KeyListener = TempReceiveEvent('ui:keydown', (e: KeyboardEvent) => {
                clearTimeout(timeout);

                UserRotation.set($UserRotation, {
                    duration: 0,
                });

                if (e.key === CircleState.key) {
                    const userRotDeg = ($UserRotation / 100) * 360;
                    const targetRotDeg = CircleState.target.rotation;
                    const targetSize = CircleState.target.size * 3.6;

                    const userSize = UserSegmentSize * 3.6;
                    if (
                        userRotDeg > targetRotDeg - userSize &&
                        userRotDeg < targetSize + targetRotDeg
                    ) {
                        resolve(true);
                    } else {
                        resolve(false);
                        return;
                    }
                } else {
                    resolve(false);
                }
            });
        });
    }

    async function startGame(iterations, difficulty) {
        if (!$GAME_STATE.active) return;

        KeyListener?.removeListener();
        KeyListener = null;

        UserRotation.set(0, {
            duration: 0,
        });

        CircleState = {
            target: generateTargetSegment(difficulty),
            duration: generateDuration(difficulty),
            key: GetRandonNumberKey(),
        };
        IterationState = null;

        await delay(500)

        const success = await playIteration();
        IterationState = success ? 'success' : 'fail';

        setTimeout(() => {
            if (success && iterations > 0) {
                iterations--;
                if (iterations > 0) {
                    startGame(iterations, difficulty);
                } else {
                    GAME_STATE.finish(true);
                    CircleState = null;
                    return;
                }
            } else {
                GAME_STATE.finish(false);
                CircleState = null;
                return;
            }
        }, 500);
    }

    function initialise() {
        if (!$GAME_STATE.active || CircleState) return;

        const { iterations, difficulty } = $GAME_STATE;
        startGame(iterations, difficulty);
    }

    function generateDuration(difficulty) {
        const {MIN, MAX} = PROGRESS_DURATION

        let duration =
        MIN + (MAX - MIN) * ((100 - difficulty) / 100);

        // make it vary by 20%
        const variation = duration * 0.2;
        const randomVariation = Math.random() * variation;
        duration += randomVariation;

        return duration;
    }

    function generateTargetSegment(difficulty: number) {
        difficulty = difficulty >= 100 ? 99 : difficulty <= 0 ? 5 : difficulty;

        const { MAX } = PROGRESS_SIZE 

        const size = MAX - (difficulty / 100) * MAX;
        let rotation = 90 + Math.random() * 180;

        if (((size * 3.6) + rotation) > 360) {
            rotation -= ((size * 3.6) + rotation) - 360
        }

        return {
            size,
            rotation,
        };
    }
</script>

{#if Visible}
    <div
        transition:scale
        style={SIZE_STYLES}
        class="grid place-items-center primary-shadow  center-x bottom-[5vh] rounded-full"
    >
        <div
            style={SIZE_STYLES_HALF}
            class="absolute secondary-shadow grid place-items-center bg-primary-50 rounded-full"
        >
            <p class="text-shadow absolute font-bold text-[2vw]">{CircleState.key}</p>
        </div>

        <svg
            style={SIZE_STYLES}
            version="1.1"
            class="z-0 absolute overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
        >
            {#if CircleState}
                <circle
                    style="stroke-width: {RADIUS * 0.1}vw"
                    class="absolute fill-none stroke-primary-50"
                    cx="50%"
                    cy="50%"
                    r="{RADIUS * 0.95}vw"
                />

                {@const { size, rotation } = CircleState.target}
                <circle
                    style="transform: rotate({-90 + rotation}deg);"
                    class=" absolute radial stroke-primary origin-center target-segment"
                    stroke-dasharray="{CIRCUMFERENCE}vw"
                    stroke-dashoffset="{CIRCUMFERENCE * ((100 - size) / 100)}vw"
                    stroke-width="{RADIUS * 0.25}vw"
                    fill-opacity="0"
                    cx="50%"
                    cy="50%"
                    r="{RADIUS * 0.9}vw"
                />
                <circle
                    style="transform: rotate({-90 +
                        ($UserRotation / 100) * 360}deg);"
                    class=" absolute  origin-center  transition-colors duration-100 {IterationState === 'success' ? 'glow-success stroke-success' : IterationState === 'fail' ? 'glow-fail stroke-fail' : 'stroke-accent glow-accent'}"
                    stroke-dasharray="{CIRCUMFERENCE}vw"
                    stroke-dashoffset="{CIRCUMFERENCE *
                        ((100 - UserSegmentSize) / 100)}vw"
                    stroke-width="{RADIUS * 0.25}vw"
                    fill-opacity="0"
                    cx="50%"
                    cy="50%"
                    r="{RADIUS * 0.9}vw"
                />
            {/if}
        </svg>
    </div>
{/if}

<style>
    .target-segment {
        filter: drop-shadow(0 0 0.1vw black);
        transition: all 0.1s ease-in-out;
    }

</style>
