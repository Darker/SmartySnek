import SnakeController from "../SnakeController.js";

/**
 * @typedef {import("../GameStateInfo").default} GameStateInfo
 * */


class LucaBot extends SnakeController {
    constructor() {
        super();

    }
    get name() { return "Luca bot (web/js/game/bots/impls/LucaBot.js)"; }
    get description() { return "Your nice bot :)" }
    /**
     * 
     * @param {GameStateInfo} gameInfo
     */
    play(gameInfo) {
        console.log("Doing nothing.");
    }
}

export default LucaBot;