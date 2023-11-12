<script lang="ts">
    import { onMount } from 'svelte';
    import { CONFIG } from './stores/stores';
    import AlwaysListened, { InitialiseListen } from '@utils/listeners';
    import Visibility from '@providers/Visibility.svelte';
    import Debug from '@providers/Debug.svelte';
    import ImageHolder from '@components/ImageHolder.svelte';

    CONFIG.set({
        fallbackResourceName: 'debug',
        allowEscapeKey: true,
    });

    InitialiseListen();
</script>

<Visibility>
    <ImageHolder />
</Visibility>

<Debug />
