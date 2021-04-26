import SnakeController from "../SnakeController.js";
import FieldDebug from "../../debug/FieldDebug.js";

/**
 * @typedef {import("../GameStateInfo").default} GameStateInfo
 * */


class AStarBot extends SnakeController {
    constructor() {
        super();
        this.foodLocation = null;
    }
    get name() { return "Food seeker"; }
    get description() { return "Follows food, tries to avoid obstacles, very dumb."; }

    reset() {
        this.direction = 0;
    }
    /**
     * 
     * @param {GameStateInfo} gameInfo
     */
    play(gameInfo) {
        // find closest food
        const foodField = gameInfo.closestFood();
        let directionToGo = "";
        // if food exists on map
        if (foodField) {
            // if food is above snake and snake is not going up
            if (foodField.y < gameInfo.snakePosition.y && gameInfo.snakeDirectionName != "UP") {
                // if snake is going right now, turning left will orient it up
                if (gameInfo.snakeDirectionName == "RIGHT") {
                    directionToGo = "LEFT";
                }
                // any other case just turn right
                else {
                    directionToGo = "RIGHT";
                }
            }
            // food is on the right in the map
            else if (foodField.x > gameInfo.snakePosition.x && gameInfo.snakeDirectionName != "RIGHT") {
                if (gameInfo.snakeDirectionName == "DOWN") {
                    directionToGo = "LEFT";
                }
                else {
                    directionToGo = "RIGHT";
                }
            }
            // food is on the left
            else if (foodField.x < gameInfo.snakePosition.x && gameInfo.snakeDirectionName != "LEFT") {
                if (gameInfo.snakeDirectionName == "UP") {
                    directionToGo = "LEFT";
                }
                else {
                    directionToGo = "RIGHT";
                }
            }
            // if food is below snake and snake is not going down
            else if (foodField.y > gameInfo.snakePosition.y && gameInfo.snakeDirectionName != "DOWN") {
                // if snake is going right now, turning left will orient it up
                if (gameInfo.snakeDirectionName == "LEFT") {
                    directionToGo = "LEFT";
                }
                // any other case just turn right
                else {
                    directionToGo = "RIGHT";
                }
            }
        }

        // Avoiding danger
        if (gameInfo.itemInFrontOfSnake.isDangerous) {
            // danger in front, what about left?
            if (gameInfo.itemLeftOfSnake.isDangerous) {
                // left dangerous, only chance is to go right
                directionToGo = "RIGHT";
            }
            else {
                // left was not dangerous, go left
                directionToGo = "LEFT";
            }
        }

        if (directionToGo == "RIGHT") {
            if (!gameInfo.itemRightOfSnake.isDangerous) {
                gameInfo.goRight();
            }
            else {
                gameInfo.fieldRightOfSnake.addDebug(new FieldDebug("Danger!", [255, 0, 0, 255], null, 12));
            }
        }
        if (directionToGo == "LEFT") {
            if (!gameInfo.itemLeftOfSnake.isDangerous) {
                gameInfo.goLeft();
            }
            else {
                gameInfo.fieldRightOfSnake.addDebug(new FieldDebug("Danger!", [255, 0, 0, 255], null, 12));
            }
        }
    }
}

export default AStarBot;