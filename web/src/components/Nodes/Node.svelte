


<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { scale } from 'svelte/transition';

    export let i: number = null;
    export let iterationState: 'success' | 'fail' | null = null;
    export let selected: boolean = false;
    export let x, y, size;

    const dispatch = createEventDispatcher();
</script>

<button
transition:scale|global={{
    duration: 250,
    delay: 100 + Math.random() * 10 * 50,
}}
on:click={() => dispatch('click', i)}
class="absolute hover:scale-125 duration-200 transition-all aspect-square rounded-full z-10 {i ==
    0 &&
    'border-[0.1vh] border-tertiary'} {iterationState ==
'success'
    ? 'bg-success glow-success scale-125'
    : iterationState == 'fail'
      ? 'bg-error glow-error  scale-125'
      : selected
        ? 'bg-accent  glow-accent animate-scale'
        : 'bg-tertiary active:!scale-95 hover:brightness-125 animate-scale-mini primary-shadow'}"
style="left: {x}%; top: {y}%; width: {size}; height: {size};"
/>