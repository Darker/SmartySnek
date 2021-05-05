class GameMath {
    constructor() {

    }

    static normalizeCoordOverflow(coordinate, mapSize = NaN) {
        if (Number.isNaN(mapSize)) {
            return coordinate;
        }
        coordinate = (mapSize + coordinate) % mapSize;
        if (coordinate < 0) {
            coordinate = mapSize + coordinate;
        }
        return coordinate;
    }
}

export default GameMath;