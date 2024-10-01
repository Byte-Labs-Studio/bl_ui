import { GameType } from "@enums/gameTypes";


export default class GameController<TState> {

    private _state: TState = null;
    private _iteration: number = 0;

    get iteration() {
        return this._iteration;
    }

    get state() {
        return this._state;
    }

    constructor(gameType: typeof GameType) {

    }

    startGame() {

    }

    finishGame() {

    }
}