import { DebugItem } from '@typings/events'
import { toggleVisible } from './visibility'
import { Receive, Send } from '@enums/events'
import { DebugEventSend, SendEvent } from '@utils/eventsHandlers'
import type { TGameParams, TGameState, TKeyGameParam, TDifficultyParam, TNodeHackGameParam, TLevelHackGameParam, TLengthHackGameParam } from '@typings/gameState'
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
                        iterations: 10,
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
                        iterations: 10,
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
                        numberOfKeys: 2,
                    } as TKeyGameParam

                    DebugEventSend<TGameParams>(Receive.start, {
                        type: GameType.KeyCircle,
                        iterations: 1,
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
                        iterations: 1,
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
                        numberOfKeys: 10,
                    } as TKeyGameParam

                    DebugEventSend<TGameParams>(Receive.start, {
                        type: GameType.NumberSlide,
                        iterations: 1,
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
                        numberOfKeys: 10,
                    } as TKeyGameParam

                    DebugEventSend<TGameParams>(Receive.start, {
                        type: GameType.RapidLines,
                        iterations: 1,
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
                        numberOfKeys: 10,
                    } as TKeyGameParam

                    DebugEventSend<TGameParams>(Receive.start, {
                        type: GameType.CircleShake,
                        iterations: 1,
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
        label: 'Number Crack',
        actions: [
            {
                label: 'Custom Difficulty',
                action: (value: number) => {

                    const config = {
                        duration: 20000,
                        length: value,
                    } as TLengthHackGameParam

                    DebugEventSend<TGameParams>(Receive.start, {
                        type: GameType.NumberCrack,
                        iterations: 2,
                        config,
                    })
                },
                value: 4,
                min: 4,
                max: 8,
                type: 'slider',
            },
        ],
    },
]

export default SendDebuggers