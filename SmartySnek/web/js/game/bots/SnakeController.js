
/**
 * @typedef {import("./GameStateInfo").default} GameStateInfo
 * */

class SnakeController {
    constructor() {

    }
    get name() {
        return "noop controller";
    }
    get description() {
        return "does not do anything";
    }
    /** Should reset the bot to initial state */
    reset() {

    }
    /**
     * 
     * @param {GameStateInfo} gameInfo
     */
    play(gameInfo) {

    }
}

export default SnakeController;