import MapFieldContents from "./MapFieldContents.js";
class EmptyMapFieldContents extends MapFieldContents {
    constructor() {
        super();

    }
    get isEmpty() { return true; }
    get uniqueID() { return "empty"; }
    toString() { return "empty field"; }
}

export default EmptyMapFieldContents;