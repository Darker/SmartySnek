import UniqueID from "../util/UniqueID.js";
import Vector2 from "./math/Vector2.js";
import MapFieldContents from "./MapFieldContents.js";
import ReviverRegistry from "../serialization/ReviverRegistry.js";

const FOOD_ID = new UniqueID();
class Food extends MapFieldContents {
    constructor() {
        super();
        this.id = "food" + FOOD_ID.getID();
        this.position = new Vector2(0, 0);
        this.type = "cricket";
    }
    serializationTransfer(serializer) {
        serializer.transferField(this, "id");
        serializer.transferField(this, "type");
    }
    get isDangerous() { return false; }
    get foodPoints() { return 1; }
    get isFood() { return true; }

    get uniqueID() {
        return this.id;
    }
}

ReviverRegistry.Register(Food);


export default Food;