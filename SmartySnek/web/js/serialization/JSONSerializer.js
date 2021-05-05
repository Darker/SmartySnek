import ISerializer from "./ISerializer.js";
import ReviverRegistry from "./ReviverRegistry.js";

/**
const ser1 = new JSONSerializer(false);
const serialized = ser1.transferField(map);
const ser2 = new JSONSerializer(true);
ser2.data = serialized;
const deserialized = ser2.transferField();
 * */

/**
 * @typedef {Object} JSONEntry - entry describing serialized value in JSON
 * @property {number} type
 * @property {{[name:string]:JSONEntry} | string | number | boolean | []} value
 * @property {{name:string}} params
 */


class JSONObjectRefference extends ISerializer.IObjectRefference {
    /**
     * @param {number} id
     * */
    constructor(id) {
        super();
        this.id = id;
        this._object = null;
        this._entry = null;
        /** @type {{fieldName: string, owner: Object}[]} **/
        this.usages = [];
    }
}

class JSONSerializer extends ISerializer {
    /**
     * @param {boolean} reading
     * @param {JSONSerializer} parentSerializer
     * @param {{}} serializationRoot
     */
    constructor(reading, parentSerializer = null, serializationRoot = null) {
        super();
        this._reading = reading;
        this.parent = parentSerializer;
        this.main = parentSerializer ? null : {
            data: {}
        };
        this.serializationRoot = serializationRoot;
    }
    /** @type {JSONEntry} **/
    get data() {
        return this.main ? this.main.data : this.serializationRoot;
    }
    set data(value) {
        if (typeof value != "object") {
            throw new TypeError("Value must be object!");
        }
        else if (!this.main) {
            this.serializationRoot = value;
        }
        else {
            this.main.data = value;
        }
    }
    /** @type {Map<Object,JSONObjectRefference>} **/
    get refferences() {
        if (typeof this._refferences == "undefined") {
            this._refferences = this.parent ? this.parent.refferences : new Map();
        }
        return this._refferences;
    }
    /** @type {JSONSerializer} **/
    get top() {
        return this.parent ? this.parent.top : this;
    }

    get nextRefId() {
        if (typeof this._nextRefId == "undefined") {
            this._nextRefId = 0;
        }
        else {
            this._nextRefId++;
        }
        return this._nextRefId;
    }
    transferAll(ownerObject) {
        for (const [key, value] of Object.entries(ownerObject)) {
            this.transferField(ownerObject, key);
        }
    }
    /**
     * Transfers field from or to a the given object depending on serialization mode
     * @param {any} ownerObject
     * @param {string} fieldName
     * @param {boolean} editable if true, the field value will not be created if it is already set and instead will have it's sub fields overwritten
     */
    transferField(ownerObject, fieldName, editable = true) {
        if (typeof fieldName !== "string" && typeof fieldName != "number") {
            if (this.parent) {
                throw new Error("Field name may only be omitted for top level object!");
            }
            if (this.isReading()) {
                if (!ownerObject) {
                    const temp = { root: null };
                    const nested = new JSONSerializer(true, this, { value: { root: this.data } });
                    nested.transferField(temp, "root");
                    return temp.root;
                }
                else {
                    if (typeof ownerObject.serializationTransfer != "function") {
                        throw new Error("Value of type '" + ownerObject.constructor.name + "' does not have a method serializationTransfer(ISerializer)!");
                    }
                    ownerObject.serializationTransfer(this);
                    return ownerObject;
                }
            }
            else if (ownerObject) {
                if (typeof ownerObject.serializationTransfer != "function") {
                    throw new Error("Value of type '" + ownerObject.constructor.name + "' does not have a method serializationTransfer(ISerializer)!");
                }
                const temp = { root: ownerObject };
                this.transferField(temp, "root");
                return this.data.value.root;
            }
            else {
                throw new Error("Owner object required.");
            }
        }
        else if (this.isReading()) {
            /** @type {JSONEntry} **/
            const entry = this.data.value[fieldName];

            if (!entry || typeof entry.type != "number") {
                throw new Error("Invalid serialization entry.");
            }

            if (entry.type == 0) {
                ownerObject[fieldName] = null;
            }
            else if (entry.type == 1) {
                ownerObject[fieldName] = entry.value;
            }
            else if (entry.type == 2) {
                // empty array or not defined
                if (typeof ownerObject[fieldName] == "undefined" || ownerObject[fieldName] == null) {
                    ownerObject[fieldName] = [];
                }
                /** @type {[]} **/
                const array = ownerObject[fieldName];
                // if array is not empty, we need to restore items directly
                //if (array.length != 0) {
                //    //if (array.length != entry.value.length) {
                //    //    throw new Error("Cannot restore full array when the lengths do not match.");
                //    //}
                //    console.warn("Resizing existing array.");
                //    array.length = entry.value.length;
                //}
                //else {
                //    array.length = entry.value.length;
                //}
                if (!editable) {
                    array.length = 0;
                }
                array.length = entry.value.length;

                const ref = this.createRefference(null, fieldName);
                ref._object = array;

                for (const usage of ref.usages) {
                    usage.owner[usage.fieldName] = obj;
                }

                const nested = new JSONSerializer(true, this, entry);
                for (let i = 0, l = array.length; i < l; ++i) {
                    nested.transferField(array, i);
                }
            }
            else if (entry.type == 3) {
                let obj = null;

                if (entry.value !== null) {
                    // restore object
                    if (typeof ownerObject[fieldName] == "undefined" || ownerObject[fieldName] == null || !editable) {
                        obj = ReviverRegistry.Create(entry.params);
                        ownerObject[fieldName] = obj;
                    }
                    else {
                        obj = ownerObject[fieldName];
                    }
                }
                else {
                    ownerObject[fieldName] = null;
                }
                
                if (obj !== null) {
                    const ref = this.createRefference(null, fieldName);
                    ref._object = obj;

                    for (const usage of ref.usages) {
                        usage.owner[usage.fieldName] = obj;
                    }

                    const nested = new JSONSerializer(true, this, entry);
                    if (typeof obj.serializationTransfer != "function") {
                        throw new Error("Value of type '" + value.constructor.name + "' does not have a method serializationTransfer(ISerializer)!");
                    }
                    else {
                        obj.serializationTransfer(nested);
                    }
                }
            }
            else if (entry.type == 4) {
                // create refference for the object
                const ref = this.createRefference(null, fieldName);
                if (ref._object) {
                    ownerObject[fieldName] = ref._object;
                }
                else {
                    ref.usages.push({ fieldName, owner: ownerObject });
                }
            }
            else {
                throw new Error("Unknown entry type: " + entry.type);
            }
            return ownerObject;
        }
        else {
            const value = ownerObject[fieldName];
            const entry = { type: 0, value: null, params: null };
            if (!this.data.value) {
                this.data.value = {};
            }
            this.data.value[fieldName] = entry;
            if (typeof value == "function") {
                throw new Error("Cannot serialize functions!");
            }
            else if (typeof value == "boolean" || typeof value == "number" || typeof value == "string") {
                entry.type = 1;
                entry.value = value;
            }
            else if (typeof value == "object" && value != null) {

                const nested = new JSONSerializer(false, this, null);
                // create refference for the object
                const ref = this.createRefference(value);

                // restoring refferences
                if (ref._object) {
                    entry.type = 4;
                    entry.value = ref.id;
                }
                else {
                    ref._object = value;
                    // special case for arrays
                    if (value instanceof Array) {
                        entry.type = 2;
                        entry.value = [];
                        entry.value.length = value.length;
                        entry.params = { refId: ref.id };
                        nested.data = entry;
                        for (let i = 0; i < value.length; ++i) {
                            nested.transferField(value, i);
                        }
                    }
                    else {
                        entry.type = 3;
                        entry.params = ReviverRegistry.GetParams(value.constructor.name, value);
                        entry.params.refId = ref.id;
                        entry.value = {};
                        nested.data = entry;
                        if (typeof value.serializationTransfer != "function") {
                            throw new Error("Value of type '" + value.constructor.name + "' does not have a method serializationTransfer(ISerializer)!");
                        }
                        else {
                            value.serializationTransfer(nested);
                        }
                     }
                }
            }
            else if (value === null) {
                entry.type = 3;
                entry.value = null;
            }
            else {
                throw new Error("Unknown data type: ", typeof value);
            }

            this.data.value[fieldName] = entry;
            return this.data;
        }
    }

