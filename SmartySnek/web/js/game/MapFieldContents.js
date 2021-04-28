
/**
 * @typedef {import("./MapField").default} MapField
 * */



class MapFieldContents {

    constructor() {
        /** @type {MapField} **/
        this.currentField = null;
    }

    get uniqueID() { throw new Error("Must implement unique ID."); }
    get isDangerous() { return false; }
    get isFood() { return false; }
    get foodPoints() { return 0; }
    get damage() { return 0; }
    get isSnakeSegment() { return false; }
    get isEmpty() { return false; }
    /**
     * Called when this object is removed from game map.
     * */
    removedFromMap() {}

    /** @type {MapFieldType[]} **/
    static TYPE = [
        { name: "food", index: 1 },
        { name: "danger", index: 2 }
    ];
    static NAMED_TYPE = {
        food: MapFieldContents.TYPE[0],
        danger: MapFieldContents.TYPE[1]
    };
}

export default MapFieldContents;