import { Send } from '@enums/events';
import { TGameParams, TGameState } from '@typings/gameState';
import { SendEvent } from '@utils/eventsHandlers';
import { get, Writable, writable } from 'svelte/store';

export const store = () => {
    const GAME_STATE: Writable<Partial<TGameState>> = writable<
        Partial<TGameState>
    >({
        active: false,
        sessionId: null,
    });

    const methods = {
        start: (data: TGameParams) => {
            let { type, iterations, config } = data;

            iterations = iterations || 1;

            GAME_STATE.update(_ => {
                const active = true;
                return {
                    active,
                    type,
                    iterations,
                    config,
                    sessionId: crypto.randomUUID(),
                };
            });
        },

        isCurrentSession: (sessionId: string) => {
            const { sessionId: currentSessionId } = get(GAME_STATE);
            console.log('CHECKING current session id', currentSessionId, sessionId, sessionId === currentSessionId)
            if (sessionId === undefined) return false;
            
            return sessionId === currentSessionId;
        },

        finish: (success: boolean = false, sessionId: string = null) => {
            const { sessionId: currentSessionId } = get(GAME_STATE);

            console.log('current session id', currentSessionId, sessionId !== currentSessionId, sessionId)
            if ((sessionId !== currentSessionId) && sessionId) return;

            GAME_STATE.update(store => {
                SendEvent(Send.finish, success);
                const active = false;
                return {
                    active,
                    sessionId: null,
                };
            });
        },
    };

    return {
        ...GAME_STATE,
        ...methods,
    };
};

export default store();
