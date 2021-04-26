import SnakeController from "../SnakeController.js";
import FieldDebug from "../../debug/FieldDebug.js";
import Vector2 from "../../math/Vector2.js";
import Orientation from "../../math/Orientation.js";

/**
 * @typedef {import("../GameStateInfo").default} GameStateInfo
 * */

class AStarPathStep {
    /**
     * 
     * @param {Vector2} point
     * @param {Vector2} prevPoint
     */
    constructor(point, prevPoint) {
        this.point = point;
        this.direction = Orientation.fromVectors(prevPoint, point);
    }
    /**
     * Returns true, if snake can get from my point to given point
     * @param {Vector2} point
     */
    isSafelyAdjacent(point) {
        // only directly adjacent (non diagonal) fields are accepted
        if (this.point.isDirectlyAdjacent(point)) {
            const dirTo = Orientation.fromVectors(this.point, point);
            // If the reverse of the direction to new point is
            // the direction of current point, then it points back and is not safe
            dirTo.turnAround();
            if (!dirTo.equals(this.direction)) {
                return true;
            }
        }
        return false;
    }
}

class AStarPath {
    constructor() {
        /** @type {AStarPathStep[]} **/
        this.steps = [];
    }
    /**
     * 
     * @param {AStarPathStep} step
     */
    addStep(step) {
        this.steps.push(step);
    }
    get last() {
        if (this.steps.length > 0) {
            return this.steps[this.steps.length - 1];
        }
        else {
            return null;
        }
    }
    fork() {
        const newPath = new AStarPath();
        newPath.steps.push(...this.steps);
        return newPath;
    }
    /**
     * Returns true if snake 
     * @param {Vector2} point
     */
    isSafelyAdjacent(point) {
        return this.last.isSafelyAdjacent(point);
    }
}

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

        const paths = [];
        // put possible fields snake can go through as start paths

    }
}

export default AStarBot;