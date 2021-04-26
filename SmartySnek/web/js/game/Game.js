import GameMap from "./GameMap.js";
import Snake from "./Snake.js";
import Food from "./Food.js";
import GameStateInfo from "./bots/GameStateInfo.js";

class Game {
    constructor() {
        this.map = new GameMap(16);
        this.snake = new Snake(this.map);
        this.controller = null;

        this.gameInfo = new GameStateInfo(this.map, this.snake);
    }

    controlSnake() {
        this.gameInfo.direction = 0;
        if (this.controller && !this.snake.dead) {
            this.controller.play(this.gameInfo);
            // apply rotation on snake
            if (this.gameInfo.direction == 1) {
                this.snake.turnLeft();
            }
            else if (this.gameInfo.direction == -1) {
                this.snake.turnRight();
            }
        }
    }

    // game step
    step() {
        const collision = this.snake.getCollisionObject();
        if (collision) {
            if (collision.isFood) {
                this.snake.unusedFood += collision.foodPoints;
                collision.currentField.contents = null;
            }
            else {
                this.snake.dead = true;
            }
        }
        if (!this.snake.dead) {
            this.snake.moveForward();
        }
        else {
            console.error("SNEK DED!!!");
        }

        // place random food
        if (Math.random() > 0.8) {
            if (this.map.countItems((i) => i.foodPoints > 0) < 4) {
                // random tile
                const tile = this.map.getField(this.map.randomLocation());
                if (tile.isEmpty) {
                    const food = new Food();
                    food.position.position = tile.position;
                    tile.contents = food;
                }
            }
        }

        // handle field steps
        for (const field of this.map.map) {
            field.step();
        }
    }
}

export default Game;