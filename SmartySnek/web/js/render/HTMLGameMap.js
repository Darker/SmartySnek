import Food from "../game/Food.js";

/**
 * @typedef {import("../game/SnakeSegment").default} SnakeSegment
 * */

/**
 * @typedef {import("../game/GameMap").default} GameMap
 * */

/**
 * @typedef {Object} SegmentTransformation - describes scale and rotation for a segment tile
 * @property {number} rotation
 * @property {number} scaleX
 * @property {number} scaleY
 */

class HTMLGameMap {
    constructor() {
        this.html = document.createElement("table");
        this.html.setAttribute("cellpadding", "0");
        this.html.setAttribute("cellspacing", "0");
        //this.html.setAttribute("cell")
        this.body = document.createElement("tbody");

        this.html.addEventListener("click", (e) => {
            let target = e.target;
            while(target) {
                if (target.tagName.toLowerCase() == "td") {
                    this.fieldClicked(target.cellIndex, target.parentNode.rowIndex);
                    break;
                }
                else if (target == this.html || target == this.body) {
                    break;
                }
                target = target.parentNode;
            }

        });

        this.html.addEventListener("mousemove", (e) => this.mousemove(e));

        this.html.appendChild(this.body);

        this.floatingTooltip = document.createElement("div");
        this.floatingTooltipText = new Text("debug");
        this.floatingTooltip.append(this.floatingTooltipText);
        this.floatingTooltip.classList.add("floating-tooltip");


        /** @type {GameMap} **/
        this._map = null;
    }

    set map(map) {
        this._map = map;
        this.update();
    }

    get map() { return this._map;}

    update(instant = false) {
        if (!instant) {
            if (!this.animationFrameRequest) {
                this.animationFrameRequest = requestAnimationFrame(() => { this.update(true);})
            }
            return;
        }
        this.animationFrameRequest = 0;

        if (this.body.rows.length != this.map.size) {
            // recreate the map
            while (this.body.rows.length > 0) {
                this.body.removeChild(this.body.rows[0]);
            }
            this.createTable();
        }
        for (const field of this.map.map) {
            //console.log("ipdating ", field.position.x, field.position.y);
            const htmlField = this.getField(field.position.x, field.position.y);

            htmlField.style.backgroundImage = "";
            htmlField.style.backgroundColor = "";
            htmlField.style.transform = "";

            if (field.damage > 0) {
                //console.log(field);
                if (field.isSnakeSegment) {
                    /** @type {SnakeSegment} **/
                    const segment = field.contents;
                    let curved = false;
                    // check if segment is curved
                    if (!segment.isLast) {
                        if (segment.orientation.direction != segment.next.orientation.direction) {
                            curved = true;
                        }
                    }

                    htmlField.style.backgroundImage = "url('img/sneks/" + field.contents.segmentType + "_" + (curved ? "curved" : "straight")+"_"+"normal"+".svg')";
                    //htmlField.style.backgroundColor = "green";
                    // rotate
                    const transformation = this.calculateSegmentTransformation(segment);

                    if (transformation.rotation != 0 || transformation.scaleY != 1 || transformation.scaleX != 1) {
                        htmlField.style.transform = `scaleX(${transformation.scaleX}) scaleY(${transformation.scaleY}) rotate(${transformation.rotation}deg)`;
                    }
                    
                }
                else {
                    htmlField.style.backgroundColor = "red";
                }
                
            }
            else if (field.foodPoints > 0) {
                htmlField.style.backgroundImage = "url('img/sneks/item_food_"+field.contents.type+".svg')";
            }

            // debug info
            for (const debug of field.debugContents) {
                if (debug.backgroundColor) {
                    htmlField.style.backgroundColor = debug.htmlBackgroundColor;
                }
            }
        }
        // also update tooltip
        this.doTooltip();
    }
    /**
     * 
     * @param {SnakeSegment} segment
     * @returns {SegmentTransformation}
     */
    calculateSegmentTransformation(segment) {
        let curved = false;
        let isHead = segment.isFirst;
 
        /** @type {SegmentTransformation} **/
        const result = {
            rotation: 0,
            scaleX: 1,
            scaleY: 1
        };

        // check if segment is curved
        if (!segment.isLast) {
            if (segment.orientation.direction != segment.next.orientation.direction) {
                curved = true;
            }
        }
        //console.log("SEGMENT: ", segment.uniqueID);
        if (curved) {
            //console.log("     : CURVED");
        }
        if (segment.orientation.direction != 0 || curved) {
            result.rotation = segment.orientation.direction * -90;
            //console.log("     : Initial rotation: ", result.rotation);
            if (curved) {
                if (isHead) {
                    // rotate -90 by default
                    result.rotation -= 90;
                    // if the segment is turning left relative to body, we need to mirror it
                    if (segment.next.orientation.clone().rotateLeft().direction == segment.orientation.direction) {
                        result.scaleX = segment.orientation.isHorizontal ? 1 : -1;
                        result.scaleY = segment.orientation.isVertical ? 1 : -1;
                    }
                }
                else {
                    const leftside = segment.orientation.clone().rotateLeft();
                    //console.log("     : Direction to the left: " + leftside);
                    //console.log("     : Next segment direction: " + segment.next.orientation);
                    leftside.turnAround();
                    if (segment.next.orientation.direction == leftside.direction) {
                        //console.log("     : LEFTSIDE!");
                        result.rotation -= 90;
                    }
                }


            }

            //console.log("rotate(" + rotation + "deg)", segment, segment.orientation);
        }
        return result;
    }

