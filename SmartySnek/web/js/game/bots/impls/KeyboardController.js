import SnakeController from "../SnakeController.js";

/**
 * @typedef {import("../GameStateInfo").default} GameStateInfo
 * */


class KeyboardController extends SnakeController {
    constructor() {
        super();
        this.direction = 0;
        if (window) {
            window.addEventListener("keydown", (event) => {
                if (event.keyCode == 37) {
                    this.direction = 1;
                }
                if (event.keyCode == 39) {
                    this.direction = -1;
                }
            });
            //window.addEventListener("keyup", (event) => {
            //    if (event.keyCode == 37 || event.keyCode == 39) {
            //        this.direction = 0;
            //    }
            //});
        }
        else {
            console.error("Window object required to allow KeyboardController!");
        }
    }
    get name() { return "Keyboard controller"; }
    get description() { return "Controls the snake via keyboard."; }

    reset() {
        this.direction = 0;
    }
    /**
     * 
     * @param {GameStateInfo} gameInfo
     */
    play(gameInfo) {
        if (this.direction == 1) {
            gameInfo.goLeft();
        }
        else if (this.direction == -1) {
            gameInfo.goRight();
        }
        this.direction = 0;
    }
}

export default KeyboardController;