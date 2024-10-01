import { GameType } from "@enums/games";
import { TGameParams } from "@typings/config";

export class GameController<T> {
    /** The type of the game. From the GameTypes enum. */
    public type: GameType | null = $state(null);

    /** Whether the game is active or not.*/
    public active: boolean = $state(false);

    public config: T | null = $state(null);
    public iterations: number = $state(0);
    public iteration: number = $state(0);

    constructor(type: GameType, parameters: TGameParams) {
        this.type = type;
        this.config = parameters.config as T;
        this.iterations = parameters.iterations;
    }

    start() {

    }

    finish(success: boolean) {

    }
}