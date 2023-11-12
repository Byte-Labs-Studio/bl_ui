import { Send } from "@enums/events"
import { DebugEventCallback } from "@typings/events"
import { DebugEventReceive } from "@utils/eventsHandlers"

/**
 * These Receivers will emulate what the client receives from the UI.
 * The purpose of this is to test the UI without having to run the client.
 * You are supposed to pretend to process the data you receive here and return.
 */
const ReceiveDebuggers: DebugEventCallback[] = [
    {
        action: Send.close,
        handler: () => {
            console.log('closed')
        },
    },
    {
        action: 'debug',
        handler: (data: string) => {
            const init = 'Emulates an NUICallback times. Process the data here.'

            if (typeof data !== 'string') {
                return `${init} \n The data is not a string.`
            }

            const reverse = data.split('').reverse().join('')

            const message = `${init} \n The reverse of %c${data} %cis %c${reverse}`

            return message
        },
    },
]

export default ReceiveDebuggers

/**
 * Initialise the debug receivers
 */
export function InitialiseDebugReceivers(): void {
    for (const debug of ReceiveDebuggers) {
        DebugEventReceive(debug.action, debug.handler)
    }
}
