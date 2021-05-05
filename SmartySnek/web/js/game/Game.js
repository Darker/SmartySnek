import GameMap from "./GameMap.js";
import Snake from "./Snake.js";
import Food from "./Food.js";
import GameStateInfo from "./bots/GameStateInfo.js";
import ReviverRegistry from "../serialization/ReviverRegistry.js";
import SimpleRandom from "./math/SimpleRandom.js";

class Game {
    constructor() {
        this.map = new GameMap(10);
        this.snake = new Snake(this.map);
        this.controller = null;

        this.gameInfo = new GameStateInfo(this.map, this.snake);
        this.random = new SimpleRandom();
    }

    serializationTransfer(serializer) {
        serializer.transferField(this, "map");
        serializer.transferField(this, "snake");
        //serializer.transferField(this, "gameInfo");
        serializer.transferField(this.gameInfo, "direction");
        serializer.transferField(this, "controller");
        serializer.transferField(this.random, "seed");
        serializer.transferField(this.random, "initialSeed");

        if (serializer.isReading()) {
            this.gameInfo.map = this.map;
            this.gameInfo.snake = this.snake;
        }
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
    reset() {
        this.snake.unusedFood = 0;
        this.snake.dead = false;
        this.snake.resetSnake();
        if(this.controller)
            this.controller.reset();
        this.map.clear();
        this.snake.placeSnake();
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
                const tile = this.map.map[Math.floor(this.random.next() * values.length)];
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
    randomTest() {
        const values = new Uint32Array(this.map.size ** 2);
        let maxValue = 0;
        let minValue = Infinity;
        for (let i = 0; i < 3000000; ++i) {
            let fieldIndex = Math.max(0, Math.min(values.length - 1, Math.floor(this.random.next()*values.length)));
            if (fieldIndex >= values.length || fieldIndex < 0) {
                throw new Error("Invalid index");
            }
            values[fieldIndex]++;
        }
        for (let i = 0; i < values.length; ++i) {
            if (values[i] > maxValue) {
                maxValue = values[i];
            }
            else if (values[i] < minValue) {
                minValue = values[i];
            }
            
        }
        //const maxRelativeValue = maxValue - minValue;

        for (let i = 0; i < values.length; ++i) {
            //const intensity = ((values[i] - minValue) / maxRelativeValue)*255;
            const intensity = ((values[i]) / maxValue) * 255;

            this.map.map[i].addDebug(values[i] + "", [intensity, 0, 0], null, 100);
        }
    }
}

ReviverRegistry.Register(Game, {
    factory: () => new Game()
});

export default Game;