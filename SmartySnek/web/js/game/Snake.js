import SnakeSegment from "./SnakeSegment.js";
import Orientation from "./math/Orientation.js";

/**
 * @typedef {import("./GameMap").default} GameMap
 * */

class Snake {
    /**
     * 
     * @param {GameMap} map
     */
    constructor(map) {
        this.map = map;
        this.segments = [];


        // number of "food points" for the snake to grow from
        this.unusedFood = 0;

        this.dead = false;
        /**
         * Head orientation
         *     3
         *  0     2
         *     1
         * */

        this.orientation = new Orientation();
        this.resetSnake();
    }
    resetSnake() {
        this.segments.length = 0;
        for (let i = 0; i < 7; ++i) {
            this.segments.push(new SnakeSegment(this, i));
        }
        this.dead = false;
        this.unusedFood = 0;
    }

    placeSnake() {
        //this.head.position.position = this.map.randomLocation();
        //this.orientation.direction = Math.floor(Math.random() * 4);
        this.head.position.position = [5, 5];
        this.orientation.direction = 1

        this.head.place();
    }

    moveForward() {
        this.head.move();

    }
    turnLeft() {
        //const head = this.head;
        //this.head.orientation.rotateLeft();
        //if (this.head.orientation.direction == this.head.next.orientation.clone().turnAround().direction) {
        //    this.head.orientation.rotateRight();
        //    throw new Error("Cannot turn to face body!");
        //}
        this.turn(1);
    }
    turn(direction) {
        if (direction != 1 && direction != -1) {
            throw new Error("Snake::turn Direction must be 1 or -1");
        }
        const orientationNew = this.orientation.clone();
        orientationNew.rotateBySteps(direction + 2); // turn to the opposite of required direction
        if (orientationNew.direction == this.head.next.orientation.direction) {
            throw new Error("Cannot turn to face body!");
        }
        else {
            orientationNew.turnAround();
            this.head.orientation.direction = orientationNew.direction;
        }
    }

    /** check if considering current direction, the snake will collide with an object */
    getCollisionObject() {
        let newPosition = this.head.position.clone().move(this.orientation);
        const field = this.map.getField(newPosition);

        if (field.contents && (field.contents != this.tail || this.unusedFood >= 1)) {
            return field.contents;
        }
    }

    turnRight() {
        this.turn(-1);
        //const head = this.head;
        //this.head.orientation.rotateRight();
        //if (this.head.orientation.direction == this.head.next.orientation.clone().turnAround().direction) {
        //    this.head.orientation.rotateLeft();
        //    throw new Error("Cannot turn to face body!");
        //}
    }

    get head() { return this.segments.length > 0 ? this.segments[0] : null; }
    get tail() { return this.segments.length > 0 ? this.segments[this.segments.length - 1] : null; }
}

export default Snake;