import SimpleNeuron from "./SimpleNeuron.js";


class SimpleLayer {
    /**
     * @param {SimpleLayer} parent
     * @param {number} size
     */
    constructor(parent, size) {
        /** @type {SimpleNeuron[]} **/
        this.neurons = [];

        for (let i = 0; i < size; ++i) {
            this.neurons.push(new SimpleNeuron());
        }
        // Source layer, if null then this is the starting layer
        this.parent = parent;
        this.size = size;
        /** @type {Float64Array} **/
        this.weights = null;
        if (this.parent instanceof SimpleLayer) {
            // one weight for each connection between my neurons and source neurons
            this.weights = new Float64Array(this.size * this.parent.size);
        }

        this.values = new Float64Array(size);
    }

    calculate() {
        // make sure parent is calculated
        if (this.parent instanceof SimpleLayer) {
            this.parent.calculate();
            const valuesTmp = new Float64Array(this.parent.size);
            // for each neuron, get all source values, multiply by weight, process and divide by count
            for (let i = 0, l = this.neurons.length; i < l; ++i) {
                const neuron = this.neurons[i];
                // get all input values and multiply by weights
                for (let parentIndex = 0, parentL = valuesTmp.length; parentIndex < parentL; ++parentIndex) {
                    // weights grouped by neuron, so first neuron's weights are at the start of the weight array
                    const weightIndex = i * this.parent.size + parentIndex;
                    valuesTmp[parentIndex] = this.weights[weightIndex] * this.parent.values[parentIndex];
                }
                // Now process each value through the neuron
                for (let tmpIndex = 0, tmpLen = valuesTmp.length; tmpIndex < tmpLen; ++tmpIndex) {
                    valuesTmp[tmpIndex] = neuron.exec(valuesTmp[tmpIndex]);
                }
                // now sum and divide by count
                let val = 0;
                for (const subVal of valuesTmp) {
                    val += subVal;
                }
                this.values[i] = val / this.parent.size;
            }
        }
        else {
            // nothing to do, values should be set from outside already
        }
    }

    /**
     * Puts totally random values to weights
     * */
    randomizeWeights() {
        for (let i = 0, l = this.weights.length; i < l; ++i) {
            this.weights[i] = clampWeight(Math.random());
        }
    }
    /**
     * Changes weights by a small amount randomly.
     * */
    randomWeightChange() {
        for (let i = 0, l = this.weights.length; i < l; ++i) {
            this.weights[i] = clampWeight(this.weights[i] + (0.5-Math.random() / 20));
        }
    }
}

function clampWeight(weight) {
    return Math.max(0.000001, Math.min(weight, 0.999999));
}

export default SimpleLayer;