import EmptyMapFieldContents from "../EmptyMapFieldContents.js";

/**
 * @typedef {import("../GameMap").default} GameMap
 * @typedef {import("../Snake").default} Snake
 * @typedef {import("../MapFieldContents").default} MapFieldContents
 * */


class GameStateInfo {
    /**
     * 
     * @param {GameMap} map
     * @param {Snake} snake
     */
    constructor(map, snake) {
        /** @type {GameMap} **/
        this.map = map;
        /** @type {Snake} **/
        this.snake = snake;
        // chosen direction for the snake
        // -1 = right
        // +1 = left
        this.direction = 0;
    }

    goLeft() {
        this.direction = 1;
    }
    goRight() {
        this.direction = -1;
    }
    goStraight() {
        this.direction = 0;
    }

    get mapSize() {
        return this.map.size;
    }

    get snakeIsDead() {
        return this.snake.dead;
    }

    closestFood() {
        const food = this.map.findClosestFields(this.snake.head.position.x, this.snake.head.position.y, (i) => i.foodPoints > 0, 1);

        return food.length > 0 ? food[0] : null;
    }

    get snakeDirectionName() {
        return this.snake.orientation.directionName();
    }

    get snakePosition() {
        return this.snake.head.position;
    }

    get itemInFrontOfSnake() {
        return nullToEmpty(this.snake.getCollisionObject());
    }
    get itemLeftOfSnake() {
        return nullToEmpty(this.fieldLeftOfSnake.contents);
    }
    get itemRightOfSnake() {
        return nullToEmpty(this.fieldRightOfSnake.contents);
    }

    get fieldInFrontOfSnake() {
        return this.fieldAsideOfSnake(0);
    }
    get fieldLeftOfSnake() {
        return this.fieldAsideOfSnake(1);
    }
    get fieldRightOfSnake() {
        return this.fieldAsideOfSnake(-1);
    }
    fieldAsideOfSnake(direction) {
        // get snake head pos
        const headPos = this.snake.head.position.clone();
        const headDir = this.snake.orientation.clone();
        if(direction != 0)
          headDir.rotateBySteps(direction);
        headPos.move(headDir);
        const field = this.map.getField(headPos);
        //console.log(field);
        return field;
    }

    setFieldDebug(x, y, debugInfo) {
        this.map.getField(x, y).addDebug(debugInfo);
    }
}

/**
 * 
 * @param {MapFieldContents} contents
 * @returns {MapFieldContents}
 */
function nullToEmpty(contents) {
    return contents == null ? new EmptyMapFieldContents() : contents;
}

export default GameStateInfo;