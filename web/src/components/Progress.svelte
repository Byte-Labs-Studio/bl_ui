<script lang="ts">
    import GAME_STATE from '@stores/GAME_STATE';
    import { GameType } from '@typings/gameState';
    import { type IProgressGameState } from '@typings/progress';
    import { TempReceiveEvent } from '@utils/eventsHandlers';
    import { delay } from '@utils/misc';
    import { type Tweened, tweened } from 'svelte/motion';
    import { scale } from 'svelte/transition';
    import { GetRandonNumberKey, PROGRESS_DURATION } from './config/gameConfig';

    const UserSegmentSize: number = 0.5;
    const UserProgress: Tweened<number> = tweened(0);

    let Visible: boolean = false;

    let ProgressState: IProgressGameState = null;

    let IterationState: 'success' | 'fail' | null = null;

    let KeyListener: ReturnType<typeof TempReceiveEvent>;

    GAME_STATE.subscribe(state => {
        let shouldShow =
            state.active &&
            state.type === GameType.Progress && !ProgressState;
        if (shouldShow) {
            Visible = true;
            initialise();
        } else if (Visible && !shouldShow) {
            Visible = false;
            ProgressState = null;
            KeyListener?.removeListener();
            KeyListener = null;
        }
    });
    
    async function playIteration() {
        const duration = ProgressState.duration;
        UserProgress.set(100, {
            duration,
        });

        return new Promise((resolve, _) => {
            let timeout = setTimeout(() => {
                resolve(false);
            }, duration);

            KeyListener = TempReceiveEvent('ui:keydown', (e: KeyboardEvent) => {
                clearTimeout(timeout);

                UserProgress.set($UserProgress, {
                    duration: 0,
                });

                if (e.key === ProgressState.key) {
                    const targetProg= ProgressState.target.progress;
                    const targetSize = ProgressState.target.size

                    const userProg = $UserProgress;

                    if (
                        userProg > targetProg - UserSegmentSize &&
                        userProg < targetSize + targetProg
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

        UserProgress.set(0, {
            duration: 0,
        });

        ProgressState = {
            target: generateTarget(difficulty),
            duration: generateDuration(difficulty),
            key: GetRandonNumberKey(),
        };

        await delay(500)

        const success = await playIteration();
        IterationState = success ? 'success' : 'fail';

        setTimeout(() => {
            IterationState = null
            if (success && iterations > 0) {
                iterations--;
                if (iterations > 0) {
                    startGame(iterations, difficulty);
                } else {
                    GAME_STATE.finish(true);
                    ProgressState = null;
                    return;
                }
            } else {
                GAME_STATE.finish(false);
                ProgressState = null;
                return;
            }
        }, 500);
    }

    
    function initialise() {
        if (!$GAME_STATE.active || ProgressState) return;

        const { iterations, difficulty } = $GAME_STATE;
        startGame(iterations, difficulty);
    }

    function generateTarget(difficulty) {
        difficulty = difficulty >= 100 ? 99 : difficulty <= 0 ? 5 : difficulty;

        const maxSize = 50;
        const size = maxSize - (difficulty / 100) * maxSize;

        const minProgress = 40;
        const maxProgress = Math.min(maxSize - size, 100 - size); // Calculate the maximum allowed progress
        const progress = Math.max(minProgress, Math.floor(Math.random() * (maxProgress - minProgress + 1) + minProgress));
        console.log(progress, size, progress + size)
        return {
            size,
            progress,
        };
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
</script>

{#if Visible}
<div
    transition:scale
    class=" primary-shadow center-x bottom-[5vh] w-[25vw] h-[0.5vw] bg-primary-50"
>
    <div
        class="h-[2.5vw] aspect-square absolute grid place-items-center center-y secondary-shadow bg-primary-50 -translate-x-[130%]"
    >
        <p class="text-shadow absolute font-bold text-[2vw]">{ProgressState.key}</p>
    </div>

    <div
        style="left: {$UserProgress}%; width: {UserSegmentSize}vw"
        class="h-[1vw] center-y z-[10] absolute origin-center transition-colors duration-100 {IterationState ===
        'success'
            ? 'glow-success bg-success'
            : IterationState === 'fail'
            ? 'glow-fail bg-fail'
            : 'bg-accent glow-accent'}"
    />

    {#if ProgressState}
        {@const { size, progress } = ProgressState.target}
        <div
            style="left: {progress}%; width: {size}%"
            class="h-[1vw] center-y absolute origin-center bg-primary z-0"
        />
    {/if}
</div>
{/if}