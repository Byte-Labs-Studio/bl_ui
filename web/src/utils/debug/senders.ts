import { DebugItem } from '@typings/events'
import { toggleVisible } from './visibility'
import { Receive, Send } from '@enums/events'
import { DebugEventSend, SendEvent } from '@utils/eventsHandlers'
import { GameType, IGameParams } from '@typings/gameState'

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
                action: (value: number) =>
                    DebugEventSend<IGameParams>(Receive.start, {
                        type: GameType.CircleProgress,
                        iterations: 2,
                        difficulty: value,
                    }),
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
                action: (value: number) =>
                    DebugEventSend<IGameParams>(Receive.start, {
                        type: GameType.Progress,
                        iterations: 2,
                        difficulty: value,
                    }),
                value: 50,
                type: 'slider',
            },
        ],
    },
]

export default SendDebuggers
