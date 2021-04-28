class GameMath {
    constructor() {

    }

    static normalizeCoordOverflow(coordinate, mapSize = NaN) {
        if (Number.isNaN(mapSize)) {
            return coordinate;
        }
        return (mapSize + coordinate) % mapSize;
    }
}

export default GameMath;