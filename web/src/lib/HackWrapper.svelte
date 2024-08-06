<script lang="ts">
    import { cn } from '@utils/misc';
    import { scale } from 'svelte/transition';
    import Hexagon from './Hexagon.svelte';
    import IconLoading from './icons/IconLoading..svelte';
    import IconSuccess from './icons/IconSuccess.svelte';
    import IconFail from './icons/IconFail.svelte';

    export let state: string = null;
</script>

<div
    transition:scale
    class={cn(
        'bg-solid center flex flex-col items-center justify-center p-[1vh] gap-[1vh] absolute',
        $$props.class,
    )}
>
    {#if $$slots.subtitle || $$slots['title-1'] || $$slots['title-2']}
        <div
            class="w-full h-[4vh] z-10 flex flex-row items-center justify-start gap-[1vh] border-primary"
        >
            <span
                class="flex flex-row items-center uppercase justify-center font-bold text-[3vh] title"
            >
                <p>
                    <slot name="title-1" />
                </p>
                <p class="text-accent">
                    <slot name="title-2" />
                </p>
            </span>

            <p class="text-tertiary/75 font-medium w-full">
                <slot name="subtitle" />
            </p>

            <!-- <div class="ml-auto grid place-items-center bg-success default-colour-transition glow-success h-full aspect-square"> -->

            <!-- </div> -->
            <Hexagon
            variant={state === 'success'
                ? 'success'
                : state === 'fail'
                  ? 'error'
                  : 'accent'}
            >
                {#if state === 'success'}
                    <div
                        class="absolute grid place-items-center w-full h-full aspect-square"
                    >
                        <IconSuccess />
                    </div>
                {:else if state === 'fail'}
                    <div
                        class="absolute grid place-items-center w-full h-full aspect-square"
                    >
                        <IconFail />
                    </div>
                {:else}
                    <div
                        transition:scale
                        class="absolute grid place-items-center w-full h-full aspect-square"
                    >
                        <IconLoading />
                    </div>
                {/if}
            </Hexagon>
        </div>
    {/if}

    <slot />
</div>

<style>
    .title {
        filter: drop-shadow(0 0 0.5vw rgba(var(--accent) / 0.5));
    }
</style>
