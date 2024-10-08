<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { SineWaveGenerator } from "./wave";
    import { WAVE_MATCH } from "@components/config/gameConfig";

    export let height: number = null;
    export let width: number = null;

    // export let speed = defaultWave.speed;
    // export let amplitude = defaultWave.amplitude;
    // export let wavelength = defaultWave.wavelength;
    // export let segmentLength = defaultWave.segmentLength;
    // export let lineWidth = defaultWave.lineWidth;
    // export let strokeStyle = defaultWave.strokeStyle;
    // export let timeModifier = defaultWave.timeModifier;

    export let {
        speed, amplitude, wavelength, segmentLength, lineWidth, timeModifier,
    } = WAVE_MATCH.DEFAULT_WAVE;

    export let strokeStyle: string = null;


    let Wave: SineWaveGenerator = null;
    let canvas: HTMLCanvasElement = null;

    $: {
        if (canvas && Wave) {
            Wave.updateWaveOptions({
                speed,
                amplitude,
                wavelength,
                segmentLength,
                lineWidth,
                strokeStyle,
                timeModifier,
            });
        }
    }


    onMount(() => {
        if (!canvas) {
            console.error("Canvas element not found");
            return;
        }

        // Set canvas dimensions and scale for device pixel ratio
        canvas.width = width * (window.devicePixelRatio || 1);
        canvas.height = height * (window.devicePixelRatio || 1);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        Wave = new SineWaveGenerator(canvas, {
            speed,
            amplitude,
            wavelength,
            segmentLength,
            lineWidth,
            strokeStyle,
            timeModifier,
        });

        startWave();

        return () => {
            console.log('destroying')
            Wave.destroy();
        };
    });

    function startWave() {
        let fpsInterval: number,
            now: number,
            then: number,
            elapsed: number;

        function startAnimating(fps: number) {
            fpsInterval = 1000 / fps;
            then = window.performance.now();
            animate();
        }

        function animate() {
            requestAnimationFrame(animate);

            now = window.performance.now();
            elapsed = now - then;
            if (elapsed > fpsInterval) {
                then = now - (elapsed % fpsInterval);
                Wave.render();
            }
        }

        startAnimating(60);
    }
</script>








<canvas
    bind:this={canvas}
class="absolute">

    
</canvas>