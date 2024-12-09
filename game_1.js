const canvas = document.getElementById('gameCanvas');
canvas.width = 400;  // Match the width in your CSS
canvas.height = 400; // Match the height in your CSS
const ctx = canvas.getContext('2d');

const scale = 20;
const rows = canvas.height / scale;
const columns = canvas.width / scale;

let snake;
let food;
let lastRenderTime = 0;
let gameOver = false;
let frameRate = 10; // Frames per second
let currentScore = 0;
let topScore = localStorage.getItem('topScore') || 0;

document.getElementById('topScore').textContent = topScore;

(function setup() {
    snake = new Snake();
    food = new Food();
    food.pickLocation();
    window.requestAnimationFrame(main);
}());

function main(currentTime) {
    if (gameOver) {
        if (currentScore > topScore) {
            localStorage.setItem('topScore', currentScore);
            topScore = currentScore;
            document.getElementById('topScore').textContent = topScore;
        }
        if (confirm("Game Over! Click OK to restart.")) {
            document.location.reload();
        }
        return;
    }

    window.requestAnimationFrame(main);
    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
    if (secondsSinceLastRender < 1 / frameRate) return;

    lastRenderTime = currentTime;

    update();
    draw();
}

function update() {
    snake.update();
    if (snake.eat(food)) {
        food.pickLocation();
        frameRate *= 1.05; // Gradually increase the frame rate as the snake speeds up
        currentScore++;
        document.getElementById('currentScore').textContent = currentScore;
    }
    if (snake.checkCollision() || snake.checkBorderCollision()) {
        gameOver = true;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    food.draw();
    snake.draw();
}

function Snake() {
    this.x = 0;
    this.y = 0;
    this.xSpeed = scale * 1;
    this.ySpeed = 0;
    this.total = 0;
    this.tail = [];

    this.draw = function() {
        // Draw the head of the snake in a different color
        ctx.fillStyle = "#F39C12"; // Slightly different color for the head
        ctx.fillRect(this.x, this.y, scale, scale);

        // Draw the rest of the snake
        ctx.fillStyle = "#F4D03F"; // Original color for the body
        for (let i = 0; i < this.tail.length; i++) {
            ctx.fillRect(this.tail[i].x, this.tail[i].y, scale, scale);
        }
    };

    this.update = function() {
        for (let i = 0; i < this.tail.length - 1; i++) {
            this.tail[i] = this.tail[i + 1];
        }

        if (this.total >= 1) {
            this.tail[this.total - 1] = { x: this.x, y: this.y };
        }

        this.x += this.xSpeed;
        this.y += this.ySpeed;

        // Check for border collision
        if (this.x >= canvas.width || this.y >= canvas.height || this.x < 0 || this.y < 0) {
            this.total = 0; // Reset snake length
            this.tail = []; // Clear the tail
            return true; // Signal game over
        }
    };

    this.changeDirection = function(direction) {
        switch(direction) {
            case 'Up':
                if (this.ySpeed === 0) {
                    this.xSpeed = 0;
                    this.ySpeed = -scale * 1;
                }
                break;
            case 'Down':
                if (this.ySpeed === 0) {
                    this.xSpeed = 0;
                    this.ySpeed = scale * 1;
                }
                break;
            case 'Left':
                if (this.xSpeed === 0) {
                    this.xSpeed = -scale * 1;
                    this.ySpeed = 0;
                }
                break;
            case 'Right':
                if (this.xSpeed === 0) {
                    this.xSpeed = scale * 1;
                    this.ySpeed = 0;
                }
                break;
        }
    };

    this.eat = function(food) {
        if (this.x === food.x && this.y === food.y) {
            this.total++;
            return true;
        }
        return false;
    };

    this.checkCollision = function() {
        for (let i = 0; i < this.tail.length; i++) {
            if (this.x === this.tail[i].x && this.y === this.tail[i].y) {
                return true; // Collision detected
            }
        }
        return false;
    };

    this.checkBorderCollision = function() {
        return this.x >= canvas.width || this.y >= canvas.height || this.x < 0 || this.y < 0;
    };
}

function Food() {
    this.x;
    this.y;

    this.pickLocation = function() {
        let locationOk = false;
        while (!locationOk) {
            locationOk = true;
            this.x = (Math.floor(Math.random() * columns) * scale);
            this.y = (Math.floor(Math.random() * rows) * scale);

            // Check if the new food location is on the snake's body
            for (let i = 0; i < snake.tail.length; i++) {
                if (this.x === snake.tail[i].x && this.y === snake.tail[i].y) {
                    locationOk = false;
                    break;
                }
            }
        }
    };

    this.draw = function() {
        ctx.fillStyle = "#C0392B";
        ctx.fillRect(this.x, this.y, scale, scale);
    };
}

window.addEventListener('keydown', (evt) => {
    const direction = evt.key.replace('Arrow', '');
    snake.changeDirection(direction);
});

document.getElementById('resetScoreButton').addEventListener('click', function() {
    localStorage.setItem('topScore', 0);
    document.getElementById('topScore').textContent = '0';
    alert('Top score has been reset to 0.');
});

document.getElementById('homeButton').addEventListener('click', function() {
    window.location.href = 'index.html'; // Redirect to the home page or another URL
});

