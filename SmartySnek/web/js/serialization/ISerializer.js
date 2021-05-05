
/**
 * @typedef {Object} TypeHint - serialization type hint
 */


class IObjectRefference {

}

class ISerializer {
    constructor() {

    }


    /** @type {{[name]:TypeHint}} **/
    static TypeHints = {
        UINT8: {isNumber: true},
        INT8: { isNumber: true},
        UINT16: { isNumber: true},
        INT16: { isNumber: true},
        UINT32: { isNumber: true},
        INT32: { isNumber: true},
        FLOAT16: { isNumber: true},
        FLOAT64: { isNumber: true},
        STRING: {},
        OBJECT: {},
        TYPED_ARRAY: {}
    }
    /**
     * Transfers field from or to a the given object depending on serialization mode
     * @param {any} ownerObject
     * @param {string} fieldName
     * @param {TypeHint} typeHint required if you want binary serialization to work properly
     */
    transferField(ownerObject, fieldName, typeHint) {

    }
    /**
     * Creates a refference to this object. This allows this object to be serialized or deserialized from multiple
     * locations in the data tree.
     * @param {any} object
     * @returns {IObjectRefference}
     */
    createRefference(object) {

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
    setValue(valueName) {

    }
    /**
     * Returns true if the serializer is reading FROM the serialized data TO javascript objects
     * */
    isReading() {
        return false;
    }

    static IObjectRefference = IObjectRefference;
}


export default ISerializer;