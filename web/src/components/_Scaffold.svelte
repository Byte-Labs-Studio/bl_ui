<script lang="ts">
    import { Mouse } from "@enums/events";
    import HackWrapper from "@lib/HackWrapper.svelte";
    import GAME_STATE from "@stores/GAME_STATE";
    import type { TLevelState } from "@typings/gameState";
    import { TempInteractListener } from "@utils/interactHandler";
    import { delay } from "@utils/misc";
    import { type Tweened, tweened } from "svelte/motion";

    let Visible: boolean = false;

    let State: any = null;

    let IterationState: TLevelState = null;

    const UserDuration: Tweened<number> = tweened(0);

    let Iterations: number = null;
    
    let MouseListener: ReturnType<typeof TempInteractListener>;

    GAME_STATE.subscribe(state => {
        let shouldShow =
            state.active && state.type === 'CHANGE THIS TO ENUM' && !IterationState;
        if (shouldShow) {
            Visible = true;
            initialise();
        } else if (Visible && !shouldShow) {
            Visible = false;
            State = null;
            IterationState = null;
            clearMouseListener();
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

        setTimeout(() => {
            UserDuration.set(State.duration, {
                duration: State.duration,
            });
        }, 500);

        return new Promise((resolve, _) => {
            let durationCheck = setTimeout(() => {
                finish(false);
            }, State.duration + 500);

            MouseListener = TempInteractListener(
                Mouse.move,
                (e: MouseEvent) => {

                },
            );

            function finish(bool: boolean) {
                const currentValue = $UserDuration;
                UserDuration.set(currentValue, {
                    duration: 0,
                });

                clearTimeout(durationCheck);
                resolve(bool);
            }
        });
    }

    /** This code is responsible for starting the game.
     * @param iterations The number of iterations to play.
     * @param difficulty The difficulty of the game.
     */
     async function startGame(iterations: number, config: any) {
        if (!Visible) return;

        clearMouseListener();

        
        UserDuration.set(0, {
            duration: 0,
        });


        State = {
            // currentIteration: Iterations - iterations,
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
                    State = null;
                    return;
                }
            } else {
                GAME_STATE.finish(false);
                State = null;
                return;
            }
        }, 1000);
    }


    /** This code is responsible for generating a duration for a progress bar based on the difficulty.
     */
     function initialise() {
        if (!$GAME_STATE.active || State) return;

        const { iterations, config } = $GAME_STATE;
        Iterations = iterations;
        startGame(iterations, config as any);
    }

</script>


{#if Visible}

    <HackWrapper
    state={IterationState}
    title={['Path', 'Find']}
    subtitle="Go to the next point closest point."
    iterations={Iterations}
    iteration={State.currentIteration}
    progress={($UserDuration / State.duration) * 100}
    >

    <div
    class=" w-[60vh] h-[60vh] aspect-square bg-secondary/90 border-[0.15vh] border-tertiary/50"
>

    </div>
</HackWrapper>
{/if}