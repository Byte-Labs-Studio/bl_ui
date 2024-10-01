<script lang="ts">
	import Debug from "@providers/Debug.svelte";
	import { IS_BROWSER } from "./controllers/debug";
	import { onMount } from "svelte";
	import Visibility from "@providers/Visibility.svelte";
	import CircleProgress from "@components/CircleProgress/CircleProgress.svelte";

    

    onMount(() => {

    })

</script>


<Visibility>
    <CircleProgress />
</Visibility>



{#if $IS_BROWSER}
    <Debug />
{/if}
