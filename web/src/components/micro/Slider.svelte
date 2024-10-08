<script lang="ts">
    import GAME_STATE from '@stores/GAME_STATE';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let min: number;
    export let max: number;
    export let step: number;
    export let value: number;
    export let disabled: boolean = false;

    let oldValue: number = value;

    function onChange() {
        if (oldValue !== value) {
            oldValue = value;
            dispatch('change', value);
        }
    }
</script>

<div class="flex items-center justify-center w-full h-[3vh] gap-[0.5vh] primary-bg">

    <slot name="before" />

    <div class="w-full grid place-items-center h-full btn px-[0.5vh]">
        <input
        class="w-full h-full bg-transparent styled-slider slider-progress"
        type="range"
        id="slider"
        style="--value: {value}; --min: {min}; --max: {max}; --step: {step};"
        {min}
        {max}
        {step}
        bind:value
        on:input={onChange}
        {disabled}
        on:mousedown={()=>GAME_STATE.playSound('primary')}
        on:mouseup={()=>GAME_STATE.playSound('secondary')}
    />
    </div>

    <slot name="after" />
</div>

<style>
    input#slider[type='range'].styled-slider.slider-progress {
        --range: calc(var(--max) - var(--min));
        --ratio: calc((var(--value) - var(--min)) / var(--range));
        --sx: calc(0.5 * 0.5vh + var(--ratio) * (100% - 0.1vw));
    }

    input#slider[type='range'] {
        height: 2vh;
        -webkit-appearance: none;
        width: 100%;
    }

    input#slider[type='range']::-webkit-slider-runnable-track {
        width: 100%;
        height: 1vh;
        cursor: pointer;
        background:
            linear-gradient( rgb(var(--primary)), rgb(var(--primary))) 0 / var(--sx) 100%
                no-repeat,
                rgb(var(--primary)) 0 / var(--sx) 100% no-repeat;
    }

    input#slider[type='range']::-webkit-slider-thumb {
        height: 2vh;
        width: 2vh;
        background: rgb(var(--primary-foreground));
        cursor: pointer;
        -webkit-appearance: none;
        margin-top: -0.5vh;
        transition: all 0.1s ease-in-out;
    }

    input#slider[type='range']::-webkit-slider-thumb:hover {
        filter: brightness(110%);
    }

    input#slider[type='range']::-webkit-slider-thumb:hover {
        background: rgb(var(--accent));
        filter: drop-shadow(0 0 0.5vh rgb(var(--accent)));
    }
    input#slider[type='range']::-webkit-progress-value {
        background-color: rgb(var(--secondary));
    }
</style>