    createRefference(owner, fieldName) {
        const refs = this.refferences;
        let key = null;

        const fieldNameExists = typeof fieldName == "string" || typeof fieldName == "number";

        if (this.isReading()) {
            let entry = null;
            if (fieldNameExists) {
                entry = this.data.value[fieldName];
                if (entry.type == 4) {
                    key = entry.value;
                }
                else if(entry.type == 3 || entry.type == 2) {
                    key = entry.params.refId;
                }
                else {
                    throw new Error("Tried to create a refference for a non-refference value!");
                }
            }
            // creates a refference to current object
            else {
                throw new Error("Field name required when parsing refferences!");
            }
        }
        else {
            // when saving data, the objects themselves are the keys
            key = fieldNameExists ? owner[fieldName] : owner;
        }

        let ref = refs.get(key);


        if (typeof ref != "object") {
            ref = new JSONObjectRefference(this.isReading() ? key : this.top.nextRefId);

            refs.set(key, ref);
        }
        return ref;
        if (this.isReading()) {
            //// Handling the actual instance
            //if (!fieldNameExists) {
            //    if (ref._object == null) {
            //        ref._object = owner;
            //        // apply to all usages
            //        for (const usage of ref.usages) {
            //            usage.owner[usage.fieldName] = owner;
            //        }
            //    }
            //    else
            //        throw new Error("Multiple registers for the same instance of an object!");
            //}
            //// Handling refference to real instance
            //else {
            //    if (ref._object) {
            //        owner[fieldName] = ref._object;
            //    }
            //    else {
            //        ref.usages.push({ owner, fieldName });
            //    }
            //}
        }
        else {
           //// Handling the actual instance
           //if (ref._object == null) {
           //    ref._object = owner;
           //    ref._entry = this.data;
           //}
           //else if(ref._object !== owner)
           //    throw new Error("Multiple registers for the same instance of an object!");
        }

    }

    /**
     * Retrieves value. Name is only used for serialization data that uses name, otherwise values are retrieved by their order.
     * @param {string} valueName
     */
    getValue(valueName) {

    }
    /**
     * Saves value. Name is only used for serialization data that uses name, otherwise values are retrieved by their order.
     * @param {string} valueName
     * @param {TypeHint} typeHint required if you want binary serialization to work properly
     */
    setValue(valueName, typeHint) {

    }
    /**
     * Returns true if the serializer is reading FROM the serialized data TO javascript objects
     * */
    isReading() {
        return this._reading;
    }

}

export default JSONSerializer;