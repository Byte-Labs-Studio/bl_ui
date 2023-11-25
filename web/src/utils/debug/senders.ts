import { DebugItem } from '@typings/events'
import { toggleVisible } from './visibility'
import { Receive, Send } from '@enums/events'
import { DebugEventSend, SendEvent } from '@utils/eventsHandlers'
import { IGameParams, IGameState, KeyGameParam, DifficultyParam, KeyGameParam, DifficultyParam } from '@typings/gameState'
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
                    } as DifficultyParam

                    DebugEventSend<IGameParams>(Receive.start, {
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
                    } as DifficultyParam

                    DebugEventSend<IGameParams>(Receive.start, {
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
                    } as KeyGameParam

                    DebugEventSend<IGameParams>(Receive.start, {
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
                    } as DifficultyParam

                    DebugEventSend<IGameParams>(Receive.start, {
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
                    } as KeyGameParam

                    DebugEventSend<IGameParams>(Receive.start, {
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
                    } as KeyGameParam

                    DebugEventSend<IGameParams>(Receive.start, {
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
]

export default SendDebuggers
