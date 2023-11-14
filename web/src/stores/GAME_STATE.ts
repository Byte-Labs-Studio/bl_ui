import { GameType, IGameParams, IGameState } from '@typings/gameState';
import { SendEvent } from '@utils/eventsHandlers';
import { Writable, writable } from 'svelte/store';

export const store = () => {
    const GAME_STATE: Writable<Partial<IGameState>> = writable<
        Partial<IGameState>
    >({
        active: false,
    });

    const methods = {
        start: (data: IGameParams) => {
            const { type, iterations, difficulty } = data;
            GAME_STATE.update(_ => {
                const active = true;
                return {
                    active,
                    type,
                    iterations,
                    difficulty,
                };
            });

            const event: string = `${type}:start`;
            SendEvent(event);
        },

        finish: (success: boolean = false) => {
            GAME_STATE.update(store => {
                const event: string = `${store.type}:finish`;
                SendEvent(event, success);
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
