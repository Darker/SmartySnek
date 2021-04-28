
/**
 * @typedef {Object} ProfileNode - profiling tree node
 * @property {string} name
 * @property {number} time
 * @property {number} samples
 * @property {number} _nestedTimeCache cached sum of time of all children and their children
 * @property {{[name:string]:ProfileNode}} children
 */

/** @type {ProfileNode} **/
const PROFILE_TREE = {
    name: "root",
    time: 0,
    samples: 0,
    children: {}
};

const ROOT_FIFO = [];

class ProfileScope {
    /**
     * 
     * @param {string[]} names
     */
    constructor(...names) {
        /** @type {ProfileNode} **/
        let root = ROOT_FIFO.length == 0 ? PROFILE_TREE : ROOT_FIFO[ROOT_FIFO.length-1];
       
        for (let i = 0, l = names.length; i < l; ++i) {
            const name = names[i];
            if (typeof root.children[name] != "object") {
                root.children[name] = { name: name, time: 0, samples: 0, children: {} };
            }
            root = root.children[name];
        }

        this.node = root;
        this.start = performance.now();
        this.path = names;
    }
    /**
     * Create a sub scope of this scope
     * @param {string} newName
     */
    nest(newName) {
        return new ProfileScope(...this.path, newName);
    }
    get duration() {
        return performance.now() - this.start;
    }
    close() {
        ++this.node.samples;
        this.node.time += this.duration;
    }

    pushRoot() {
        ROOT_FIFO.push(this.node);
    }

    static PopRoot() {
        ROOT_FIFO.pop();
    }

    static PrintTree() {
        // calculate sums
        /**
         * 
         * @param {ProfileNode} node
         */
        function sumCalc(node) {
            if (typeof node._nestedTimeCache == "number") {
                return node._nestedTimeCache;
            }
            let sum = 0;
            for (const child of Object.values(node.children)) {
                sum += child.time + sumCalc(child);
            }
            node._nestedTimeCache = sum;
            return sum;
        }

        sumCalc(PROFILE_TREE);
        /**
         * 
         * @param {ProfileNode} node
         * @param {number} level
         */
        function printNode(node, level = 0) {
            const margin = " ".repeat(level * 2);
            console.log(margin + node.name + " " + (node.time - node._nestedTimeCache) + "ms (total: "+node.time+"ms), (avg: "+node.time/node.samples+")");
            for (const child of Object.values(node.children)) {
                printNode(child, level+1)
            }
        }
        printNode(PROFILE_TREE);
    }
    static Clear(node = PROFILE_TREE) {
        node.time = 0;
        node.samples = 0;
        delete node._nestedTimeCache;
        for (const child of Object.values(node.children)) {
            this.Clear(child);
        }
    }
}

export default ProfileScope;