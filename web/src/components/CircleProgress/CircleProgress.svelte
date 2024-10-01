<script lang="ts">
	import { onMount } from "svelte";
	import { tweened, type Tweened } from "svelte/motion";
	import CircleProgressState from "./state.svelte";
	import { scale } from "svelte/transition";


    const UserSegmentSize: number = 2;
    const UserRotation: Tweened<number> = tweened(0);

    const STROKE_WIDTH: number = 1;
    const RADIUS: number = 4;
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

    let Game: CircleProgressState | null = null;

    onMount(() => {
        Game = new CircleProgressState();
    });

</script>



{#if Game?.active}
    <div
        transition:scale
        style={SIZE_STYLES}
        class="grid place-items-center primary-shadow default-game-position  rounded-full"
    >
        <div
            style={SIZE_STYLES_HALF}
            class="absolute primary-shadow grid place-items-center primary-bg rounded-full"
        >
            <p class="text-shadow absolute font-bold text-[2vw]">
                {Game.key}
            </p>
        </div>

        <svg
            style={SIZE_STYLES}
            version="1.1"
            class="z-0 absolute overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
        >
            {#if Game}
                <circle
                    style="stroke-width: {RADIUS * 0.1}vw"
                    class="absolute fill-none primary-stroke"
                    cx="50%"
                    cy="50%"
                    r="{RADIUS * 0.95}vw"
                />

                {@const { size, rotation } = Game.target}
                <circle
                    style="transform: rotate({-90 + rotation}deg);"
                    class=" absolute radial stroke-tertiary origin-center target-segment"
                    stroke-dasharray="{CIRCUMFERENCE}vw"
                    stroke-dashoffset="{CIRCUMFERENCE * ((100 - size) / 100)}vw"
                    stroke-width="{STROKE_WIDTH}vw"
                    fill-opacity="0"
                    cx="50%"
                    cy="50%"
                    r="{RADIUS * 0.9}vw"
                />
                <circle
                    style="transform: rotate({-90 +
                        ($UserRotation / 100) * 360}deg);"
                    class=" absolute origin-center default-colour-transition {IterationState ===
                    'success'
                        ? 'glow-success stroke-success'
                        : IterationState === 'fail'
                        ? 'glow-error stroke-error'
                        : 'stroke-accent glow-accent'}"
                    stroke-dasharray="{CIRCUMFERENCE}vw"
                    stroke-dashoffset="{CIRCUMFERENCE *
                        ((100 - UserSegmentSize) / 100)}vw"
                    stroke-width="{STROKE_WIDTH}vw"
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
