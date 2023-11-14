<script lang="ts">
    import GAME_STATE from '@stores/GAME_STATE';
    import { type ICircleProgressGameState } from '@typings/circleProgress';
    import { GameType } from '@typings/gameState';
    import { ReceiveEvent, TempReceiveEvent } from '@utils/eventsHandlers';
    import { onDestroy } from 'svelte';
    import { tweened } from 'svelte/motion';
    import { scale } from 'svelte/transition';

    const UserSegmentSize = 2;
    const UserRotation = tweened(0);

    const KEYS = ['1', '2', '3', '4'];

    const RADIUS = 4;
    const DIAMETER = RADIUS * 2;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

    const SIZE_STYLES = `
        width: ${DIAMETER}vw;
        height: ${DIAMETER}vw;
    `;

    const SIZE_STYLES_HALF = `
        width: ${DIAMETER / 2}vw;
        height: ${DIAMETER / 2}vw;
    `;

    let visible: boolean = false;

    let CircleState: ICircleProgressGameState | null = null;

    let iterationState: 'success' | 'fail' | null = null;

    let KeyListener: any;

    GAME_STATE.subscribe(state => {
        visible =
            state.active &&
            state.type === GameType.CircleProgress &&
            !CircleState;
        if (visible) {
            initialise();
        } else {
            CircleState = null;
        }
    });

    onDestroy(() => {
        KeyListener?.removeListener();
    });

    async function playIteration() {
        const duration = CircleState.duration;
        UserRotation.set(100, {
            duration,
        });

        return new Promise((resolve, reject) => {
            let timeout = setTimeout(() => {
                KeyListener.removeListener();
                resolve(false);
            }, duration);

            KeyListener = TempReceiveEvent('ui:keydown', (e: KeyboardEvent) => {
                UserRotation.set($UserRotation, {
                    duration: 0,
                });

                if (e.key === CircleState.key) {
                    const userRotDeg = ($UserRotation / 100) * 360;
                    const targetRotDeg = CircleState.target.rotation;
                    const targetSize = CircleState.target.size * 3.6;

                    if (
                        userRotDeg > targetRotDeg &&
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

                clearTimeout(timeout);
                KeyListener.removeListener();
            });
        });
    }

    async function startGame(iterations, difficulty) {
        if (!$GAME_STATE.active) return;

        UserRotation.set(0, {
            duration: 0,
        });

        CircleState = {
            target: generateTargetSegment(difficulty),
            duration: generateDuration(difficulty),
            key: generateKey(),
        };

        const success = await playIteration();

        iterationState = success ? 'success' : 'fail';

        setTimeout(() => {
            iterationState = null
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
        const minDuration = 2000;
        const maxDuration = 5000;

        let duration =
            minDuration + (maxDuration - minDuration) * ((100 - difficulty) / 100);

        // make it vary by 20%
        const variation = duration * 0.2;
        const randomVariation = Math.random() * variation;
        duration += randomVariation;

        return duration;
    }

    function generateTargetSegment(difficulty: number) {
        difficulty = difficulty >= 100 ? 99 : difficulty <= 0 ? 5 : difficulty;

        const maxSize = 40;
        const size = maxSize - (difficulty / 100) * maxSize;
        const rotation = 90 + Math.random() * 180;

        return {
            size,
            rotation,
        };
    }

    function generateKey() {
        const index = Math.floor(Math.random() * KEYS.length);
        return KEYS[index];
    }
</script>

{#if visible}
    <div
        transition:scale
        style={SIZE_STYLES}
        class="grid place-items-center primary-shadow center rounded-full"
    >
        <div
            style={SIZE_STYLES_HALF}
            class="absolute font-bold secondary-shadow grid place-items-center bg-primary-50 rounded-full"
        >
            <p class="text-shadow text-[2vw]">{CircleState.key}</p>
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
                    class=" absolute  origin-center  transition-colors duration-100 {iterationState === 'success' ? 'glow-success stroke-success' : iterationState === 'fail' ? 'glow-fail stroke-fail' : 'stroke-accent glow-accent'}"
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
