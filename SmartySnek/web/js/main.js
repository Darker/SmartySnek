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

const game = new Game();
window.game = game;
const renderer = new HTMLGameMap();
window.renderer = renderer;
renderer.map = game.map;
window.map = game.map;
game.snake.placeSnake();
window.snake = game.snake;
renderer.update();

const controls = new GameControls();

/** @type {SnakeController[]} **/
const bots = [new LucaBot(), new KeyboardController(), new TurnRightBot(), new SweepBot(), new FoodSeeker()];
controls.botOptions = bots;
controls.onBotChange = () => { game.controller = controls.selectedBot };
controls.selectedBot = bots[1];


document.querySelector("body").append(controls.html, renderer.html, renderer.floatingTooltip);
game.controller = controls.selectedBot;

(async () => {
    while (true) {
        game.controlSnake();
        renderer.update();
        await new Promise((resolve) => setTimeout(resolve, controls.speedMilliseconds));
        game.step();
        renderer.update();
        await new Promise((resolve) => setTimeout(resolve, controls.speedMilliseconds));
    }
})();

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