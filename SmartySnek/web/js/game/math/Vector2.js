﻿
/**
 * @typedef {import("./Orientation").default} Orientation
 * */

class Vector2 {
    /**
     * 
     * @param {number} x
     * @param {number} y
     */
    constructor(x = 0, y = 0) {
        if (x instanceof Vector2) {
            y = x.y;
            x = x.x;
        }
        else if (x instanceof Array && x.length >= 2) {
            y = x[0];
            x = x[1];
        }

        this._position = new Int32Array([x, y]);

        this.overflowEnabled = false;
        this.overflowValue = Infinity;
    }
    get x() { return this._position[0]; }
    get y() { return this._position[1]; }
    set x(value) { return this._position[0] = value; }
    set y(value) { return this._position[1] = value; }

    get position() {
        return this;
    }
    set position(value) {
        if (value instanceof Uint32Array) {
            this.x = value[0];
            this.y = value[1];
        }
        else if (value instanceof Vector2) {
            this.x = value.x;
            this.y = value.y;
        }
        else if (value instanceof Array && typeof value[0] == "number") {
            this.x = value[0];
            this.y = value[1];
        }
        else {
            throw new TypeError("Cannot convert to Vector2");
        }
    }
    /**
     * 
     * @param {Vector2} vector
     */
    equals(vector) {
        return vector.x == this.x && vector.y == this.y;
    }
    //// rotate by orientation relative to default around [0,0]
    //rotate(orientation) {

    //}
    /**
     * Move in the direction described by orientation
     * @param {Orientation} orientation
     */
    move(orientation) {
        this.x += orientation.vectorX;
        this.y += orientation.vectorY;
        return this;
    }

    moveByVector(x, y) {
        if (x instanceof Vector2) {
            y = x.y;
            x = x.x;
        }
        this.x += x;
        this.y += y;
        return this;
    }

    static fromPoints(x1, y1, x2, y2) {
        if (x1 instanceof Vector2) {
            y1 = x1.y;
            x1 = x1.x;
        }
        if (x2 instanceof Vector2) {
            y2 = x2.y;
            x2 = x2.x;
        }
        return new Vector2(x2 - x1, y2 - y1);
    }

    /**
     * Returns if sides of the two points touch
     * @param {number|Vector2} x
     * @param {number} y
     */
    isDirectlyAdjacent(x, y) {
        if (x instanceof Vector2) {
            y = x.y;
            x = x.x;
        }
        return (y == this.y && Math.abs(this.x - x) == 1) || (x == this.x && Math.abs(this.y - y) == 1);
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    distanceSquared(x, y) {
        if (x instanceof Vector2) {
            y = x.y;
            x = x.x;
        }
        return (this.x - x) ** 2 + (this.y - y) ** 2;
    }

    distance(x, y) {
        return Math.sqrt(this.distanceSquared(x, y));
    }

    *adjacentFields() {
        yield new Vector2(this.x - 1, this.y);
        yield new Vector2(this.x, this.y + 1);
        yield new Vector2(this.x + 1, this.y);
        yield new Vector2(this.x, this.y - 1);
    }

    /**
     * Returns neighbor on a spiral extending from this point, zero is the first neighbor which is above this point
     * @param {number} spiralSteps
     */
    spiralNeighbor(spiralSteps) {
        if (spiralSteps < 0) {
            throw new Error("Vector2::spiralNeighbor requires positive integer.");
        }
        const pos = spiral(spiralSteps);
        return new Vector2(this.x + pos[0], this.y + pos[1]);
    }

    toString() {
        return "Vector2[" + this.x + ", " + this.y + "]";
    }
}


// https://stackoverflow.com/a/19287714/607407
function spiral(n) {
    // given n an index in the squared spiral
    // p the sum of point in inner square
    // a the position on the current square
    // n = p + a

    var r = Math.floor((Math.sqrt(n + 1) - 1) / 2) + 1;

    // compute radius : inverse arithmetic sum of 8+16+24+...=
    var p = (8 * r * (r - 1)) / 2;
    // compute total point on radius -1 : arithmetic sum of 8+16+24+...

    var en = r * 2;
    // points by face

    var a = (1 + n - p) % (r * 8);
    // compute de position and shift it so the first is (-r,-r) but (-r+1,-r)
    // so square can connect

    var pos = [0, 0, r];
    switch (Math.floor(a / (r * 2))) {
        // find the face : 0 top, 1 right, 2, bottom, 3 left
        case 0:
            {
                pos[0] = a - r;
                pos[1] = -r;
            }
            break;
        case 1:
            {
                pos[0] = r;
                pos[1] = (a % en) - r;

            }
            break;
        case 2:
            {
                pos[0] = r - (a % en);
                pos[1] = r;
            }
            break;
        case 3:
            {
                pos[0] = -r;
                pos[1] = r - (a % en);
            }
            break;
    }
    return pos;
}


export default Vector2;