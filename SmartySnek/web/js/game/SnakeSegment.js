import UniqueID from "../util/UniqueID.js";
import Vector2 from "./math/Vector2.js";
import Orientation from "./math/Orientation.js";
import MapFieldContents from "./MapFieldContents.js";


const SEGMENT_ID = new UniqueID();

/**
 * @typedef {import("./Snake").default} Snake
 * */

class SnakeSegment extends MapFieldContents {
    /**
     * 
     * @param {Snake} snake
     * @param {number} index
     */
    constructor(snake, index) {
        super();
        this.snake = snake;
        this.index = index;
        this.id = "segment" + SEGMENT_ID.getID();
        this.position = new Vector2(0,0);
    }
    get next() {
        return this.isLast ? null : this.snake.segments[this.index + 1];
    }
    get isFirst() { return this.index == 0; }
    get isLast() { return this.index + 1 >= this.snake.segments.length; }
    get prev() {
        return this.isFirst ? null : this.snake.segments[this.index - 1];
    }
    get orientation() {
        if (this.isFirst) {
            return this.snake.orientation;
        }
        else {
            if (this.position.isDirectlyAdjacent(this.prev.position)) {
                return Orientation.fromVectors(this.position, this.prev.position);
            }
            else {
                // there is overflow to be handled
                return Orientation.fromVectors(this.position, this.prev.position).turnAround();
            }
        }
    }
    get uniqueID() {
        return this.id;
    }
    /**
     * Moves the segment and drags the rest behind
     * */
    move() {
        if (!this.isFirst) {
            throw new Error("Only snake head is allowed to move on its own.");
        }

        let oldPosition = new Vector2(0,0);
        oldPosition.position = this.position;
        //console.log("Moving by direction: " + this.orientation);
        this.position.move(this.orientation);
        this.moveInMap();
        // move body
        let node = this.next;
        while (node != null) {
            if (node.isLast && this.snake.unusedFood >= 1) {
                const newseg = new SnakeSegment(this.snake, node.index);
                ++node.index;
                this.snake.segments.splice(newseg.index, 0, newseg);
                newseg.position.position = oldPosition;
                newseg.moveInMap();
                this.snake.unusedFood--;
                node = null;
            }
            else {
                let tmp = new Vector2();
                tmp.position = node.position;

                node.position.position = oldPosition;
                node.moveInMap();

                oldPosition.position = tmp;
                node = node.next;
            }
        }

    }
    /**
     * Apply position to a map field
     * @private
     * */
    moveInMap() {
        const field = this.snake.map.getField(this.position.x, this.position.y);
        field.contents = this;
        this.position.position = field.position;
    }

    get isDangerous() { return true; }
    get damage() { return Infinity; }
    get isSnakeSegment() { return true; }
    get segmentOrientation() { return this.orientation; }
    get segmentType() {
        if (this.isFirst) {
            return "head";
        }
        else if (this.isLast) {
            return "tail";
        }
        else {
            return "body";
        }
    }

    /** start placing the snake segments behind the head */
    place() {
        // head must be placed from the oitside
        if (!this.isFirst) {
            this.position.position = this.prev.position;
            const orientation = this.prev.orientation.clone();
            // going the other way than the prev is moving to
            orientation.turnAround();
            this.position.move(orientation);
        }
        // place into map
        this.moveInMap();
        //console.log("Placed segment into: ", this.position.x, this.position.y)
        //console.log(this.next, this.snake.segments, this.index);
        if (this.next) {
            this.next.place();
        }
    }
}

export default SnakeSegment;