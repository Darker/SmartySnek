import MapField from "./MapField.js";
import Vector2 from "./math/Vector2.js";
import ReviverRegistry from "../serialization/ReviverRegistry.js";

/**
 * @typedef {import("math/Orientation").default} Orientation
 * @typedef {import("../serialization/ISerializer").default} ISerializer
 * */

class GameMap {
    constructor(size = 15) {
        this.size = size;
        /** @type {MapField[]} **/
        this.map = [];

        for (let i = 0; i < size * size; ++i) {
            this.map.push(new MapField(new Vector2(i%size, Math.floor(i/size)), this));
        }
    }
    /**
     * 
     * @param {ISerializer} serializer
     */
    serializationTransfer(serializer) {
        serializer.transferField(this, "map");
    }

    getField(x, y) {
        const position = this.normalizePoint(x, y);
        const offset = position.y * this.size + position.x;
        const result = this.map[offset];
        if (!result) {
            throw new Error("Failed to retrieve point at " + new Vector2(x,y)+" -> " + position + " at this.map[" + offset + "]");
        }
        return result;
    }

    /**
     * Normalizes overflow of a point so that it is within the map
     * @param {number|Vector2} x
     * @param {number} y
     * @returns {Vector2}
     */
    normalizePoint(x, y) {
        if (x instanceof Vector2) {
            y = x.y;
            x = x.x;
        }

        // auto overflow
        if (x >= this.size) {
            x = (x % this.size);
        }
        else if (x < 0) {
            while (x < 0) {
                x += this.size;
            }
        }
        if (y >= this.size) {
            y = (y % this.size);
        }
        else if (y < 0) {
            while (y < 0) {
                y += this.size;
            }
        }
        return new Vector2(x, y);
    }

    /**
     * Clears everything from game map
     * */
    clear() {
        for (const field of this.map) {
            field.contents = null;
            field.debugContents.length = 0;
        }
    }

    randomLocation() {
        return new Vector2(Math.floor(Math.random() * this.size), Math.floor(Math.random() * this.size));
    }

    /**
     * Calculates vector between two positions using the shortest distance, even if that distance is through the edge of the map
     * @param {Vector2} position1
     * @param {Vector2} position2
     * @param {Orientation} overflowDirection
     * @returns {Vector2}
     * */
    getDirectionWithOverflow(position1, position2, overflowDirection) {
        // for overflown position, reverse the order of the vectors by moving the first one
        // by map size
        const moved1 = position1.clone().moveByVector(this.size * Math.abs(overflowDirection.vectorX), this.size * Math.abs(overflowDirection.vectorY));
        if (moved1.distanceSquared(position2) < position1.distanceSquared(position2)) {
            return new Vector2()
        }
    }

    /**
     * 
     * @param {function(MapField):boolean} counter
     */
    countItems(counter) {
        let count = 0;
        for (const field of this.map) {
            if (counter(field)) {
                count++;
            }
        }
        return count;
    }

    clearAllDebug() {
        for (const field of this.map) {
            field.debugContents.length = 0;
        }
    }

    /**
     * @param {number} x x pos where to start
     * @param {number} y y pos where to start
     * @param {function(MapField):boolean} fieldValidator
     * @param {number} maxItems max items to find
     */
    findClosestFields(x, y, fieldValidator, maxItems = Infinity) {
        const startField = this.getField(x, y);
        const visited = [startField];
        const max = this.size * this.size - 1;
        const result = [];
        for (let step = 0; step < max; ++step) {
            const next = this.getField(startField.position.spiralNeighbor(step));
            if (visited.includes(next) || visited.length > max) {
                throw new Error("Hit visited field at step " + step);
            }
            visited.push(next);
            if (fieldValidator(next)) {
                result.push(next);
                if (result.length > maxItems) {
                    break;
                }
            }
        }
        return result;
    }
}

ReviverRegistry.Register(GameMap, {
    factory: (params) => new GameMap(params.size),
    params: (map) => {
        return { size: map.size };
    }
});

export default GameMap;