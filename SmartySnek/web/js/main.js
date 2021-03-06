import HTMLGameMap from "./render/HTMLGameMap.js";
import GameMap from "./game/GameMap.js";
import Snake from "./game/Snake.js";
import Game from "./game/Game.js";
//import KeyboardController from "./game/bots/impls/KeyboardController.js";
import TurnRightBot from "./game/bots/impls/TurnRightBot.js";
import GameControls from "./render/GameControls.js";
import LucaBot from "./game/bots/impls/LucaBot.js";
import KeyboardController from "./game/bots/impls/KeyboardController.js";
import SweepBot from "./game/bots/impls/SweepBot.js";
import SnakeController from "./game/bots/SnakeController.js";
import FoodSeeker from "./game/bots/impls/FoodSeeker.js";
import AStarBot from "./game/bots/impls/AStarBot.js";
import JSONSerializer from "./serialization/JSONSerializer.js";

let game = new Game();
window.game = game;
const renderer = new HTMLGameMap();
window.renderer = renderer;
renderer.map = game.map;
window.map = game.map;
window.snake = game.snake;
renderer.update();

const controls = new GameControls();

window.JSONSerializer = JSONSerializer;

/** @type {SnakeController[]} **/
const bots = [new KeyboardController(), new LucaBot(), new TurnRightBot(), new SweepBot(), new FoodSeeker(), new AStarBot()];
controls.botOptions = bots;
controls.onBotChange = () => { game.controller = controls.selectedBot };
//controls.selectedBot = bots[1];


document.querySelector("body").append(controls.html, renderer.html, renderer.floatingTooltip);
game.controller = controls.selectedBot;

const snapshots = [];

let lastSleep = performance.now();
async function gameSleep(delay) {
    if (performance.now() - lastSleep > 1000) {
        delay = 20;
    }
    if (delay >= 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        lastSleep = performance.now();
    }
}

(async () => {
    await gameSleep(1000);
    let crash = false;
    while (!crash) {
        game.reset();
        while (!crash) {
            let play = true;
            let delay = controls.speedMilliseconds;
            if (controls.speedStopped) {
                play = false;
                delay = 400;
            }

            let stepDelay = delay / 2;

            try {
                const start = performance.now();
                if (play)
                    game.controlSnake();
                stepDelay = stepDelay - (performance.now() - start);
                //console.log("Duration of bot step: ", performance.now() - start);
                //console.log("Remaining delay: ", stepDelay);

            }
            catch (e) {
                renderer.update();
                console.error("Exception crashed game while bot was operating.");
                console.trace(e);
                crash = true;
                return;
            }

            renderer.update();
            if (stepDelay >= 1)
                await gameSleep(stepDelay);
            try {
                if (play) {
                    game.step();
                    try {
                        const ser = new JSONSerializer(false);
                        snapshots.push(ser.transferField(game));
                        if (snapshots.length > 20) {
                            //snapshots.shift();
                            //console.log("Deletig snapshots: ", 0, snapshots.length - 5);
                            snapshots.splice(0, snapshots.length - 20);
                        }
                    }
                    catch (e) {
                        console.error("Cannot serialize game!");
                        console.trace(e);
                    }
                }
                    

            }
            catch (e) {
                renderer.update();
                console.error("Exception crashed game during game internal step.");
                console.trace(e);
                crash = true;
                return;
            }
            renderer.update();
            if (game.snake.dead) {
                controls.speedMilliseconds = controls.slowestSpeed;
                const ser = new JSONSerializer(true);
                ser.data = snapshots[0];
                snapshots.push(snapshots[0]);
                game = ser.transferField();
                renderer.map = game.map;
                window.map = game.map;
                window.snake = game.snake;
                window.game = game;
                renderer.update();
                await gameSleep(1000);
                //break;
            }
            if (delay >= 2)
                await gameSleep(delay / 2);
        }
        await gameSleep(1000);
    }

})();

window.testSerialization = function() {
    const ser1 = new JSONSerializer(false);
    const serialized = ser1.transferField(game);
    const ser2 = new JSONSerializer(true);
    ser2.data = serialized;
    const deserialized = ser2.transferField();
    return { serialized, deserialized };
}

//setInterval(() => { snake.orientation.rotateLeft(); }, 4000);

//let turnLeft = false;
//let turnRight = false;

//window.addEventListener("keydown", (event) => {
//    if (event.keyCode == 37) {
//        snake.turnLeft();
//    }
//    if (event.keyCode == 39) {
//        snake.turnRight();
//    }
//    //if (event.keyCode == 38) {
//    //    snake.moveForward();
//    //}
//    renderer.update();
//});


//window.addEventListener("keyup", (event) => {
//    if (event.keyCode == 37) {
//        turnLeft = false;
//    }
//    if (event.keyCode == 39) {
//        turnRight = false;
//    }
//});