

const CONSTRUCTORS = {};

/**
 * @typedef {{[name:string]:string|number|boolean}} ObjectParams - parameters for object creation
 */

/**
 * @template T
 * @typedef {Object} ObjectFactory - describes how an object should be stored and created
 * @property {function(T):ObjectParams} params params must be numbers, strings or booleans
 * @property {function(ObjectParams):T} factory
 */


class ReviverRegistry {
    constructor() {

    }

    /**
     * @template T
     * @param {string|function(new:T):T} typeName
     */
    static Registered(typeName) {
        if (typeof typeName == "function") {
            typeName = typeName.name;
        }
        return typeof CONSTRUCTORS[typeName] != "undefined";
    }
    static CT = CONSTRUCTORS;
    /**
     * @template T
     * @param {string|function(new:T):T} typeName
     * @param {ObjectFactory<T>} objectFactory
     */
    static Register(typeName, objectFactory) {
        if (typeof typeName == "function") {
            const ctor = typeName;
            typeName = ctor.name;
            if (typeof objectFactory != "object" || objectFactory == null) {
                objectFactory = {};
                objectFactory.factory = () => new ctor();
            }
        }


        CONSTRUCTORS[typeName] = objectFactory;
    }

    /**
     * 
     * @param {string} typeName
     * @param {ObjectParams} params
     */
    static Create(params) {
        if (typeof CONSTRUCTORS[params.name] == "object") {
            return CONSTRUCTORS[params.name].factory(params);
        }
        else {
            throw new TypeError("Type '" + params.name + "' is not registered for serialization.");
        }
    }

    static GetParams(typeName, object) {
        if (typeof CONSTRUCTORS[typeName] == "object") {
            let params = null;
            if (typeof CONSTRUCTORS[typeName].params == "function") {
                params = CONSTRUCTORS[typeName].params(object);
            }
            if (!params) {
                params = {};
            }
            params.name = typeName;
            return params;
        }
        else {
            throw new TypeError("Type '" + typeName + "' is not registered for serialization.");
        }
    }
}

ReviverRegistry.Register(Uint8Array, {
    factory: (params) => new Uint8Array(params.length),
    params: (array) => { return { length: array.length };}
});
ReviverRegistry.Register(Int8Array, {
    factory: (params) => new Int8Array(params.length),
    params: (array) => { return { length: array.length }; }
});
ReviverRegistry.Register(Uint16Array, {
    factory: (params) => new Uint16Array(params.length),
    params: (array) => { return { length: array.length }; }
});
ReviverRegistry.Register(Int16Array, {
    factory: (params) => new Int16Array(params.length),
    params: (array) => { return { length: array.length }; }
});
ReviverRegistry.Register(Uint32Array, {
    factory: (params) => new Uint32Array(params.length),
    params: (array) => { return { length: array.length }; }
});
ReviverRegistry.Register(Int32Array, {
    factory: (params) => new Int32Array(params.length),
    params: (array) => { return { length: array.length }; }
});
ReviverRegistry.Register(Object, {
    factory: (params) => { },
    params: (array) => { return null; }
});


export default ReviverRegistry;