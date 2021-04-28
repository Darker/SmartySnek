import GameMap from "../web/js/game/GameMap.js";
import Snake from "../web/js/game/Snake.js";
import Game from "../web/js/game/Game.js";
//import KeyboardController from "../web/js/game/bots/impls/KeyboardController.js";
import TurnRightBot from "../web/js/game/bots/impls/TurnRightBot.js";
import LucaBot from "../web/js/game/bots/impls/LucaBot.js";
import KeyboardController from "../web/js/game/bots/impls/KeyboardController.js";
import SweepBot from "../web/js/game/bots/impls/SweepBot.js";
import SnakeController from "../web/js/game/bots/SnakeController.js";
import FoodSeeker from "../web/js/game/bots/impls/FoodSeeker.js";
import AStarBot from "../web/js/game/bots/impls/AStarBot.js";

const game = new Game();
game.snake.placeSnake();

/** @type {SnakeController[]} **/
const bots = [new LucaBot(), new KeyboardController(), new TurnRightBot(), new SweepBot(), new FoodSeeker(), new AStarBot()];

game.controller = bots[5];

(async () => {
    while (true) {
        let play = true;
        let delay = 0;

        try {
            if (play)
                game.controlSnake();
        }
        catch (e) {
            console.error("Exception crashed game while bot was operating.");
            console.trace(e);
            return;
        }
        if(delay > 0)
            await new Promise((resolve) => setTimeout(resolve, delay / 2));
        try {
            if (play)
                game.step();
        }
        catch (e) {
            console.error("Exception crashed game during game internal step.");
            console.trace(e);
            return;
        }
        if(delay > 0)
            await new Promise((resolve) => setTimeout(resolve, delay / 2));
        if (game.snake.dead) {
            return;
        }
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