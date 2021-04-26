import SnakeController from "../SnakeController.js";

/**
 * @typedef {import("../GameStateInfo").default} GameStateInfo
 * */


class SweepBot extends SnakeController {
    constructor() {
        super();
        this.turnedRight = false;
        this.stepsWithoutAction = 0;

    }
    get name() { return "Sweep bot"; }
    get description() { return "Bot that sweeps map systematically line by line" }
    reset() {
        this.turnedRight = false;
        this.stepsWithoutAction = 0;
    }
    /**
     * 
     * @param {GameStateInfo} gameInfo
     */
    play(gameInfo) {
        // Turn back left if it turned right last turn
        if (this.turnedRight) {
            gameInfo.goLeft();
        }

        // Forget that it turned right
        this.turnedRight = false;

        // turn if enough steps passed without doing anything
        // OR if there is danger in front of snake
        if (this.stepsWithoutAction >= gameInfo.mapSize || gameInfo.itemInFrontOfSnake.isDangerous) {
            gameInfo.goRight();
            // Remember that it turned right, so that it can turn left next turn
            this.turnedRight = true;
            this.stepsWithoutAction = 0;
        }
        else {
            ++this.stepsWithoutAction;
        }
    }
}

export default SweepBot;