import SnakeController from "../SnakeController.js";
import FieldDebug from "../../debug/FieldDebug.js";
import Vector2 from "../../math/Vector2.js";
import Orientation from "../../math/Orientation.js";
//import ProfileScope from "../../debug/ProfileScope.js";

/**
 * @typedef {import("../GameStateInfo").default} GameStateInfo
 * @typedef {import("../../MapField").default} MapField
 * @typedef {import("../../GameMap").default} GameMap
 * */

class AStarPathStep {
    /**
     *
     * @param {Vector2} point
     * @param {Vector2|Orientation} prevPoint
     * @param {GameMap} map
     */
    constructor(point, prevPoint, map) {
        this.point = point;
        this.direction = AStarPathStep.convertPrevPoint(point, prevPoint);
        this.map = map;
    }
    /**
    *
    * @param {Vector2} point
    * @param {Vector2|Orientation} prevPoint
    * @param {GameMap} map
    * @returns {AStarPathStep}
    */
    static createCached(point, prevPoint, map, cache) {
        if (typeof cache != "object" || cache == null) {
            return new AStarPathStep(point, prevPoint, map);
        }
        else {
            const direction = this.convertPrevPoint(point, prevPoint);
            if (!cache[point.x]) {
                cache[point.x] = {};
            }
            if (!cache[point.x][point.y]) {
                cache[point.x][point.y] = {};
            }

            if (!cache[point.x][point.y][direction.direction]) {
                cache[point.x][point.y][direction.direction] = new AStarPathStep(point, direction.direction, map);
            }
            return cache[point.x][point.y][direction.direction];
        }
    }
    /**
    *
    * @param {Vector2} point
    * @param {Vector2|Orientation} prevPoint
    * @returns {Orientation}
    */
    static convertPrevPoint(point, prevPoint) {
        if (prevPoint instanceof Vector2) {
            return Orientation.fromVectors(prevPoint, point);
        }
        else if (prevPoint instanceof Orientation) {
            return prevPoint.clone();
        }
        else if (typeof prevPoint == "number") {
            if (prevPoint == 0 || prevPoint == 1 || prevPoint == 2 || prevPoint == 3) {
                return new Orientation(prevPoint);
            }
            else {
                throw new Error("Invalid number constructor AStarPathStep");
            }
        }
        else {
            console.error(prevPoint);
            throw new Error("Invalid prev point in astart path step.");
        }
    }
    /**
     * Returns true if this is a dangerous field
     */
    isDangerous() {
        if (typeof this._isDangerous == "undefined") {
            this._isDangerous = this.mapField.isDangerous;
        }
        return this._isDangerous;
    }

    /**
     * Returns true, if snake can get from my point to given point
     * @param {Vector2|AStarPathStep} point
     */
    isSafelyAdjacent(point) {
        if (point instanceof AStarPathStep) {
            point = point.point;
        }
        // only directly adjacent (non diagonal) fields are accepted
        if (this.point.isDirectlyAdjacent(point, null, this.map.size)) {
            const dirTo = Orientation.fromVectors(this.point, point);
            // If the reverse of the direction to new point is
            // the direction of current point, then it points back and is not safe
            dirTo.turnAround();
            if (!dirTo.equals(this.direction)) {
                return true;
            }
        }
        return false;
    }

    get isFood() {
        if (typeof this._isFood == "undefined") {
            this._isFood = this.mapField.isFood;
        }
        return this._isFood;
    }

