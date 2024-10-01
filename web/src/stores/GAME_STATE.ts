import { Send } from '@enums/events';
import { TGameParams, TGameState } from '@typings/gameState';
import { SendEvent } from '@utils/eventsHandlers';
import { Writable, writable } from 'svelte/store';

export const store = () => {
    const GAME_STATE: Writable<Partial<TGameState>> = writable<
        Partial<TGameState>
    >({
        active: false,
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
                };
            });
        },

        finish: (success: boolean = false) => {
            GAME_STATE.update(store => {
                SendEvent(Send.finish, success);
                const active = false;
                return {
                    active,
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
