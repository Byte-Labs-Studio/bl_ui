<script lang="ts">
    import { CONFIG, IS_BROWSER } from './stores/stores';
    import { InitialiseListen } from '@utils/listeners';
    import { Send } from '@enums/events';
    import { SendEvent } from '@utils/eventsHandlers';
    import Visibility from '@providers/Visibility.svelte';
    import Debug from '@providers/Debug.svelte';
    import CircleProgress from '@components/CircleProgress.svelte';
    import Progress from '@components/Progress.svelte';
    import KeyCircle from '@components/KeyCircle.svelte';
    import KeySpam from '@components/KeySpam.svelte';
    import NumberSlide from '@components/NumberSlide.svelte';
    import RapidLines from '@components/RapidLines.svelte';
    import CircleShake from '@components/CircleShake.svelte';
    import PathFind from '@components/PathFind.svelte';
    import Untangle from '@components/Untangle.svelte';
    import LightsOut from '@components/LightsOut.svelte';
    import DigitDazzle from '@components/DigitDazzle.svelte';
    import WordWiz from '@components/WordWiz.svelte';
    import CircleSum from '@components/CircleSum.svelte';
    import WaveMatch from '@components/WaveMatch.svelte';
    import MineSweeper from '@components/MineSweeper.svelte';
    import PrintLock from '@components/PrintLock.svelte';
    import { GameType } from '@enums/gameTypes';
    import { onMount } from 'svelte';
    import GAME_STATE from '@stores/GAME_STATE';

    CONFIG.set({
        fallbackResourceName: 'debug',
        allowEscapeKey: true,
    });

    InitialiseListen();

    SendEvent(Send.uiLoaded);

    const games = {
        [GameType.CircleProgress]: CircleProgress,
        [GameType.Progress]: Progress,
        [GameType.KeyCircle]: KeyCircle,
        [GameType.KeySpam]: KeySpam,
        [GameType.NumberSlide]: NumberSlide,
        [GameType.RapidLines]: RapidLines,
        [GameType.CircleShake]: CircleShake,
        [GameType.PathFind]: PathFind,
        [GameType.Untangle]: Untangle,
        [GameType.LightsOut]: LightsOut,
        [GameType.DigitDazzle]: DigitDazzle,
        [GameType.WordWiz]: WordWiz,
        [GameType.CircleSum]: CircleSum,
        [GameType.WaveMatch]: WaveMatch,
        [GameType.MineSweeper]: MineSweeper,
        [GameType.PrintLock]: PrintLock,
    }

    let CURRENT_GAME: typeof games[keyof typeof games] | null = null;

    onMount(() => {
        const sub = GAME_STATE.subscribe(state => {
            let shouldShow = state.active && state.type
            console.log('should show', shouldShow)
            if (shouldShow) {
                CURRENT_GAME = games[state.type]
            } else {
                CURRENT_GAME = null
            }
        });

        return () => sub();
    })
</script>

<Visibility>
    {#if CURRENT_GAME}
        <svelte:component this={CURRENT_GAME} />
    {/if}
    <!-- <CircleProgress />
    <Progress />
    <KeyCircle />
    <KeySpam />
    <NumberSlide />
    <RapidLines />
    <CircleShake />

    <PathFind />
    <Untangle />
    <LightsOut />
    <DigitDazzle />
    <WordWiz />
    <CircleSum />
    <WaveMatch />
    <MineSweeper />
    <PrintLock /> -->
</Visibility>

{#if $IS_BROWSER}
    <Debug />
{/if}
