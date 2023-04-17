const windowX = 400;
const windowY = 400;

// AI
let classifier;
// Model URL
let imageModelURL = "https://teachablemachine.withgoogle.com/models/nNpmX3_UT/";
// Video
let video;
let flippedVideo;
// To store the classification
let label = "";

// Player
var playerX = 200;
var playerY = 200;
var playerSize = 20;

// Enemy
const enemyCount = 15;
let enemies = [];

// Game Logic
let gameoverFlag = false;

class Enemy {
    x = 0;
    y = 0;
    size = 10;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    logic() {
        this.x += random(-5, 5);
        this.y += random(-5, 5);

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

// Load the model first
function preload() {
    classifier = ml5.imageClassifier(imageModelURL + "model.json");
}

function setup() {
    enemies = [];
    gameoverFlag = false;
    playerY = 200;
    playerX = 200;
    removeElements();
    createCanvas(windowX, windowY);
    video = createCapture(video);
    video.size(320, 240);
    video.hide();

    flippedVideo = ml5.flipImage(video);
    // Start classifying
    classifyVideo();

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
        image(flippedVideo, 0, 0);

        // Draw the label
        fill(255);
        textSize(16);
        textAlign(CENTER);
        text(label, windowX / 2, windowY - 4);

        square(playerX, playerY, playerSize);

        for (let i = 0; i < enemies.length; i++) {
            enemies[i].logic();
            console.log(enemies[i].x)
        }

        switch (label) {
            case "up":
                playerY--;
                break;
            case "down":
                playerY++;
                break;
            case "left":
                playerX--;
                break;
            case "right":
                playerX++;
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
        textSize(24);
        textAlign(CENTER);
        text("GAME OVER", (windowX / 2) - 12, (windowY / 2) - 12);
    
        let button = createButton("Retry");
        button.id("retryButton");
        button.position((windowX / 2), (windowY / 2) + 12);
        button.mousePressed(setup);
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