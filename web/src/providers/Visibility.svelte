<script lang="ts">
	import { VISIBLE, CONFIG } from '@controllers/debug';
    import { Receive } from '@enums/events';
    import { ReceiveEvent } from '@utils/events';
    import { onMount } from 'svelte';

    ReceiveEvent(Receive.visible, (visible: boolean): void => {
        $VISIBLE = visible;
    });

    onMount(() => {
        if (!$CONFIG.allowEscapeKey) return;

        const keyHandler = (e: KeyboardEvent) => {
            if ($VISIBLE && ['Escape'].includes(e.code)) {
                // if (gameController.active) {
                //     gameController.finish(false)
                // }
            }
        };
        window.addEventListener('keydown', keyHandler);
        return () => window.removeEventListener('keydown', keyHandler);
    });
</script>

{#if $VISIBLE}
    <main>
        <slot />
    </main>
{/if}

<style>
    main {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 100;
        user-select: none;
        box-sizing: border-box;
        padding: 0;
        margin: 0;
        height: 100vh;
        width: 100vw;
    }
</style>
