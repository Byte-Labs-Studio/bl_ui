<script lang="ts">
    import type { TLevelState } from '@typings/gameState';
    import { type TMineSweeperCellStates } from '@typings/mineSweeper';

    export let state: TLevelState = null;
    export let preview: boolean = false;
    export let bombState: TMineSweeperCellStates;
    export let mine: boolean;
</script>

<button
    class="w-full h-full default-all-transition border scale-105 focus:outline-none
    {preview
        ? mine
            ? 'animate-pulse bg-error/50 border-error'
            : 'animate-pulse bg-accent/50 border-accent' :
            state == 'success'
            ? 'border-success glow-success bg-success/50' : state == 'fail'
              ? 'border-error glow-error bg-error/50'
              : bombState == 'success'
          ? 'border-success glow-success bg-success/50' : bombState == 'fail' ? 'border-error glow-error bg-error/50'
            :  'bg-accent/50 scale-100 border-accent'}"
    on:click><slot /></button
>
