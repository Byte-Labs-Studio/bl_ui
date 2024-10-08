<script lang="ts">
    import { type TLineState } from "@typings/rapidLines";
    import { type Tweened } from "svelte/motion";
    import { scale } from "svelte/transition";

    export let state: TLineState = null;
    export let left: Tweened<number> = null;

    const LineSize: number = 0.5;
</script>

{#if $left > 0 && $left < 100}
    <div 
    in:scale={{ duration: 250 }}
    out:scale={{ duration: 250, delay: 250 }}
    style="left: {$left}%; width: {LineSize}vw;" 
    
    class="grid place-items-center z-10 absolute h-[1vw] default-colour-transition {state === 'success'
    ? 'bg-success glow-success'
    : state === 'fail'
    ? 'bg-error glow-error'
    : state === 'active'
    ? 'bg-accent glow-accent'
    : 'bg-tertiary primary-shadow'}">
    </div>
{/if}
