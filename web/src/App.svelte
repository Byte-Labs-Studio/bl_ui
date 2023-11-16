<script lang="ts">
    import { CONFIG } from './stores/stores';
    import { InitialiseListen } from '@utils/listeners';
    import Visibility from '@providers/Visibility.svelte';
    import Debug from '@providers/Debug.svelte';
    import CircleProgress from '@components/CircleProgress.svelte';
    import Progress from '@components/Progress.svelte';
    import KeyCircle from '@components/KeyCircle.svelte';

    CONFIG.set({
        fallbackResourceName: 'debug',
        allowEscapeKey: true,
    });

    InitialiseListen();
</script>

<Visibility>
    <CircleProgress />
    <Progress />
    <KeyCircle />
</Visibility>

<Debug />
