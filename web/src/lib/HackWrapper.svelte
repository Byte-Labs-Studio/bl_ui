<script lang="ts">
    import { cn } from '@utils/misc';
    import { scale } from 'svelte/transition';
    import Hexagon from './Hexagon.svelte';
    import IconLoading from './icons/IconLoading..svelte';
    import IconSuccess from './icons/IconSuccess.svelte';
    import IconFail from './icons/IconFail.svelte';

    export let state: string = null;
    export let subtitle: string = null;
    export let title: string[] = null;
    export let iterations: number = 1;
    export let iteration: number = 0;
    export let progress: number = 0;
    export let hasDuration: boolean = false;
</script>

<div
    transition:scale|global
    class={cn(
        'bg-solid center flex flex-col items-center justify-center p-[1vh] gap-[1vh] absolute shadow-box',
        $$props.class,
    )}
>
    <div
        class="w-full h-[4vh] z-10 flex flex-row items-center justify-start gap-[1vh] border-primary"
    >
        {#if title}
            <span
                class="flex flex-row items-center uppercase justify-center font-bold text-[3vh] title"
            >
                {#each title as titleItem, i}
                    <p class:text-accent={i === title.length - 1}>
                        {titleItem}
                    </p>
                {/each}
            </span>
        {/if}

        {#if subtitle}<p
                class="text-tertiary/75 font-medium w-full text-[1.5vh]"
            >
                {subtitle}
            </p>{/if}

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

    <slot />

    {#if iterations > 0}
        {@const prog = hasDuration ? progress : 100}
        {@const fail = (prog == 100 && hasDuration) || state == 'fail'}
        <div class="w-full h-[2vh] flex flex-row gap-[1vh] z-10">
            {#each { length: iterations } as _, i}
                <div class="w-full h-full primary-bg">
                    {#if i === iteration}
                        <div
                            style="width: {prog}%;"
                            class:bg-error={fail}
                            class:bg-accent={state == null}
                            class:glow-error={fail}
                            class:glow-accent={state == null}
                            class:bg-success={state == 'success'}
                            class:glow-success={state == 'success'}
                            class="h-full default-colour-transition ease-linear"
                        />
                    {:else if iteration > i}
                        <div
                            class:bg-error={fail}
                            class:bg-tertiary={state == null}
                            class:glow-error={fail}
                            class:bg-success={state == 'success'}
                            class:glow-success={state == 'success'}
                            class="h-full bg-tertiary w-full"
                        />
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .title {
        filter: drop-shadow(0 0 0.5vw rgba(var(--accent) / 0.5));
    }
</style>
