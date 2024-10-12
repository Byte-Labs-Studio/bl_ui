<script lang="ts">
    import { Receive } from '@enums/events';
    import { InitialiseDebugSenders } from '@utils/debug/init';
    import { InitialiseDebugReceivers } from '@utils/debug/receivers';
    import SendDebuggers from '@utils/debug/senders';
    import { DebugEventSend } from '@utils/eventsHandlers';
    import debug_image from '@assets/debug_image.png';
    import { onMount } from 'svelte';

    onMount(() => {
        InitialiseDebugSenders();
        InitialiseDebugReceivers();
    });

    let menuOpen: boolean = false;
</script>


<div class="w-fit h-fit flex flex-col z-[9999999]">
    <button
        class="px-[1vw] py-[0.5vw] w-fit h-fit z-[9999999] bg-accent"
        on:click={() => (menuOpen = !menuOpen)}
    >
        Debug
    </button>

    {#if menuOpen}
        <ol
            class="flex flex-col gap-2 bg-primary z-[9999999] max-w-[25vw] h-[80vh] overflow-y-auto px-[0.5vw] py-[0.5vw]"
        >
            {#each SendDebuggers as { label, actions }}
                <li
                    class="flex flex-col gap-1 border-l-[2px] border-accent px-[0.25vw]"
                >
                    <span class="w-full">{label}</span>

                    {#each actions as action}
                        <div class="flex flex-row flex-wrap gap-[0.5vw]">
                            {#if action.type === 'text'}
                                <span
                                    class="w-full px-[0.5vw] py-[0.25vw] flex flex-col gap-[0.2vw] bg-accent items-start"
                                >
                                    <p class="">{action.label}</p>

                                    <input
                                        type="text"
                                        class="h-full w-full px-[0.25vw] text-black"
                                        bind:value={action.value}
                                    />
                                    <button
                                        class="px-[0.5vw] py-[0.25vw] w-[5vw] bg-primary"
                                        on:click={() => {
                                            // @ts-ignore
                                            action.action(action.value);
                                        }}
                                    >
                                        Apply
                                    </button>
                                </span>
                            {:else if action.type === 'checkbox'}
                                <span
                                    class="w-full px-[0.5vw] py-[0.25vw] flex flex-row gap-[0.2vw] bg-accent items-center"
                                >
                                    <p>{action.label}</p>

                                    <input
                                        type="checkbox"
                                        class="h-full aspect-square"
                                        bind:checked={action.value}
                                        on:input={(e) => {
                                            // @ts-ignore
                                            action.action(action.value);
                                        }}
                                    />
                                </span>
                            {:else if action.type === 'slider'}
                                <span
                                    class="w-full px-[0.5vw] py-[0.25vw] flex flex-col gap-[0.2vw] bg-accent items-start"
                                >
                                    <p>{action.label}</p>

                                    <input
                                        type="range"
                                        class="w-full"
                                        min={action.min || 0}
                                        max={action.max || 100}
                                        step={action.step || 1}
                                        bind:value={action.value}

                                    />
                                    <button
                                        class="px-[0.5vw] py-[0.25vw] w-[5vw] bg-primary border-secondary border-2"
                                        on:click={() => {
                                            // @ts-ignore
                                            action.action(action.value);
                                        }}
                                    >
                                        Action
                                    </button>
                                </span>
                            {:else}
                                <button
                                    on:click={() => {
                                        // @ts-ignore
                                        action.action();
                                    }}
                                    class="w-full px-[0.5vw] py-[0.25vw] bg-accent"
                                >
                                    {action.label}
                                </button>
                            {/if}
                        </div>
                    {/each}
                </li>
            {/each}
        </ol>
    {/if}

    <div
        style="background-image: url({debug_image});"
        class="absolute w-screen bg-cover bg-no-repeat bg-center h-screen top-0 left-0 dev-image"
    />
</div>
