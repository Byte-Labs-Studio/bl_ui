<script lang="ts">
    import { Receive } from '@enums/events';
    import { ReceiveEvent } from '@utils/eventsHandlers';

    let size: number = 40;
    let colInvert: boolean = true;
    let text: string = 'Byte Labs';

    ReceiveEvent(Receive.imageResize, (value: number) => {
        size = value;
    });

    ReceiveEvent(Receive.imageInvert, (bool: boolean) => {
        colInvert = bool;
    });

    ReceiveEvent(Receive.changeText, (newtext: string) => {
        text = newtext;
    });

    ReceiveEvent(Receive.resetText, () => {
        text = 'Byte Labs';
    });
</script>

<div class="w-screen h-screen absolute top-0 left-0">
    <img
        src={colInvert ? './TextWhite.png' : './TextBlack.png'}
        style="width: {size}vw;"
        class="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-fit absolute"
        alt="Byte Labs Logo"
    />

    <h2
        style="color: {colInvert ? 'white' : 'black'}; font-size: {size / 10}vw"
        class="text-center text-black font-semibold bottom-[25vh] left-1/2 font-[Pixeboy] -translate-x-1/2 h-fit absolute"
    >
        {text}
    </h2>
</div>
