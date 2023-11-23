import { Receive } from "@enums/events"
import { DebugEventCallback } from "@typings/events"
import { ReceiveEvent } from "./eventsHandlers"
import { IGameParams } from "@typings/gameState"
import GAME_STATE from "@stores/GAME_STATE"


// This is a list of events that will always be listened to. Ignore the type
const AlwaysListened: DebugEventCallback[] = [
    {
        action: Receive.visible,
        handler: (data: string) => {
        }
    },
    {
        action: Receive.start,
        handler: (data: IGameParams) => {
            GAME_STATE.start(data)
        }
    }
]

export default AlwaysListened



export function InitialiseListen() {
    for (const debug of AlwaysListened) {
        ReceiveEvent(debug.action, debug.handler);
    }
}