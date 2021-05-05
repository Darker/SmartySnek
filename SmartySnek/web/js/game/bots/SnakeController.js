import ReviverRegistry from "../../serialization/ReviverRegistry.js";

/**
 * @typedef {import("./GameStateInfo").default} GameStateInfo
 * */

class SnakeController {
    constructor() {
        // auto serialization registering
        if (this.constructor != SnakeController) {
            if (!ReviverRegistry.Registered(this.constructor)) {
                ReviverRegistry.Register(this.constructor);
            }
        }
    }
    get name() {
        return "noop controller";
    }
    get description() {
        return "does not do anything";
    }
    serializationTransfer(serializer) {
        serializer.transferAll(this);
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

ReviverRegistry.Register(SnakeController);

export default SnakeController;