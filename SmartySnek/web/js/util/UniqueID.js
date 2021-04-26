class UniqueID {
    constructor() {
        this.__id = 0;
    }
    getID() { return ++this.__id;}
}

export default UniqueID;