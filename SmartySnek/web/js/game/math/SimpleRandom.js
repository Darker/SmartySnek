

class SimpleRandom {
    constructor(seed) {
        this.seed = typeof seed == "number" ? number : Math.round(Math.random() * 200000);
        this.initialSeed = this.seed;
    }
    next() {
        var x = Math.sin(this.seed++) * 1000000;
        return x - Math.floor(x);
    }
    nextInRange(min, max) {
        return this.next() * (max - min) + min;
    }
}

export default SimpleRandom;