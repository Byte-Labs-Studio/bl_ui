import {GameController} from "@controllers/gameController.svelte";
import { TCircleProgressGameState } from "./types";
import { GameType } from "@enums/games";
import { TGameParams } from "@typings/config";

export default class CircleProgressState<T> extends GameController<T>  implements TCircleProgressGameState {
    target = $state({
        rotation: 0,
        size: 0,
    })
    key: string = $state('');

    duration: number = $state(0);

    constructor(parameters: TGameParams) {
        super(GameType.CircleProgress, parameters);
    }

}