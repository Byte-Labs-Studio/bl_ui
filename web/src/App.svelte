<script lang="ts">
    import { CONFIG, IS_BROWSER } from './stores/stores';
    import { InitialiseListen } from '@utils/listeners';
    import Visibility from '@providers/Visibility.svelte';
    import Debug from '@providers/Debug.svelte';
    import CircleProgress from '@components/CircleProgress.svelte';
    import Progress from '@components/Progress.svelte';
    import KeyCircle from '@components/KeyCircle.svelte';
    import KeySpam from '@components/KeySpam.svelte';
    import NumberSlide from '@components/NumberSlide.svelte';
    import RapidLines from '@components/RapidLines.svelte';

    CONFIG.set({
        fallbackResourceName: 'debug',
        allowEscapeKey: false,
    });

    InitialiseListen();
</script>

<Visibility>
    <CircleProgress />
    <Progress />
    <KeyCircle />
    <KeySpam />
    <NumberSlide />
    <RapidLines />
</Visibility>

{#if $IS_BROWSER}
    <Debug />
{/if}
