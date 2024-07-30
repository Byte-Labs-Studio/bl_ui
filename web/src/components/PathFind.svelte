<script lang="ts">
    import { type IPathFindGameState } from "@typings/pathFind";
    import { TempInteractListener } from "@utils/interactHandler";
    import { scale } from "svelte/transition";


    let Visible: boolean = false;

    // let NumberSlideState: INumberSlideGameState = null;

    let IterationState: IPathFindGameState = null;

    let KeyListener: ReturnType<typeof TempInteractListener>;
</script>




<div
transition:scale
    class="primary-shadow center w-[60vh] h-[60vh] aspect-square bg-secondary-50"
>


</div>