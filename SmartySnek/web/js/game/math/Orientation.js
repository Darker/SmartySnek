
/**
 * @typedef {import("./Vector2").default} Vector2
 * */

const DIRECTION_NAMES = ["LEFT", "DOWN", "RIGHT", "UP"];

class Orientation {
    constructor(dir = 0) {
       /**
        * Orientation index, vector is pointing towards the number in the circle
        *[0,0]
        *        3
        *     0     2
        *        1     ...[inf, inf]
        * */
        this.direction = dir;
    }
    /**
     * Returns orientation if it can be drawn between the two vectors. The orientation draws from vec1 to vec2
     * @param {Vector2} vec1
     * @param {Vector2} vec2
     */
    static fromVectors(vec1, vec2) {
        if (vec1.equals(vec2)) {
            return null;
        }
        else if (vec1.x == vec2.x) {
            return new Orientation(vec1.y > vec2.y ? 3 : 1);
        }
        else if (vec1.y == vec2.y) {
            return new Orientation(vec1.x > vec2.x ? 0 : 2);
        }
        return null;
    }

    clone() {
        return new Orientation(this.direction);
    }

    toString() {
        return "Orientation(" + this.direction + " = " + this.directionName(); + ")";
    }

    directionName() {
        return DIRECTION_NAMES[this.direction];
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

export default Orientation;