<script lang="ts">
    import type { TLevelState } from "@typings/gameState";

	export let active: boolean = false;
    export let state: TLevelState = null;
</script>

<button  
	class="w-full h-full transition-all duration-100 border scale-105  focus:outline-none {state == 'success' ? 'border-success glow-success bg-success/50' : state == 'fail' ? 'border-error glow-error bg-error/50': active ?
		'bg-accent glow-accent' : 'bg-secondary/90 scale-100 border-secondary'}"
	aria-label="{active ? 'light' : 'dark'} button"
	on:click
    ><slot /></button
>