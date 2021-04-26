import ColorRGBA from "../generic/ColorRGBA.js";

/**
 * @typedef {import("../generic/ColorRGBA").default} ColorRGBA
 * */

class FieldDebug {
    /**
     * 
     * @param {string} title title to show for this debug field
     * @param {any} bgColor background color to show with this field
     * @param {any} outlineColor color for outline around this field
     */
    constructor(title, bgColor, outlineColor, life = 5) {
        /** @type {ColorRGBA} **/
        this.backgroundColor = null;
        if (bgColor) {
            this.backgroundColor = new ColorRGBA(bgColor);
        }
        /** @type {ColorRGBA} **/
        this.outlineColor = null;
        if (outlineColor) {
            this.outlineColor = new ColorRGBA(outlineColor);
        }
        this.title = typeof title == "string" ? title : "";
        this.startStepsToLive = life;
        this._stepsToLive = this.startStepsToLive;
    }
    get stepsToLive() {
        return this._stepsToLive;
    }
    set stepsToLive(value) {
        this._stepsToLive = value;
    }

    get htmlBackgroundColor() {
        return `rgba(${this.backgroundColor.r}, ${this.backgroundColor.g}, ${this.backgroundColor.b}, ${(this._stepsToLive+1)/this.startStepsToLive})`;
    }
    get htmlOutlineColor() {
        return `rgba(${this.outlineColor.r}, ${this.outlineColor.g}, ${this.outlineColor.b}, ${(this._stepsToLive + 1) / this.startStepsToLive})`;
    }
}

export default FieldDebug;