    /**
     *
     * @param {AStarPath} path
     * @returns {number}
     */
    getValue(path, isLast = false) {
        if (typeof this._score != "number") {
            let score = 1;

            // current field food
            if (this.isFood) {
                score -= 20;
            }

            this._score = score;
        }

        // side bonus for crawling next to another snake line, but only from one side
        if (typeof this._scoreSideBonus != "number") {
            let score = 1;
            let leftSnake = false;
            let rightSnake = false;

            // for each adjacent field check if it is dangerous
            const dir = this.direction.clone();
            // start left, then go forward and right
            dir.rotateLeft();
            const position = this.point.clone();
            for (let i = 0; i < 3; ++i) {
                if (i !== 1) {
                    position.move(dir);
                    if (i == 0) {
                        leftSnake = this.map.getField(position).isSnakeSegment;
                        if (leftSnake) {
                            this.map.getField(position).addDebug("SNAKE left", [255, 100, 0], null, 4);
                        }
                    }
                    if (i == 2) {
                        rightSnake = this.map.getField(position).isSnakeSegment;
                        if (rightSnake) {
                            this.map.getField(position).addDebug("SNAKE right", [255, 100, 0], null, 4);
                        }
                    }
                    position.position = this.point;
                }

                dir.rotateRight();
            }

            if (leftSnake ^ rightSnake) {
                score += -1;
            }
            else if (leftSnake && rightSnake) {
                score += 10;
            }


            this._scoreSideBonus = score;
        }

        let totalScore = this._score + this._scoreSideBonus;
        if (isLast) {
            let i = 0;
            for (const position of this.nextPossibleFields()) {
                const field = this.map.getField(position);
                let dangerous = field.isDangerous;

                // also check the path, if it's on it, it's also dangerous
                if (path.containsPoint(position)) {
                    dangerous = true;
                }

                if (dangerous) {
                    totalScore += 20;
                    // if this is last step then the front direction MUST NOT HAVE DANGER!!!
                    if (i == 1) {
                        totalScore += 10000;
                        //field.addDebug(new FieldDebug("DANGER!", [255, 0, 0], null, 4));
                        break;
                    }
                }
                else if (field.isFood) {
                    totalScore -= 8;
                }
                ++i;
            }
        }


        return totalScore;
    }

    get mapField() {
        if (typeof this._mapField == "undefined") {
            this._mapField = this.map.getField(this.point);
        }
        return this._mapField;
    }

    /**
     * Warning: THE RETURNED VECTOR IS TEMPORARY. Any modification will be lost in next iteration
     * @returns {IterableIterator<Vector2>}
     * */
    *nextPossibleFields() {
        // for each adjacent field check if it is dangerous
        const dir = this.direction.clone();
        // start left, then go forward and right
        dir.rotateLeft();
        const position = this.point.clone();
        for (let i = 0; i < 3; ++i) {
            position.move(dir);
            yield position;
            dir.rotateRight();
            position.position = this.point;
        }
    }

    *nextPossibleSteps(stepCache = null) {
        //const profileNextPosSteps = new ProfileScope("*nextPossibleSteps");
        //const profileCloning = profileNextPosSteps.nest("cloning");
        // for each adjacent field check if it is dangerous
        const dir = this.direction.clone();
        // start left, then go forward and right
        dir.rotateLeft();

        const position = this.point.clone();

        //profileCloning.close();

        for (let i = 0; i < 3; ++i) {
            position.move(dir);
            //const profileCreateStep = profileNextPosSteps.nest("createStep");
            const newStep = AStarPathStep.createCached(position.clone(), this.point, this.map, stepCache)
            //profileCreateStep.close();
            //profileNextPosSteps.pushRoot();
            yield newStep;
            //ProfileScope.PopRoot();
            dir.rotateRight();
            position.position = this.point;
        }

        //profileNextPosSteps.close();
    }
}

class AStarPath {
    /**
     *
     * @param {GameMap} map
     */
    constructor(map) {
        /** @type {AStarPathStep[]} **/
        this.steps = [];
        this.map = map;
    }
    /**
     *
     * @param {AStarPathStep} step
     */
    addStep(step) {
        delete this._value;
        this.steps.push(step);
    }
    get last() {
        if (this.steps.length > 0) {
            return this.steps[this.steps.length - 1];
        }
        else {
            return null;
        }
    }
    fork() {
        const newPath = new AStarPath(this.map);
        newPath.steps.push(...this.steps);
        return newPath;
    }
    /**
     *
     * @param {Vector2} point
     */
    containsPoint(point) {
        return this.steps.find((x) => x.point.equals(point));
    }

