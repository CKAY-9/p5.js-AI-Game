const windowX = window.screen.width;
const windowY = window.screen.height;

// AI
let classifier;
// Model URL
let imageModelURL = "https://teachablemachine.withgoogle.com/models/-AfpM-uun/";
// Video
let video;
let flippedVideo;
// To store the classification
let label = "";

// Player
var playerX = windowX / 2;
var playerY = windowY / 2;
var playerSize = 20;
var playerSpeed = 7;

// Enemy
const enemyCount = 5;
let enemies = [];
class Enemy {
    x = 0;
    y = 0;
    size = 10;
    speed = 5;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    logic() {
        this.x += random(0, 5) * this.speed;
        this.y += random(0, 5) * this.speed;

        if (this.y < 0) {
            this.y = windowY - 10;
        }
        if (this.y > (windowY + 10)) {
            this.y = 0;
        }
        // X Swap
        if (this.x < 0) {
            this.x = windowX - 10;
        }
        if (this.x > (windowX + 10)) {
            this.x = 0;
        }

        // Collision logic
        if (
            this.x < playerX + playerSize &&
            this.x + this.size > playerX &&
            this.y < playerY + playerSize &&
            this.y + this.size > playerY
        ) {
            gameoverFlag = true;
            fill(0, 255, 0);
        } else {
            fill(255, 0, 0);
        }
        square(this.x, this.y, this.size);
    }
}

// Game Logic
let gameoverFlag = false;
let timer = 0;

// Load the model first
function preload() {
    classifier = ml5.imageClassifier(imageModelURL + "model.json");
}

function setup() {
    removeElements();
    createCanvas(windowX, windowY);
    video = createCapture(video);
    video.size(320, 240);
    video.hide();

    flippedVideo = ml5.flipImage(video);
    // Start classifying
    classifyVideo();

    startGame();

    setInterval(() => {
        if (gameoverFlag) return;
        timer++;
        document.getElementById("time-survived").textContent = "Time Survived: " + timer;
    }, 1000);
}

function startGame() {
    enemies = [];
    gameoverFlag = false;
    playerY = windowY / 2;
    playerX = windowX / 2;
    timer = 0;

    // DOM Elements
    if (document.getElementById("retry-button") !== null)
        document.getElementById("retry-button").remove();
    if (document.getElementById("gameover-text") !== null)
        document.getElementById("gameover-text").remove();

        
    document.getElementById("time-survived").classList.remove("time-survived-over");
    document.getElementById("time-survived").classList.add("time-survived");

    for (let i = 0; i < enemyCount; i++) {
        let xRand = random(0, windowX);
        let yRand = random(0, windowY);
        enemies.push(new Enemy(xRand, yRand));
    }
}

function draw() {
    clear();

    // Main Gameloop
    if (!gameoverFlag) {
        // Draw the video
        tint(255, 255, 255, 100)
        image(flippedVideo, 0, 0);

        // Draw the label
        fill(255);
        textSize(16);
        textAlign(CENTER);
        text(label, windowX / 2, windowY * 0.9);

        square(playerX, playerY, playerSize);

        for (let i = 0; i < enemies.length; i++) {
            enemies[i].logic();
            console.log(enemies[i].x)
        }

        switch (label) {
            case "up":
                playerY -= playerSpeed;
                break;
            case "down":
                playerY += playerSpeed;
                break;
            case "left":
                playerX -= playerSpeed;
                break;
            case "right":
                playerX += playerSpeed;
                break;
            default:
                break;
        }

        // Y Swap
        if (playerY < 0) {
            playerY = windowY - 10;
        }
        if (playerY > (windowY + 10)) {
            playerY = 0;
        }
        // X Swap
        if (playerX < 0) {
            playerX = windowX - 10;
        }
        if (playerX > (windowX + 10)) {
            playerX = 0;
        }
    } else { 
        // Game Over
        if (document.getElementById("gameover-text") === null) {
            let gameoverText = createDiv("GAME OVER");
            gameoverText.id("gameover-text");
        
            let button = createButton("Retry");
            button.id("retry-button");
            button.position((windowX / 2), (windowY / 2) + 12);
            button.mousePressed(startGame);
    
            document.getElementById("time-survived").classList.remove("time-survived");
            document.getElementById("time-survived").classList.add("time-survived-over");
        }
    }
}

// Get a prediction for the current video frame
function classifyVideo() {
    flippedVideo = ml5.flipImage(video)
    classifier.classify(flippedVideo, gotResult);
    flippedVideo.remove();
}

// When we get a result
function gotResult(error, results) {
    if (error) {
        console.error(error);
        return;
    }
    // The results are in an array ordered by confidence.
    // console.log(results[0]);
    label = results[0].label.toLowerCase();
    // Classifiy again!
    classifyVideo();
}