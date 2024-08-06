<script lang="ts">
    import { cn } from '@utils/misc';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    let height: number = 0;

    // Component props
    export let active: boolean = false;
    export let disabled: boolean = false;
    export let strokeWidth: string = '1vh';
    export let variant: 'accent' | 'success' | 'error' | 'warning' = 'accent';

    // CSS variable for the variant
    $: cssVar = `rgb(var(--${variant}))`;

    // Tailwind classes for fill colors
    const fills = {
        accent: 'fill-accent',
        success: 'fill-success',
        error: 'fill-error',
        warning: 'fill-warning',
    };

    const transparentFills = {
        accent: 'fill-accent/25',
        success: 'fill-success/25',
        error: 'fill-error/25',
        warning: 'fill-warning/25',
    };

    // Reactive statements
    $: fill = fills[variant];
    $: transparentFill = transparentFills[variant];
    $: filter = active
        ? `drop-shadow(0 0 0.5vh ${cssVar})`
        : disabled
          ? ''
          : `drop-shadow(0 0 0.05vw ${cssVar})`;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<button
    bind:clientHeight={height}
    class={cn('aspect-square h-full grid place-items-center transition-all duration-100 hover:scale-105 active:scale-100 ', $$props.class)}
    on:click={() => dispatch('click')}
>
<div class="w-full h-full grid place-items-center z-10">
    <slot />
</div>
    <svg
        width={height}
        {height}
        version="1.1"
        style="filter: {filter};"
        class="origin-center transition-all duration-200 absolute z-0 {active
            ? fill
            : transparentFill}"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 184.751 184.751"
        xml:space="preserve"
    >
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
            <path
                stroke={cssVar}
                stroke-width={active || disabled ? '0' : strokeWidth}
                d="M0,92.375l46.188-80h92.378l46.185,80l-46.185,80H46.188L0,92.375z"
            />
        </g>
    </svg>



</button>