    fieldClicked(x, y) {
        //console.log("Clicked: ", x, y);
        const field = this.map.getField(x, y);
        console.log(`[${x}, ${y}] ` + (field.isEmpty ? " EMPTY" : ""));
        if (field.isSnakeSegment) {
            /** @type {SnakeSegment} **/
            const segment = field.contents;
            console.log("SEGMENT:   Orientation: " + segment.orientation);
            this.calculateSegmentTransformation(segment);
        }
        else if (field.isEmpty) {
            field.contents = new Food();
        }
    }

    getField(x, y) {
        return this.body.rows[y].cells[x];
    }

    * fields() {
        for (let y = 0; y < this.map.size; ++y) {
            for (let x = 0; x < this.map.size; ++x) {
                yield { html: this.getField(x, y), game: this.map.getField(x, y) };
            }
        }
    }
    /**
     * 
     * @param {MouseEvent} event
     */
    mousemove(event) {
        // get the field
        const field = findInParents(event.target, (x) => x.tagName.toLowerCase() == "td", (x) => x == this.html);
        if (field) {
            this.doTooltip(field.cellIndex, field.parentNode.rowIndex);
        }
        else {
            //this.floatingTooltip.style.display = "";
        }
    }

    doTooltip(x, y) {
        if (typeof x != "number") {
            if (this.lastTooltip) {
                x = this.lastTooltip[0];
                y = this.lastTooltip[1];
            }
            else {
                return;
            }
        }

        this.lastTooltip = [x, y];

        const field = this.getField(x, y);
        let data = "[" + x + ", " + y + "]";
        const mapField = this.map.getField(x, y);
        if (mapField.damage > 0) {
            data += "\nDamage: " + mapField.damage;
        }
        if (mapField.foodPoints > 0) {
            data += "\nFood: " + mapField.foodPoints;
        }
        for (const debug of mapField.debugContents) {
            if (debug.title) {
                data += "\n--------\n";
                data += debug.title;
            }
        }

        this.floatingTooltipText.data = data;

        this.floatingTooltip.style.top = (field.getBoundingClientRect().bottom + 1) + "px";
        this.floatingTooltip.style.left = (field.getBoundingClientRect().left) + "px";
        this.floatingTooltip.style.display = "inline-block";
    }

    createTable() {
        const size = this.map.size;
        for (let i = 0; i < size; ++i) {
            const row = this.body.insertRow();
            for (let j = 0; j < size; ++j) {
                const cell = row.insertCell();
                cell.appendChild(new Text("\xa0"));
            }
        }
    }

}

/**
 * 
 * @param {HTMLElement} element
 * @param {function(HTMLElement):boolean} predicate
 * @param {function(HTMLElement):boolean} cancelPredicate
 */
function findInParents(element, predicate, cancelPredicate) {
    while (element != null) {
        if (predicate(element)) {
            return element;
        }
        else if (cancelPredicate(element)) {
            break;
        }
        else {
            element = element.parentNode;
        }
    }
    return null;
}

export default HTMLGameMap;