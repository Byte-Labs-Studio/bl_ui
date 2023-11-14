<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import { tweened } from 'svelte/motion';
  import { ReceiveNUI } from "../utils/ReceiveNUI";
  import { debugData } from "../utils/debugData";
  import { SendNUI } from "../utils/SendNUI";

    export let show: boolean = false;

    let Radius: number = 4;
    let Circumference: number = 2 * Math.PI * Radius;
    let Diameter: number = (2 * Radius) + 1;

    let segmentSize: number = 0;
    let segmentStartVal: number = 0;
    let rotation: number = 0;


    let valueTw = tweened(0);
    let value: number = 0;
    $: value = $valueTw * 100;

    let allowedKeys = ["1", "2", "3", "4"];
    let chosenKey: string;

    let win: boolean = false;
    let lose: boolean = false;
    let result: boolean = false


    let count: number = 0;
    let numGames: number = 0;
    let level: number = 0;

    let _E = Math.E;
    let _exp:number;



    //listen for number key presses

    $: if(value == 100 && !lose) {
        lose = true;
        setTimeout(() => {
            sendLose()
        }, 250)

    }



    function randomRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
}

    function createSegment() {
        // console.log(level)
        segmentSize = randomRange(_exp * 10, _exp * 15);
        // segmentSize =15
        // console.log(segmentSize)
        segmentStartVal = randomRange(40, 65);
        rotation = (360 * ((segmentStartVal) / 100));
    } 

    function finish() {
        if (win) {
            valueTw.set((segmentStartVal/100), {duration: 0});
        } else {
            valueTw.set(1, {duration: 0});
        }
        document.removeEventListener("keydown", handleKeyPress);
        setTimeout(() => {

            if (lose) {
                sendLose()
                // console.log("lost")
                return
            }
            // console.log(count)
            if (count == numGames && win) {
                // console.log("finished")
                count = 0;
                numGames = 0;
                sendWin()
                return
            } 
            if (count < numGames) {
                // console.log("next game")
                count++;
                lose = false;
                win = false;
                start()
                return
            }
        }, 250);
    }


    function handleKeyPress(e) {
        if (e.key == chosenKey) {
            if (value >= (segmentStartVal-2) && value <= ((segmentStartVal) + (segmentSize+4))) {
                win = true;
                lose = false;
                // console.log("win")
                finish();
                return
            }
        }
        lose = true;
        win = false
        finish();
        return
    }


    function start() {
        show = true;
        createSegment()
        valueTw.set(0, {duration: 0}); 
        valueTw.set(1, {
            duration: randomRange(1000 * _exp, 2500 * _exp),
        } );
        chosenKey = allowedKeys[Math.floor(Math.random() * allowedKeys.length)];
        document.addEventListener("keydown", handleKeyPress);
    }

    ReceiveNUI("circleMG:start", (data) => {
        numGames = data.iterations;
        level = data.level;
        _exp = Math.pow(_E, (-1 * level)) + 0.7
        start()
    });

    // debugData([
    //   {
    //     action: 'circleMG:start',
    //     data: {
    //         show: true,
    //         iterations: 4,
    //         level: 10
    //     },
    //   },
    // ]);

    function sendLose() {
        reset()
        SendNUI('circleMG:result', {
        result: false
    });
}

    function sendWin() {
        reset()
        SendNUI('circleMG:result', {
        result: true
    });
}
    function reset() {
        valueTw.set(0, {duration: 0});
        show = false;
        lose = false;
        win = false;
        result = false;
        count = 0;
        numGames = 0;
        level = 0;
    }



</script>


<!-- Randomly generate a segment on the progressbar and return true if the user presses a key while the progressbar is on it -->


{#if show}
<div in:fly out:fade={{duration: 200}} class=" grid place-items-center center overflow-visible radial relative" style="width:{Diameter}rem; height:{Diameter}rem;" >
    <svg version="1.1" class="z-0 main-circle absolute overflow-visible shadow" style="width:{Diameter}rem; height:{Diameter}rem; background-color:var(--background);"  xmlns="http://www.w3.org/2000/svg">
        <!-- <svg class="main-circle overflow-visible" fill="var(--background)"     >
            <circle  class="absolute"  fill-opacity="1" cx="50%" cy="50%" r="{OutsideCircumference}rem"/>
        </svg> -->
        
        <svg  class="progress overflow-visible" stroke="white">
            <circle  class="progress absolute radial" stroke-dasharray="{Circumference}rem" stroke-dashoffset="{Circumference * ((100 - value)/100)}rem" stroke-width="{Radius * 1.5}" fill-opacity="0" cx="50%" cy="50%" r="{Radius}rem"/>
        </svg>

        <svg class="overflow-visible segment"  stroke="grey">
            <circle stroke-linecap="round" class:red={lose} class:green={win} style="transform: rotate({-90 + rotation}deg);" class=" segment absolute radial" stroke-dasharray="{Circumference}rem" stroke-dashoffset="{Circumference * ((100 - segmentSize)/100)}rem" stroke-width="{Radius * 2.5}" fill-opacity="0" cx="50%" cy="50%" r="{Radius}rem"/>
        </svg>
    </svg>
    <i style="color:white; font-size: {Radius * 1}rem" class="icon radial absolute ">
        {#if chosenKey}
        {chosenKey}
        {/if}
    </i>
</div>
{/if}

<style>

    .segment {
        transform-origin:center;
        filter: drop-shadow(0 0 0.2rem black);
        transition: all 0.1s ease-in-out;
    }

    .main-circle {
        border-radius: 50%;
    }

    .shadow {
        box-shadow:   0 0 0.3rem 0.05rem var(--background);
    }

    .red {
        stroke: #fc0303;
        filter: drop-shadow(0 0 0.2rem #fc0303);
    }

    .green {
        stroke: #52fc03;
        filter: drop-shadow(0 0 0.2rem #52fc03);
    }

    .progress {
        transform-origin: center;
        transform: rotate(-90deg);
        /* transition: stroke-dashoffset 0.2s ease-in-out; */
    }

    .center {
        position: absolute;
        left: 50%;
        bottom: 15rem;
        transform-origin: center;
        transform: scale(1.5) translateX(-50%);
        margin: 0;
    }

    .icon {
        filter: drop-shadow(0 0 0.15rem black);
        font-family: 'Poppins', sans-serif;
    color:white;
    filter: drop-shadow(0 0 0.15rem black);
    font-style: normal; 
    }
</style>