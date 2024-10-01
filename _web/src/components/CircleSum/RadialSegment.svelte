<script>
    import { degToRad } from '@utils/misc';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let state;
    export let index;
    export let containerSize;
    export let pieAngle;
    export let gap;
    export let hoveredIndex;
    export let innerHoleSize
    export let radius;
    export let active;

    $: gapMultiplier = Math.abs(pieAngle * index - pieAngle * (index + 1));
    $: hovered = hoveredIndex === index;
    $: hoveredRadius = radius + (hovered ? 10 : 0);
    $: innerRad = innerHoleSize / 2;

    $: centerX = containerSize / 2;
    $: isLargeArc = gapMultiplier > 180 ? 1 : 0;

    function handleMouseEnter() {
        if (!state) hoveredIndex = index;
    }

    function handleMouseLeave() {
        hoveredIndex = null;
    }

    const cos = Math.cos;
    const sin = Math.sin;

    function point(centerX, centerY, radius, angle) {
        const radians = degToRad(angle);
        const x = centerX + radius * cos(radians);
        const y = centerY + radius * sin(radians);
        return `${x.toPrecision(5)},${y.toPrecision(5)}`;
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<path
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
    on:click={() => dispatch('click', index)}
    d={`M${point(centerX, centerX, innerRad, pieAngle * index + gap)},
        A${innerRad},${innerRad},0,${isLargeArc},1,
        ${point(centerX, centerX, innerRad, pieAngle * (index + 1) - gap)},
        L${point(centerX, centerX, hoveredRadius, pieAngle * (index + 1) - gap / 2)},
        A${hoveredRadius},${hoveredRadius},0,${isLargeArc},0,
        ${point(centerX, centerX, hoveredRadius, pieAngle * index + gap)},
        Z`}
    class="default-all-transition stroke-[0.1vw] {!state && 'hover:fill-accent/75'}  {state == 'success' ? 'stroke-success glow-success fill-success/50' : state == 'fail' ? 'stroke-error glow-error fill-error/50': active ?
		'fill-accent glow-accent' : 'fill-accent/50 scale-100 stroke-accent'} cursor-pointer"
/>