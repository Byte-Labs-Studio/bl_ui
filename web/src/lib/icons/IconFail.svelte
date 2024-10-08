<script lang="ts">
    import { draw } from 'svelte/transition';
</script>

<svg
    class="w-[60%] h-[60%]"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
>
    <line
        x1="2.35355"
        y1="1.64645"
        x2="13.3536"
        y2="12.6464"
        transition:draw|global
        class="stroke-tertiary stroke-[0.15vh]"
    />
    <line
        x1="1.64645"
        y1="12.6464"
        x2="12.6464"
        y2="1.64645"
        transition:draw|global
        class="stroke-tertiary stroke-[0.15vh]"
    />
</svg>
