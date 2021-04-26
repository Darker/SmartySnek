import SnakeController from "../SnakeController.js";

/**
 * @typedef {import("../GameStateInfo").default} GameStateInfo
 * */


class TurnRightBot extends SnakeController {
    constructor() {
        super();
        this.turnedRight = false;

        this.stepsWithoutAction = 0;

    }
    get name() { return "Turn right bot"; }
    get description() { return "Bot that only goes right and avoids dangers"; }
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
            this.stepsWithoutAction = 0;
            // Forget that it turned right
            this.turnedRight = false;
        }
        // May turn but only if there is no food in front of snake
        else if (!gameInfo.itemInFrontOfSnake.isFood) {
            // If some food is right of the snake
            // OR whatever is in front of snake is danger
            // OR it slithered across the entire map without turning
            // then turn right
            if (gameInfo.itemRightOfSnake.isFood || gameInfo.itemInFrontOfSnake.isDangerous || this.stepsWithoutAction>=gameInfo.mapSize) {
                gameInfo.goRight();
                // Remember that it turned right, so that it can turn left next turn
                this.turnedRight = true;
                //! Steps without action will increase and force turn right eventually
                this.stepsWithoutAction = 0;
            }
        }

        ++this.stepsWithoutAction;
    }
}

export default TurnRightBot;