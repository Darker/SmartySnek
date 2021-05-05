import GameMath from "./GameMath.js";
import ReviverRegistry from "../../serialization/ReviverRegistry.js";

/**
 * @typedef {import("./Vector2").default} Vector2
 * */

const DIRECTION_NAMES = ["LEFT", "DOWN", "RIGHT", "UP"];
const DIRECTION_PICTOGRAMS = ["[<-]", "[V]", "[^]", "[->]"];

class Orientation {
    constructor(dir = 0) {
       /**
        * Orientation index, vector is pointing towards the number in the circle
        *[0,0]
        *        3
        *     0     2
        *        1     ...[inf, inf]
        *  @type {number}
        * */
        this.direction = dir;
    }

    serializationTransfer(serializer) {
        serializer.transferField(this, "direction");
    }

    /**
     * Returns orientation if it can be drawn between the two vectors. The orientation draws from vec1 to vec2
     * @param {Vector2} vec1
     * @param {Vector2} vec2
     * @param {number} overflowSize if set, an overflow will be applied and the shortest vector will be chosen
     */
    static fromVectors(vec1, vec2, overflowSize = NaN) {
        let direction = this.directionFromVectors(vec1, vec2, overflowSize);
        return direction >= 0 ? new Orientation(direction) : null;
    }

    /**
     * Returns orientation if it can be drawn between the two vectors. The orientation draws from vec1 to vec2
     * @param {Vector2} vec1
     * @param {Vector2} vec2
     * @param {number} overflowSize if set, an overflow will be applied and the shortest vector will be chosen
     */
    static directionFromVectors(vec1, vec2, overflowSize = NaN) {
        let direction = -1;
        if (!vec1.equals(vec2)) {
            const overflowUsed = !Number.isNaN(overflowSize);

            let vec1x = GameMath.normalizeCoordOverflow(vec1.x, overflowSize);
            let vec1y = GameMath.normalizeCoordOverflow(vec1.y, overflowSize);
            let vec2x = GameMath.normalizeCoordOverflow(vec2.x, overflowSize);
            let vec2y = GameMath.normalizeCoordOverflow(vec2.y, overflowSize);
            
            if (vec1x == vec2x) {
                direction = vec1y > vec2y ? 3 : 1;
                if (overflowUsed && Math.abs(vec1y-vec2y)>overflowSize/2) {
                    // reverse direction if the shortest path is through the overflow
                    direction = direction == 3 ? 1 : 3;
                }
            }
            else if (vec1y == vec2y) {
                direction = vec1x > vec2x ? 0 : 2;
                if (overflowUsed && Math.abs(vec1x - vec2x) > overflowSize / 2) {
                    // reverse direction if the shortest path is through the overflow
                    direction = direction == 0 ? 2 : 0;
                }
            }
        }
        return direction;
    }

    clone() {
        return new Orientation(this.direction);
    }

    toString() {
        return "Orientation(" + this.direction + " = " + this.directionName(); + ")";
    }
    /**
     * Creates new orientation that will turn from this orientation to the target orientation
     * @param {Orientation} otherDir
     */
    dirToDir(otherDir) {
        if (otherDir.direction == this.directionToLeft) {
            return new Orientation(1);
        }
        else if (otherDir.direction == this.directionToRight) {
            return new Orientation(3);
        }
        else {
            return new Orientation(2);
        }
    }

    get directionToLeft() {
        return this.direction < 3 ? this.direction + 1 : 0;
    }
    get directionToRight() {
        return this.direction > 0 ? this.direction - 1 : 3;
    }

    directionName() {
        return DIRECTION_NAMES[this.direction];
    }
    directionPictogram() {
        return DIRECTION_PICTOGRAMS[this.direction];
    }
    /**
     * 
     * @param {Orientation} otherDirection
     */
    equals(otherDirection) {
        if (typeof otherDirection == "number") {
            return this.direction == otherDirection;
        }
        else {
            return this.direction == otherDirection.direction;
        }
    }

    rotateLeft() {
        ++this.direction;
        this.normalize();
        return this;
    }
    rotateRight() {
        --this.direction;
        this.normalize();
        return this;
    }
    /**
     * Rotate the orientation by given number of steps.
     * @param {number} steps positive number = counter clockwise rotation, negative number rotates clockwise
     */
    rotateBySteps(steps) {
        this.direction += steps;
        this.normalize();
        return this;
    }
    turnAround() {
        this.direction += 2;
        this.normalize();
        return this;
    }
    get isHorizontal() {
        return this.direction == 0 || this.direction == 2;
    }
    get isVertical() {
        return this.direction == 1 || this.direction == 3;
    }

    normalize() {
        if (this.direction > 3) {
            this.direction = this.direction % 4;
        }
        else if(this.direction < 0) {
            this.direction = 4 + (this.direction) % 4;
            if (this.direction == 4) {
                this.direction = 0;
            }
        }
        if (this.direction < 0 || this.direction > 3) {
            throw new Error("Normalize failed.");
        }
    }

    
    get vectorX() {
        return this.direction % 2 == 0 ? this.direction - 1 : 0;
    }
    get vectorY() {
        return this.direction % 2 != 0 ? 2 - this.direction : 0;
    }
}
ReviverRegistry.Register(Orientation, { factory: () => new Orientation() });
export default Orientation;