    get endsWithFood() {
        if (typeof this._isFood != "boolean") {
            this._isFood = this.map.getField(this.last.point.x, this.last.point.y).isFood;
        }
        return this._isFood;
    }
    get length() {
        return this.steps.length;
    }
    getValue() {
        if (typeof this._value != "number") {
            let value = 0;
            for (const step of this.steps) {
                value += step.getValue(this, step == this.last);
            }
            this._value = value;
        }

        return this._value;
    }
    /**
     * Returns true if this path entirely includes the other path
     * @param {AStarPath} otherPath
     */
    includes(otherPath) {
        if (otherPath.length < this.length) {
            for (let i = 0, l = otherPath.length; i < l; ++i) {
                const item = otherPath.steps[i];
                const myItem = this.steps[i];
                if (myItem.direction.direction != item.direction.direction || !myItem.point.equals(item.point)) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    /**
     * Creates a fork of the path if the new path wouldn't revisit any points
     * @param {Vector2} point point, must be safely adjacent
     */
    forkInto(point, stepCache = null) {
        // if the point creates circle, do not fork
        if (point instanceof Vector2 && this.steps.find((x) => x.point.equals(point))) {
            //console.log("discarding circular fork")
            return null;
        }
        else if (point instanceof AStarPathStep && this.steps.find((x) => x.point.equals(point.point))) {
            return null;
        }
        else {
            //if (!this.isSafelyAdjacent(point)) {
            //    this.drawPath(true);
            //    console.log(point);
            //    this.map.getField(point).addDebug("INVALID NEXT", [255, 0, 0], null, 100);
            //    this.map.getField(this.last.point).addDebug("INVALID FROM", [255, 255, 0], null, 100);
            //    throw new Error("Cannot attach to non adjacent field.")
            //}

            const newPath = this.fork();
            if (!(point instanceof AStarPathStep)) {
                point = AStarPathStep.createCached(point, this.last.point, this.map, stepCache);//new AStarPathStep(point, this.last.point);
            }
            //else {
            //    const test = new AStarPathStep(point.point, this.last.point);



            //    if (test.direction.direction != point.direction.direction) {
            //        this.map.getField(point.point).addDebug("BAD_DIRECTION: " + point.direction.directionPictogram(), [255, 0, 0], null, 100);
            //        this.map.getField(point.point).addDebug("GOOD_DIRECTION: " + test.direction.directionPictogram(), [255, 0, 0], null, 100);
            //        this.map.getField(this.last.point).addDebug("CURRENT " + this.last.direction.directionPictogram(), [255, 255, 0], null, 100);
            //        throw new Error("Invalid step pushed into path!");
            //    }
            //}

            newPath.addStep(point);
            return newPath;
        }
    }

    drawPath(clear = false) {
        if (clear) {
            this.map.clearAllDebug();
        }

        for (const step of this.steps) {
            const value = step.getValue(this.map, this, step==this.last);
            this.map.getField(step.point).addDebug(new FieldDebug("step\nvalue=" + value, [0, 255, 0], null, this.steps.length));
        }
    }
    /**
     * Returns true if snake can turn from this path to that point
     * @param {Vector2} point
     */
    isSafelyAdjacent(point) {
        return this.last.isSafelyAdjacent(point);
    }
}

class AStarPathInfo {
    /**
     *
     * @param {AStarPath} path
     */
    constructor(path) {
        this.path = path;

    }
}

class AStarBot extends SnakeController {
    constructor() {
        super();
        /** @type {AStarPath} **/
        this.path = null;
        this.pathStep = 1;
    }
    get name() { return "A* bot"; }
    get description() { return "Tries to use A* like algorithm to find food"; }

    reset() {
        this.path = null;
        this.pathStep = 1;
    }
    /**
     *
     * @param {GameStateInfo} gameInfo
     */
    play(gameInfo) {
        if (!this.path) {
            const paths = this.calculatePossiblePaths(gameInfo.snakePosition.clone(), gameInfo.snakeDirection.clone(), gameInfo.map, false);

            console.log("Total paths found: ", paths.length);

            if (paths.length > 0) {
                for (const step of paths[0].steps) {
                    gameInfo.map.getField(step.point).addDebug(new FieldDebug("path step", [0, 255, 0], null, paths[0].steps.length));
                }

                //this.paths = paths;
                //this.pathsIndex = 0;
                if (paths[0].length > 1) {
                    this.path = paths[0];
                }
            }

        }
        if (this.path) {


            const step = this.path.steps[this.pathStep];
            //gameInfo.map.getField(step.point).addDebug(new FieldDebug("current step", [255, 0, 0], null, 2));
            //gameInfo.map.getField(gameInfo.snakePosition).addDebug(new FieldDebug("head", [255, 255, 0], null, 2));
            const snakedir = gameInfo.snakeDirection;
            if (!step.direction.equals(snakedir)) {
                if (snakedir.directionToLeft == step.direction.direction) {
                    gameInfo.goLeft();
                }
                else if (snakedir.directionToRight == step.direction.direction) {
                    gameInfo.goRight();
                }
            }

            this.pathStep++;
            if (this.pathStep >= this.path.steps.length) {
                this.reset();
            }
        }
    }
    /**
     *
     * @param {Vector2} initPoint
     * @param {Orientation} initDirection
     * @param {GameMap} map
     * @  returns {IterableIterator<AStarPath[]>} yields null untill the slast step, then it yields the result
     */
    calculatePossiblePaths(initPoint, initDirection, map, debug = false) {
        //const profileFunction = new ProfileScope("calculatePossiblePaths");
        /**
         *
         * @param {AStarPath} a
         * @param {AStarPath} b
         */
        function pathSorter(a, b) {
            //if (a == null) {
            //    return 1;
            //}
            //else if (b == null) {
            //    return -1;
            //}
            //else if (a == null && b == null) {
            //    return 0;
            //}
            if (a.getValue() != b.getValue()) {
                return a.getValue() - b.getValue();
            }
            else {
                return a.length - b.length;
            }
        }

        const initialPath = new AStarPath(map);
        initialPath.addStep(new AStarPathStep(initPoint, initDirection, map));
        /** @type {AStarPath[]} **/
        const paths = [initialPath];

        const finishedPaths = [];
        let longestPath = 0;
        let steps = 0;
        let bestScore = 1000000;
        let bestScoreLength = 0;

        const stepCache = {};

        const startTime = performance.now();
        let endingOnTime = false;

        const TIMEOUT = 1000;
        const MAX_STEPS = 10000;
        const MAX_PATH_LENGTH = 40;
        // if there is less than this many paths in progress, do not delete bad paths
        const MIN_PATHS_FOR_DELETING = 150;
        // How often should optimizations take place (in number of steps)
        const OPTIMIZATION_INTERVAL = 200;

        //const profileMainLoop = profileFunction.nest("while(paths.length)");

        while (paths.length > 0) {

            // ocassionally sort to focus on profitable paths
            if (steps > OPTIMIZATION_INTERVAL && steps % OPTIMIZATION_INTERVAL == 0) {
                //const profileOptimization = profileMainLoop.nest("optimization");

                paths.sort(pathSorter);
                // drop 10 percent shitiest paths
                if (paths.length > MIN_PATHS_FOR_DELETING) {
                    
                    const numToDrop = Math.floor(paths.length * 0.5);
                    paths.splice(paths.length - numToDrop);
                }

                //profileOptimization.close();

                // check time
                if (!endingOnTime) {
                    const duration = performance.now() - startTime;
                    if (duration > TIMEOUT) {
                        endingOnTime = true;
                    }
                }
            }

            let currentPath = paths.shift();
            let addToFinished = true;

            // add possible directions
            if (currentPath.length < MAX_PATH_LENGTH && steps < MAX_STEPS) {
                addToFinished = false;

                //const profileNextPossible = profileMainLoop.nest("nextPossibleSteps");
                //profileNextPossible.pushRoot();
                for (const step of currentPath.last.nextPossibleSteps(stepCache)) {
                    let dangerous = false;
                    if (step.isDangerous()) {
                        dangerous = true;
                        // ignore segments that will move out of the way
                        if (step.mapField.isSnakeSegment) {
                            if (step.mapField.contents.reverseIndex + 2 < currentPath.length) {
                                dangerous = false;
                            }
                        }
                    }

                    if (!dangerous) {
                        //const profileForkInto = new ProfileScope("forking");
                        let path = currentPath.forkInto(step, stepCache);
                        //profileForkInto.close();
                        if (path) {
                            if (endingOnTime) {
                                if (path.getValue() >= currentPath.getValue()) {
                                    addToFinished = true;
                                    continue;
                                }
                            }
                            paths.unshift(path);
                        }
                    }
                    //console.log("Fork step: ", step.direction.directionName(), step.point + "");
                }
                //profileNextPossible.close();
                //ProfileScope.PopRoot();
            }

            //if (bestScoreLength > 0 && addToFinished) {
            //    const requiredValue = bestScore / bestScoreLength;
            //    const currentValue = currentPath.getValue() / currentPath.length;
            //    const tolerance = bestScoreLength > currentPath.length ? 3 * (bestScoreLength - currentPath.length) : 0;
            //    // if there is no chance it beats the best score, skip it
            //    if (currentValue - tolerance > requiredValue) {
            //        addToFinished = false;
            //    }
            //}

            {

                // add path to finished ones
                if (addToFinished) {
                    //const profileSave = profileMainLoop.nest("savePath");
                    finishedPaths.push(currentPath);
                    //profileSave.close();
                    //if (currentPath.getValue() < bestScore) {
                    //    bestScore = currentPath.getValue();
                    //    bestScoreLength = currentPath.length;
                    //}
                }


                longestPath = Math.max(longestPath, currentPath.length);
            }

            ++steps;
        }

        //profileMainLoop.close();
        //profileFunction.close();
        //ProfileScope.PrintTree();
        //ProfileScope.Clear();

        //const duration = performance.now() - startTime;
        //console.log("DURATION: ", duration);
        //this._runCount = typeof this._runCount == "number" ? this._runCount + 1 : 1;
        //this._runTimeSum = typeof this._runTimeSum == "number" ? this._runTimeSum + duration : duration;

        //console.log("AVG_DURATION: ", this._runTimeSum / this._runCount, "ms");
        //console.log("STEPS:", steps);
        //console.log("LONGEST: ", longestPath);
        //console.log("BEST SCORE:", bestScore, bestScoreLength, bestScore / bestScoreLength);
        //console.log("TOTAL: ", finishedPaths.length);
        //console.log("UNUSED:", paths.length)
        //let stepNumber = 0;
        //// put possible fields snake can go through as start paths(gameInfo.mapSize * gameInfo.mapSize - 2)
        //for (const point of initPoint.clone().move(initDirection).spiralNeigbors(80)) {
        //    stepNumber++;
        //    // point is danger, skip
        //    if (map.getField(point).isDangerous) {
        //        continue;
        //    }
        //    let added = false;
        //    for (const path of paths) {
        //        //if (path.endsWithFood) {
        //        //    continue;
        //        //}
        //        if (path.isSafelyAdjacent(point)) {
        //            const newPath = path.forkInto(point);
        //            if (newPath) {
        //                paths.push(newPath);
        //                added = true;
        //            }

        //        }

        //    }

        //    // remove identic paths
        //    for (let i = 0, l1 = paths.length; i < l1; ++i) {
        //        const item1 = paths[i];
        //        for (let j = i + 1, l2 = paths.length; j < l2; ++j) {
        //            const item2 = paths[j];
        //            if (item1.last.point.equals(item2.last.point) && item1.last.direction.direction == item2.last.direction.direction) {
        //                // remove the path that has lower value
        //                const value1 = item1.getValue();
        //                const value2 = item2.getValue();
        //                if (value1 > value2+1) {
        //                    //console.log("Removing first path, there is cheaper way to get there.");
        //                    paths.splice(i, 1);
        //                    j--; i--; l1--; l2--;
        //                    break;
        //                }
        //                else if (value2 > value1 + 1) {
        //                    //console.log("Removing second path, there is cheaper way to get there.");
        //                    paths.splice(j, 1);
        //                    j--; l1--; l2--;
        //                }
        //            }
        //        }
        //    }
        //}

        //const filterStart = performance.now();
        //let removed = 0;
        //// remove all finishedPaths that are included in longer finishedPaths
        //for (let i = 0, l1 = finishedPaths.length; i < l1; ++i) {
        //    const item1 = finishedPaths[i];
        //    for (let j = i + 1, l2 = finishedPaths.length; j < l2; ++j) {
        //        const item2 = finishedPaths[j];
        //        if (item2) {
        //            if (item2.includes(item1)) {
        //                finishedPaths.splice(i, 1);
        //                i--; l1--;
        //                ++removed;
        //                //finishedPaths[i] = null;
        //                break;
        //            }
        //            else if (item1.includes(item2)) {
        //                //finishedPaths[j] = null;
        //                finishedPaths.splice(j, 1);
        //                ++removed;
        //                j--; l1--; l2--;
        //            }
        //        }
        //    }
        //}

        //console.log("Filtering took ", performance.now() - filterStart, "ms ", removed," paths removed.");
        const sortStart = performance.now();
        
        finishedPaths.sort(pathSorter);
        console.log("Sorting took ", performance.now() - sortStart, "ms");
        if(debug)
            console.log(finishedPaths);
        return finishedPaths;
    }
}

export default AStarBot;
