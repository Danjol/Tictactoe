import { print, askQuestion } from "./io.mjs";
import { ANSI } from "./ansi.mjs";
import DICTIONARY from "./language.mjs";
import showSplashScreen from "./splash.mjs";

const GAME_BOARD_SIZE = 3;
const PLAYER_1 = 1;
const PLAYER_2 = -1;
const EMPTY = 0;
const DRAW = "draw";
const COMPUTER = 2;

// These are the valid choices for the menu.
const MENU_CHOICES = {
    START_GAME: 1,
    SETTINGS: 3,
    EXIT_GAME: 4,
    PLAYER_VS_COMPUTER: 2
};

let language = DICTIONARY.en;
let gameboard;
let currentPlayer;
let isComputerPlaying = false;

clearScreen();
showSplashScreen();
setTimeout(start, 2500); // This waites 2.5seconds before calling the function. i.e. we get to see the splash screen for 2.5 seconds before the menue takes over. 

async function start() {
    let chosenAction;
    do {
        chosenAction = await showMenu();
        if (chosenAction == MENU_CHOICES.START_GAME) {
            isComputerPlaying = false;
            await runGame();
        } else if (chosenAction == MENU_CHOICES.PLAYER_VS_COMPUTER) {
            isComputerPlaying = true;
            await runGame();
        } else if (chosenAction == MENU_CHOICES.SETTINGS) {
            await showSettings();
        } else if (chosenAction == MENU_CHOICES.EXIT_GAME) {
            clearScreen();
            process.exit();
        }
    } while (true);
}

async function runGame() {
    
    let isPlaying = true;
    
    while (isPlaying) { // Do the following until the player dos not want to play anymore. 
        initializeGame(); // Reset everything related to playing the game
        isPlaying = await playGame(); // run the actual game 
    }
}

async function showMenu() {
    
    // Display our menu to the player.
    clearScreen();
    print(ANSI.COLOR.YELLOW + language.MENU.TITLE + ANSI.RESET);
    print(language.MENU.PLAY_GAME);
    print(language.MENU.PLAY_VERSUS_COMPUTER);
    print(language.MENU.SETTINGS);
    print(language.MENU.EXIT);
    
    // Wait for the choice.
    let choice = await askQuestion("");
    return Number(choice);
}

async function playGame() {
    // Play game..
    let outcome;
    do {
        clearScreen();
        showGameBoardWithCurrentState();
        showHUD();
        let move;
        if (isComputerPlaying && currentPlayer == PLAYER_2) {
            move = getRandomMove();
        } else {
            move = await getGameMoveFromtCurrentPlayer();
        }
        updateGameBoardState(move);
        outcome = evaluateGameState();
        changeCurrentPlayer();
    } while (outcome == 0);

    showGameSummary(outcome);

    return await askWantToPlayAgain();
}

async function askWantToPlayAgain() {
    let answer = await askQuestion(language.PLAY_AGAIN_QUESTION);
    return answer && answer.toLowerCase()[0] == language.CONFIRM;
}

function showGameSummary(outcome) {
    clearScreen();
    if (outcome == DRAW) {
        print(language.DRAW_MESSAGE);
    } else {
        let winningPlayer = outcome > 0 ? "1" : "2";
        print(language.WINNER_MESSAGE + winningPlayer);
    }
    showGameBoardWithCurrentState();
    print(language.GAME_OVER);
}

function changeCurrentPlayer() {
    currentPlayer *= -1;
}

function evaluateGameState() {
    let state = checkRowsAndCols() || checkDiagonals();
    if (state) {
        return state / GAME_BOARD_SIZE;
    }
    if (isBoardFull()) {
        return DRAW;
    }
    return 0;
}

function checkRowsAndCols() {
    for (let i = 0; i < GAME_BOARD_SIZE; i++) {
        const rowSum = gameboard[i].reduce((a, b) => a + b);
        const colSum = gameboard.reduce((a, b) => a + b[i], 0);

        if (rowSum === GAME_BOARD_SIZE || rowSum === -GAME_BOARD_SIZE) {
            return gameboard[i][0] * GAME_BOARD_SIZE;
        }
        if (colSum === GAME_BOARD_SIZE || colSum === -GAME_BOARD_SIZE) {
            return gameboard[0][i] * GAME_BOARD_SIZE;
        }
    }
    return 0;
}

function checkDiagonals() {
    let diag1 = 0, diag2 = 0;
    for (let i = 0; i < GAME_BOARD_SIZE; i++) {
        diag1 += gameboard[i][i];
        diag2 += gameboard[i][GAME_BOARD_SIZE - i - 1];
    }
    if (diag1 === GAME_BOARD_SIZE || diag1 === -GAME_BOARD_SIZE) {
        return diag1;
    }
    if (diag2 === GAME_BOARD_SIZE || diag2 === -GAME_BOARD_SIZE) {
        return diag2;
    }
    return 0;
}


function isBoardFull() {
    return gameboard.every(row => row.every(cell => cell !== EMPTY));
}

async function getGameMoveFromtCurrentPlayer() {
    let move;
    do {
        let input = await askQuestion(language.PLACE_MARK_QUESTION);
        move = input.split(' ').map(Number);
    } while (!isValidPositionOnBoard(move));
    return move;
}

function getRandomMove() {
    let emptyCells = [];
    for (let i = 0; i < GAME_BOARD_SIZE; i++) {
        for (let j = 0; j < GAME_BOARD_SIZE; j++) {
            if (gameboard[i][j] == EMPTY) {
                emptyCells.push([i + 1, j + 1]);
            }
        }
    }
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function isValidPositionOnBoard(position) {
    let row = position[0] - 1;
    let col = position[1] - 1;
    return row >= 0 && row < GAME_BOARD_SIZE && col >= 0 && col < GAME_BOARD_SIZE && gameboard[row][col] == EMPTY;
}

function updateGameBoardState(position) {
    let row = position[0] - 1;
    let col = position[1] - 1;
    gameboard[row][col] = currentPlayer;
}

function initializeGame() {
    currentPlayer = PLAYER_1;
    gameboard = Array.from({ length: GAME_BOARD_SIZE }, () => Array(GAME_BOARD_SIZE).fill(EMPTY));
}

function showHUD() {
    print(`Player ${currentPlayer == PLAYER_1 ? '1 (X)' : '2 (O)'}`);
}

function showGameBoardWithCurrentState() {
    for (let row of gameboard) {
        let rowOutput = row.map(cell => {
            if (cell == PLAYER_1) return ANSI.COLOR.GREEN + 'X' + ANSI.RESET;
            if (cell == PLAYER_2) return ANSI.COLOR.RED + 'O' + ANSI.RESET;
            return '_';
        }).join(' ');
        print(rowOutput);
    }
}

function clearScreen() {
    print(ANSI.CLEAR_SCREEN);
}

async function showSettings() {
    clearScreen();
    print(ANSI.COLOR.YELLOW + language.MENU.TITLE + ANSI.RESET);
    print(language.MENU.SETTINGS_LANGUAGE);
    print(language.MENU.SETTINGS_BACK);
    let choice = await askQuestion("");
    if (choice == "1") {
        await changeLanguage();
    }
}

async function changeLanguage() {
    clearScreen();
    print("1. English");
    print("2. Norwegian");
    print("3. Spanish");
    let choice = await askQuestion("");
    if (choice == "1") {
        language = DICTIONARY.en;
    } else if (choice == "2") {
        language = DICTIONARY.no;
    } else if (choice == "3") {
        language = DICTIONARY.es;
    }
}

//#endregion