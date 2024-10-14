import { DebugItem } from '@typings/events'
import { toggleVisible } from './visibility'
import { Receive } from '@enums/events'
import { DebugEventSend } from '@utils/eventsHandlers'
import type { TGameParams, TKeyGameParam, TDifficultyParam, TNodeHackGameParam, TLevelHackGameParam, TLengthHackGameParam, TGridHackGameParam, TInputHackGameParam } from '@typings/gameState'
import { GameType } from '@enums/gameTypes'

/**
 * The debug actions that will show up in the debug menu.
 */
const SendDebuggers: DebugItem[] = [
    {
        label: 'Visibility',
        actions: [
            {
                label: 'True',
                action: () => toggleVisible(true),
            },
            {
                label: 'False',
                action: () => toggleVisible(false),
            },
        ],
    },
    {
        label: 'CircleProgress',
        actions: [
            {
                label: 'Custom Difficulty',
                action: (value: number) => {
                    const config = {
                        difficulty: value,
                    } as TDifficultyParam

                    DebugEventSend<TGameParams>(Receive.start, {
                        type: GameType.CircleProgress,
                        iterations: 2,
                        config,
                    })
                },
                value: 50,
                type: 'slider',
            },
        ],
    },
    {
        label: 'Progress',
        actions: [
            {
                label: 'Custom Difficulty',
                action: (value: number) => {

                    const config = {
                        difficulty: value,
                    } as TDifficultyParam

                    DebugEventSend<TGameParams>(Receive.start, {
                        type: GameType.Progress,
                        iterations: 2,
                        config,
                    })
                },
                value: 50,
                type: 'slider',
            },
        ],
    },
    {
        label: 'KeyCircle',
        actions: [
            {
                label: 'Custom Difficulty',
                action: (value: number) => {

                    const config = {
                        difficulty: value,
                        numberOfKeys: 3,
                    } as TKeyGameParam

                    DebugEventSend<TGameParams>(Receive.start, {
                        type: GameType.KeyCircle,
                        iterations: 2,
                        config,
                    })
                },
                value: 50,
                type: 'slider',
            },
        ],
    },
    {
        label: 'KeySpam',
        actions: [
            {
                label: 'Custom Difficulty',
                action: (value: number) => {

                    const config = {
                        difficulty: value,
                    } as TDifficultyParam

                    DebugEventSend<TGameParams>(Receive.start, {
                        type: GameType.KeySpam,
                        iterations: 2,
                        config,
                    })
                },
                value: 50,
                type: 'slider',
            },
        ],
    },
    {
        label: 'NumberSlide',
        actions: [
            {
                label: 'Custom Difficulty',
                action: (value: number) => {

                    const config = {
                        difficulty: value,
                        numberOfKeys: 4,
                    } as TKeyGameParam

                    DebugEventSend<TGameParams>(Receive.start, {
                        type: GameType.NumberSlide,
                        iterations: 2,
                        config,
                    })
                },
                value: 50,
                type: 'slider',
            },
        ],
    },
    {
        label: 'RapidLines',
        actions: [
            {
                label: 'Custom Difficulty',
                action: (value: number) => {

                    const config = {
                        difficulty: value,
                        numberOfKeys: 4,
                    } as TKeyGameParam

                    DebugEventSend<TGameParams>(Receive.start, {
                        type: GameType.RapidLines,
                        iterations: 2,
                        config,
                    })
                },
                value: 50,
                type: 'slider',
            },
        ],
    },
    {
        label: 'CircleShake',
        actions: [
            {
                label: 'Custom Difficulty',
                action: (value: number) => {

                    const config = {
                        difficulty: value,
                        numberOfKeys: 2,
                    } as TKeyGameParam

                    DebugEventSend<TGameParams>(Receive.start, {
                        type: GameType.CircleShake,
                        iterations: 2,
                        config,
                    })
                },
                value: 50,
                type: 'slider',
            },
        ],
    },
    {
        label: 'PathFind',
        actions: [
            {
                label: 'Duration',
                action: (value: number) => {

                    const config = {
                        duration: value * 1000,
                        numberOfNodes: 10,
                    } as TNodeHackGameParam

                    DebugEventSend<TGameParams>(Receive.start, {
                        type: GameType.PathFind,
                        iterations: 2,
                        config,
                    })
                },
                value: 50,
                type: 'slider',
            },
        ],
    },
    {
        label: 'Untangle',
        actions: [
            {
                label: 'Duration',
                action: (value: number) => {

                    const config = {
                        duration: value * 1000,
                        numberOfNodes: 10,
                    } as TNodeHackGameParam

                    DebugEventSend<TGameParams>(Receive.start, {
                        type: GameType.Untangle,
                        iterations: 2,
                        config,
                    })
                },
                min: 1,
                value: 50,
                type: 'slider',
            },
        ],
    },
    {
        label: 'Lights Out',
        actions: [
            {
                label: 'Duration',
                action: (value: number) => {

                    const config = {
                        duration: 30000,
                        level: value,
                    } as TLevelHackGameParam

                    DebugEventSend<TGameParams>(Receive.start, {
                        type: GameType.LightsOut,
                        iterations: 2,
                        config,
                    })
                },
                value: 0,
                min: 0,
                max: 50,
                type: 'slider',
            },
        ],
    },
    {
        label: 'Digit Dazzle',
        actions: [
            {
                label: 'Custom Difficulty',
                action: (value: number) => {

                    const config = {
                        duration: 20000,
                        length: value,
                    } as TLengthHackGameParam

                    DebugEventSend<TGameParams>(Receive.start, {
                        type: GameType.DigitDazzle,
                        iterations: 2,
                        config,
                    })
                },
                value: 4,
                min: 1,
                max: 12,
                type: 'slider',
            },
            {
                label: 'Input',
                action: (value: number) => {
                    const config = {
                        duration: 20000,
                        code: [value, value],
                    } as TInputHackGameParam;

                    DebugEventSend<TGameParams>(Receive.start, {
                        type: GameType.DigitDazzle,
                        iterations: 2,
                        config,
                    });
                },
                value: 1234,
                type: 'text',
            },
        ],
    },
    {
        label: 'Word Wiz',
        actions: [
            {
                label: 'Custom Difficulty',
                action: (value: number) => {

                    const config = {
                        duration: 20000,
                        length: value,
                    } as TLengthHackGameParam

                    DebugEventSend<TGameParams>(Receive.start, {
                        type: GameType.WordWiz,
                        iterations: 2,
                        config,
                    })
                },
                value: 4,
                min: 1,
                max: 12,
                type: 'slider',
            },
        ],
    },
    {
        label: 'Circle Sum',
        actions: [
            {
                label: 'Custom Difficulty',
                action: (value: number) => {

                    const config = {
                        duration: 10000,
                        length: value,
                    } as TLengthHackGameParam

                    DebugEventSend<TGameParams>(Receive.start, {
                        type: GameType.CircleSum,
                        iterations: 2,
                        config,
                    })
                },
                value: 4,
                min: 1,
                max: 12,
                type: 'slider',
            },
        ],
    },
    {
        label: 'Wave Match',
        actions: [
            {
                label: 'Custom Difficulty',
                action: (value: number) => {

                    const config = {
                        duration: value,
                    } as TLengthHackGameParam

                    DebugEventSend<TGameParams>(Receive.start, {
                        type: GameType.WaveMatch,
                        iterations: 2,
                        config,
                    })
                },
                value: 20000,
                min: 1000,
                max: 1200000,
                type: 'slider',
            },
        ],
    },
    {
        label: 'Mine Sweeper',
        actions: [
            {
                label: 'Custom Difficulty',
                action: (value: number) => {

                    const config = {
                        duration: value,
                        grid: 7,
                        target: 10,
                    } as TGridHackGameParam

                    DebugEventSend<TGameParams>(Receive.start, {
                        type: GameType.MineSweeper,
                        iterations: 2,
                        config,
                    })
                },
                value: 20000,
                min: 1000,
                max: 1200000,
                type: 'slider',
            },
        ],
    },
    {
        label: 'Print Lock',
        actions: [
            {
                label: 'Custom Difficulty',
                action: (value: number) => {

                    const config = {
                        duration: 60000,
                        grid: 5,
                        target: 10,
                    } as TGridHackGameParam

                    DebugEventSend<TGameParams>(Receive.start, {
                        type: GameType.PrintLock,
                        iterations: 2,
                        config,
                    })
                },
                value: 5,
                min: 3,
                max: 10,
                type: 'slider',
            },
        ],
    },
]

export default SendDebuggers