<script lang="ts">
    import {
        GetRandomKeyFromSet,
        NUMBER_SLIDE,
    } from '@components/config/gameConfig';
    import { type INumberSlideKeyState } from '@typings/numberSlide';
    import { onMount } from 'svelte';
    import { type Tweened } from 'svelte/motion';
    import { scale } from 'svelte/transition';

    export let key: string = null;
    export let state: INumberSlideKeyState = null;
    export let left: Tweened<number> = null;
    export let active: boolean = null;

    let fakeKey: string = '1';
    let fakeKeyInterval: ReturnType<typeof setInterval> = null;

    function clear() {
        clearInterval(fakeKeyInterval);
        fakeKeyInterval = null;
    }

    const stopRandomisingZone = 50 - NUMBER_SLIDE.ZONE_SIZE * 1.5;

    onMount(() => {
        fakeKey = GetRandomKeyFromSet('Numbers');

        fakeKeyInterval = setInterval(() => {
            if ($left > stopRandomisingZone || state) clear();
            let newKey = GetRandomKeyFromSet('Numbers');

            while (newKey === fakeKey) {
                newKey = GetRandomKeyFromSet('Numbers');
            }

            fakeKey = newKey;
        }, 150);
    });
</script>

{#if $left > 0 && $left < 100}
    <div 
    transition:scale={{ duration: 250 }}
    style="left: {$left}%;" class="grid place-items-center absolute">
        <p
            class=" absolute font-bold text-[2vw] text-shadow default-colour-transition
            {state === 'success'
                ? 'text-success glow-success'
                : state === 'fail'
                ? 'text-fail glow-fail'
                : active
                ? 'text-accent'
                : 'text-primary'}"
        >
            {$left < stopRandomisingZone ? fakeKey : key}
        </p>
    </div>
{/if}
