﻿import SnakeController from "../game/bots/SnakeController.js";

class GameControls {
    constructor() {
        this.html = document.createElement("div");
        this.speedControl = document.createElement("input");
        this.speedControl.type = "range";
        this.speedControl.min = "0";
        this.speedControl.max = "12";
        this.speedControl.step = "0.0001";
        this.speedControl.defaultValue = Math.log2(500) + "";
        this.speedControlLabel = new Text("");

        const speedControlSpan = document.createElement("span");
        speedControlSpan.append(this.speedControlLabel);
        speedControlSpan.classList.add("speed_control_label");

        this.speedControl.addEventListener("input", () => this.updateSpeed());
        this.speedControl.addEventListener("change", () => this.updateSpeed());

        this.html.append(this.speedControl, speedControlSpan, document.createElement("br"));

        this.botSelector = document.createElement("select");
        this.botSelectorLabel = new Text();
        const botSelectorSpan = document.createElement("span");
        botSelectorSpan.append(new Text(" - "), this.botSelectorLabel);


        this.botSelector.addEventListener("change", () => { this.updateBot(); });
        /** @type {SnakeController[]} **/
        this._botOptions = [];

        this.html.append(this.botSelector, botSelectorSpan);

        this.updateSpeed();
    }
    get speedMilliseconds() {
        return Math.pow(2, this.speedControl.valueAsNumber);
    }
    set speedMilliseconds(value) {
        this.speedControl.value = Math.log2(value);
    }
    get speedStopped() {
        return this.speedControl.valueAsNumber > 11.5;
    }

    get botOptions() {
        return this._botOptions;
    }

    set botOptions(value) {
        this._botOptions.length = 0;
        for (const ctr of value) {
            this._botOptions.push(ctr);
            const opt = document.createElement("option");
            opt.value = this._botOptions.length - 1;
            opt.appendChild(new Text(ctr.name));
            this.botSelector.appendChild(opt);
        }
    }

    get selectedBot() {
        return this._botOptions[([...this.botSelector.options].filter(x => x.selected)[0].value * 1)];
    }
    set selectedBot(bot) {
        const index = this._botOptions.indexOf(bot);
        if (index >= 0) {
            for (const option of [...this.botSelector.options]) {
                option.selected = option.value == (index + "");
            }
            //this.updateBot();
        }
        else {
            throw new Error("Cannot find bot to select.");
        }
    }


    updateBot() {
        this.botSelectorLabel.data = this.selectedBot.description;
        if (typeof this.onBotChange == "function") {
            this.onBotChange();
        }
    }
    updateSpeed() {
        if (this.speedStopped) {
            this.speedControlLabel.data = "PAUSED";
        }
        else {
            const speed = Math.round(this.speedMilliseconds);
            this.speedControlLabel.data = speed + "ms";
        }
        
    }
}

export default GameControls;