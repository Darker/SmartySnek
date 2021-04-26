﻿/**
 * @typedef {import("./MapFieldContents").default} MapFieldContents
 * @typedef {import("./math/Vector2").default} Vector2
 * @typedef {import("./GameMap").default} GameMap
 * @typedef {import("./debug/FieldDebug").default} FieldDebug
 * */

class MapField {
    /**
     * 
     * @param {Vector2} position
     * @param {GameMap} map
     */
    constructor(position, map) {
        this.position = position;
        this.map = map;
        /** @type {MapFieldContents} **/
        this._contents = null;
        /** @type {FieldDebug[]} **/
        this._debugContents = [];
    }

    /**
     * 
     * @param {FieldDebug} debugInfo
     */
    addDebug(debugInfo) {
        this._debugContents.push(debugInfo);
    }

    step() {
        // remove debug contents if necessary
        for (let i = 0, l = this._debugContents.length; i < l; ++i) {
            const item = this._debugContents[i];
            item.stepsToLive--;
            if (item.stepsToLive == 0) {
                this._debugContents.splice(i, 1);
                --i; --l;
            }
        }
    }

    get x() {
        return this.position.x;
    }
    get y() {
        return this.position.y;
    }

    get debugContents() {
        return this._debugContents ? this._debugContents : [];
    }

    /** @type {MapFieldContents} **/
    get contents() { return this._contents; }
    set contents(value) {
        if (value == null) {
            if (this.contents) {
                //console.log("[MAP] " + this.position + " Removing object: " + this.contents.uniqueID);
                this.contents.currentField = null;
            }
        }
        else {
            // discard old contents
            if (this.contents) {
                //console.log("[MAP] " + this.position + " Object " + value.uniqueID + " was overriden.");
                this.contents = null;
            }
            if (value.currentField != null) {
                //console.log("[MAP] " + this.position + " Moving object: " + value.uniqueID + " from " + value.currentField.position);
                value.currentField.contents = null;
            }
            else {
                //console.log("[MAP] " + this.position + " Adding object: " + value.uniqueID);
            }
            value.currentField = this;
            
        }
        this._contents = value;
    }

    get isEmpty() { return this.contents == null || this.contents.isEmpty; }
    get damage() { return this.isEmpty ? 0 : this.contents.damage; }
    get foodPoints() { return this.isEmpty ? 0 : this.contents.foodPoints; }
    get contentsID() { return this.isEmpty ? "" : this.contents.uniqueID; }
    get isSnakeSegment() { return this.isEmpty ? false : this.contents.isSnakeSegment; }
}

export default MapField;