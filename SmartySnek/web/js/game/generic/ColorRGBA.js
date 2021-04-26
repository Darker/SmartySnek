class ColorRGBA {
    constructor(r, g, b, a) {
        if (typeof r == "object") {
            if (r instanceof ColorRGBA) {
                g = r.g;
                b = r.b;
                a = r.a;
                r = r.r;
            }
            else if (r instanceof Array) {
                g = r[1];
                b = r[2];
                a = r[3];
                r = r[0];
            }
            else if (typeof r.r == "number" && typeof r.g == "number") {
                g = r.g;
                b = r.b;
                a = r.a;
                r = r.r;
            }
        }

        this.bands = new Uint8ClampedArray(4);
        if (typeof r == "number") {
            this.r = r;
        }
        if (typeof g == "number") {
            this.g = g;
        }
        if (typeof b == "number") {
            this.b = b;
        }
        if (typeof a == "number") {
            this.a = a;
        } else {
            this.a = 255;
        }
    }
    get r() {
        return this.bands[0];
    }
    get g() {
        return this.bands[1];
    }
    get b() {
        return this.bands[2];
    }
    get a() {
        return this.bands[3];
    }
    set r(r) {
        return this.bands[0] = r;
    }
    set g(g) {
        return this.bands[1] = g;
    }
    set b(b) {
        return this.bands[2] = b;
    }
    set a(a) {
        return this.bands[2] = a;
    }
    /**
     * Blend semi transparent colors into solid one with black background
     * @param {ColorRGBA[]} colors
     * */
    solidBlend(colors) {
        const intermediate = [0, 0, 0];
        for (const c of colors) {
            for (let i = 0; i < 3; ++i) {
                intermediate[i] += c.bands[i] * (c.a / 255);
            }
        }
        const result = new ColorRGBA();
        result.r = intermediate[0] / colors.length;
        result.g = intermediate[1] / colors.length;
        result.b = intermediate[2] / colors.length;
        return result;
    }
}

export default ColorRGBA;