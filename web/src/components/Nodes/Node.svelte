<script lang="ts">
    import type { TLevelState } from '@typings/gameState';
    import { createEventDispatcher } from 'svelte';
    import { scale } from 'svelte/transition';

    export let iterationState: TLevelState = null;
    export let selected: boolean = false;
    export let x, y;
    export let size = '2.5vh';
    export let root: boolean = false;

    const dispatch = createEventDispatcher();
</script>

<button
    transition:scale|global={{
        duration: 250,
        delay: 250
    }}
    on:click={() => dispatch('click')}
    on:mousedown={() => dispatch('mousedown')}
    on:mouseup={() => dispatch('mouseup')} 
    class="absolute {$$props.class} hover:scale-125 duration-200 transition-colors aspect-square rounded-full z-10 {root && 'border-[0.1vh] border-tertiary'} {iterationState == 'success'
        ? 'bg-success glow-success scale-125'
        : iterationState == 'fail'
          ? 'bg-error glow-error  scale-125'
          : selected
            ? 'bg-accent  glow-accent animate-scale'
            : 'bg-tertiary active:!scale-95 hover:brightness-125 animate-scale-mini primary-shadow'}"
    style="left: {x}%; top: {y}%; width: {size}; height: {size};"
/>

<style>
    @keyframes scale-in-out {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.2);
        }
        100% {
            transform: scale(1);
        }
    }

    .animate-scale {
        animation: scale-in-out 2s infinite;
    }
</style>
