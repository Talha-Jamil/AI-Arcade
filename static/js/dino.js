document.addEventListener("DOMContentLoaded", function() {
    // Canvas setup
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    
    // Game constants
    const GRAVITY = 0.8;
    const JUMP_VELOCITY = -16;
    const GROUND_HEIGHT = 50;
    const DINO_WIDTH = 50;
    const DINO_HEIGHT = 70;
    const OBSTACLE_WIDTH = 40;
    const OBSTACLE_MIN_HEIGHT = 40;
    const OBSTACLE_MAX_HEIGHT = 80;
    const OBSTACLE_MIN_SPACING = 450;
    const OBSTACLE_MAX_SPACING = 800;
    const CLOUD_WIDTH = 80;
    const CLOUD_HEIGHT = 40;
    
    // Game variables
    let gameStarted = false;
    let gameOver = false;
    let score = 0;
    let highScore = 0;
    let aiScore = 0;
    let generation = 0;
    let gameSpeed = 10;
    let gameMode = "player"; // player, ai, or both
    let animationFrameId = null;
    
    // Dino object
    const dino = {
        x: 100,
        y: canvas.height - GROUND_HEIGHT - DINO_HEIGHT,
        width: DINO_WIDTH,
        height: DINO_HEIGHT,
        velocity: 0,
        jumping: false,
        color: "#535353",
        
        draw: function() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillRect(this.x + this.width - 20, this.y - 20, 40, 30);
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(this.x + this.width + 5, this.y - 5, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = this.color;
            if (this.jumping) {
                ctx.fillRect(this.x + 10, this.y + this.height, 15, 20);
                ctx.fillRect(this.x + this.width - 25, this.y + this.height, 15, 20);
            } else {
                if (Math.floor(score / 5) % 2 === 0) {
                    ctx.fillRect(this.x + 10, this.y + this.height, 15, 20);
                    ctx.fillRect(this.x + this.width - 25, this.y + this.height - 20, 15, 20);
                } else {
                    ctx.fillRect(this.x + 10, this.y + this.height - 20, 15, 20);
                    ctx.fillRect(this.x + this.width - 25, this.y + this.height, 15, 20);
                }
            }
        },
        
        update: function() {
            this.velocity += GRAVITY;
            this.y += this.velocity;
            if (this.y > canvas.height - GROUND_HEIGHT - this.height) {
                this.y = canvas.height - GROUND_HEIGHT - this.height;
                this.velocity = 0;
                this.jumping = false;
            }
        },
        
        jump: function() {
            if (!this.jumping) {
                this.velocity = JUMP_VELOCITY;
                this.jumping = true;
            }
        },
        
        reset: function() {
            this.y = canvas.height - GROUND_HEIGHT - this.height;
            this.velocity = 0;
            this.jumping = false;
        }
    };
    
    // AI Dino object
    const aiDino = {
        x: 100,
        y: canvas.height - GROUND_HEIGHT - DINO_HEIGHT,
        width: DINO_WIDTH,
        height: DINO_HEIGHT,
        velocity: 0,
        jumping: false,
        color: "#FF6347",
        
        draw: function() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillRect(this.x + this.width - 20, this.y - 20, 40, 30);
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(this.x + this.width + 5, this.y - 5, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x + 10, this.y + this.height, 15, 20);
            ctx.fillRect(this.x + this.width - 25, this.y + this.height, 15, 20);
        },
        
        update: async function() {
            this.velocity += GRAVITY;
            this.y += this.velocity;
            if (this.y > canvas.height - GROUND_HEIGHT - this.height) {
                this.y = canvas.height - GROUND_HEIGHT - this.height;
                this.velocity = 0;
                this.jumping = false;
            }
            
            if (obstacles.length > 0) {
                let nextObstacle = null;
                for (let i = 0; i < obstacles.length; i++) {
                    if (obstacles[i].x + obstacles[i].width > this.x) {
                        nextObstacle = obstacles[i];
                        break;
                    }
                }
                
                if (nextObstacle && nextObstacle.x - this.x < 800) {
                    const distanceToObstacle = nextObstacle.x - this.x;
                    const heightOfObstacle = nextObstacle.height;
                    const currentSpeed = gameSpeed;
                    try {
                        const response = await fetch('/api/dino/action', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                game_state: [distanceToObstacle, heightOfObstacle, currentSpeed]
                            })
                        });
                        const data = await response.json();
                        console.log('AI action:', data); // Debug
                        if (data.action && !this.jumping) {
                            this.jump();
                        }
                    } catch (error) {
                        console.error('Error getting AI action:', error);
                    }
                }
            }
        },
        
        jump: function() {
            if (!this.jumping) {
                this.velocity = JUMP_VELOCITY;
                this.jumping = true;
            }
        },
        
        reset: function() {
            this.y = canvas.height - GROUND_HEIGHT - this.height;
            this.velocity = 0;
            this.jumping = false;
        }
    };
    
    // Obstacles array
    let obstacles = [];
    
    function createObstacle() {
        const height = Math.floor(Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT + 1)) + OBSTACLE_MIN_HEIGHT;
        obstacles.push({
            x: canvas.width,
            y: canvas.height - GROUND_HEIGHT - height,
            width: OBSTACLE_WIDTH,
            height: height,
            counted: false
        });
    }
    
    // Clouds array
    let clouds = [];
    
    function createCloud() {
        const y = Math.floor(Math.random() * (canvas.height / 2));
        clouds.push({
            x: canvas.width,
            y: y,
            width: CLOUD_WIDTH,
            height: CLOUD_HEIGHT
        });
    }
    
    function drawObstacles() {
        ctx.fillStyle = "#535353";
        for (let i = 0; i < obstacles.length; i++) {
            const obstacle = obstacles[i];
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            ctx.fillRect(obstacle.x + 10, obstacle.y - 10, 5, 20);
            ctx.fillRect(obstacle.x + 30, obstacle.y - 15, 5, 25);
        }
    }
    
    function drawClouds() {
        ctx.fillStyle = "white";
        for (let i = 0; i < clouds.length; i++) {
            const cloud = clouds[i];
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, 20, 0, Math.PI * 2);
            ctx.arc(cloud.x + 15, cloud.y - 10, 15, 0, Math.PI * 2);
            ctx.arc(cloud.x + 35, cloud.y, 20, 0, Math.PI * 2);
            ctx.arc(cloud.x + 50, cloud.y - 5, 15, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    function updateObstacles() {
        for (let i = 0; i < obstacles.length; i++) {
            const obstacle = obstacles[i];
            obstacle.x -= gameSpeed;
            if (!obstacle.counted && obstacle.x + obstacle.width < dino.x) {
                score++;
                obstacle.counted = true;
                updateScore();
                if (score > highScore) {
                    highScore = score;
                    const highScoreEl = document.getElementById("dino-high-score");
                    if (highScoreEl) highScoreEl.textContent = highScore;
                }
                if (score % 10 === 0) {
                    gameSpeed += 0.4;
                }
            }
            if (gameMode === "ai" || gameMode === "both") {
                if (!obstacle.counted && obstacle.x + obstacle.width < aiDino.x) {
                    aiScore++;
                    const aiScoreEl = document.getElementById("dino-ai-score");
                    if (aiScoreEl) aiScoreEl.textContent = aiScore;
                }
            }
            if (obstacle.x + obstacle.width < 0) {
                obstacles.splice(i, 1);
                i--;
            }
        }
        if (obstacles.length === 0 || 
            obstacles[obstacles.length - 1].x < canvas.width - 
            (Math.floor(Math.random() * (OBSTACLE_MAX_SPACING - OBSTACLE_MIN_SPACING + 1)) + OBSTACLE_MIN_SPACING)) {
            createObstacle();
        }
    }
    
    function updateClouds() {
        for (let i = 0; i < clouds.length; i++) {
            const cloud = clouds[i];
            cloud.x -= gameSpeed / 2;
            if (cloud.x + cloud.width < 0) {
                clouds.splice(i, 1);
                i--;
            }
        }
        if (clouds.length === 0 || 
            clouds[clouds.length - 1].x < canvas.width - 
            (Math.floor(Math.random() * 300) + 200)) {
            createCloud();
        }
    }
    
    function checkCollisions() {
        if (gameMode === "player" || gameMode === "both") {
            for (let i = 0; i < obstacles.length; i++) {
                const obstacle = obstacles[i];
                if (
                    dino.x < obstacle.x + obstacle.width &&
                    dino.x + dino.width > obstacle.x &&
                    dino.y < obstacle.y + obstacle.height &&
                    dino.y + dino.height > obstacle.y
                ) {
                    gameOver = true;
                }
            }
        }
        if (gameMode === "ai" || gameMode === "both") {
            for (let i = 0; i < obstacles.length; i++) {
                const obstacle = obstacles[i];
                if (
                    aiDino.x < obstacle.x + obstacle.width &&
                    aiDino.x + aiDino.width > obstacle.x &&
                    aiDino.y < obstacle.y + obstacle.height &&
                    aiDino.y + aiDino.height > obstacle.y
                ) {
                    aiDino.reset();
                    aiScore = 0;
                    const aiScoreEl = document.getElementById("dino-ai-score");
                    if (aiScoreEl) aiScoreEl.textContent = aiScore;
                    generation++;
                    const generationEl = document.getElementById("dino-generation");
                    if (generationEl) generationEl.textContent = generation;
                }
            }
        }
    }
    
    function updateScore() {
        const scoreEl = document.getElementById("dino-score");
        if (scoreEl) scoreEl.textContent = score;
    }
    
    function drawGround() {
        ctx.fillStyle = "#535353";
        ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);
        ctx.fillStyle = "#FFFFFF";
        for (let i = 0; i < canvas.width; i += 50) {
            ctx.fillRect(i, canvas.height - GROUND_HEIGHT + 20, 30, 2);
        }
    }
    
    function drawGameOver() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "48px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 50);
        ctx.font = "24px Arial";
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.font = "20px Arial";
        ctx.fillText("Press 'Start Game' to play again", canvas.width / 2, canvas.height / 2 + 100);
    }
    
    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#F7F7F7";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (gameStarted) {
            if (!gameOver) {
                if (gameMode === "player" || gameMode === "both") {
                    dino.update();
                }
                if (gameMode === "ai" || gameMode === "both") {
                    aiDino.update();
                }
                updateObstacles();
                updateClouds();
                checkCollisions();
            }
            drawClouds();
            drawGround();
            drawObstacles();
            if (gameMode === "player" || gameMode === "both") {
                dino.draw();
            }
            if (gameMode === "ai" || gameMode === "both") {
                aiDino.draw();
            }
            ctx.fillStyle = "#535353";
            ctx.font = "20px Arial";
            ctx.textAlign = "right";
            ctx.fillText(`Score: ${score}`, canvas.width - 20, 30);
            if (gameOver) {
                drawGameOver();
            }
        } else {
            ctx.fillStyle = "#535353";
            ctx.font = "48px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Chrome Dino Game", canvas.width / 2, canvas.height / 2 - 50);
            ctx.font = "24px Arial";
            ctx.fillText("Press 'Start Game' to play", canvas.width / 2, canvas.height / 2 + 50);
            drawGround();
            dino.draw();
        }
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    document.addEventListener("keydown", function(e) {
        if (e.code === "Space") {
            e.preventDefault();
            if (!gameStarted) {
                startGame();
            } else if (!gameOver && (gameMode === "player" || gameMode === "both")) {
                dino.jump();
            }
        }
    });
    
    canvas.addEventListener("click", function() {
        if (gameStarted && !gameOver && (gameMode === "player" || gameMode === "both")) {
            dino.jump();
        }
    });
    
    document.addEventListener("startDinoGame", function() {
        startGame();
    });
    
    document.addEventListener("resetDinoGame", function() {
        resetGame();
    });
    
    document.addEventListener("setDinoGameMode", function(e) {
        if (e.detail && e.detail.mode) {
            gameMode = e.detail.mode;
            console.log('Game mode set to:', gameMode); // Debug
        }
    });
    
    window.startGame = startGame;
    window.resetDinoGame = resetGame;
    window.setDinoGameMode = function(mode) {
        gameMode = mode;
        console.log('Game mode set to:', gameMode); // Debug
    };
    
    function startGame() {
        resetGame();
        gameStarted = true;
        gameOver = false;
        if (!animationFrameId) {
            gameLoop();
        }
    }
    
    function resetGame() {
        dino.reset();
        aiDino.reset();
        obstacles = [];
        clouds = [];
        score = 0;
        aiScore = 0;
        gameSpeed = 10;
        updateScore();
        const scoreEl = document.getElementById("dino-score");
        const aiScoreEl = document.getElementById("dino-ai-score");
        if (scoreEl) scoreEl.textContent = '0';
        if (aiScoreEl) aiScoreEl.textContent = '0';
        gameOver = false;
    }
    
    if (canvas) {
        for (let i = 0; i < 3; i++) {
            createCloud();
        }
        gameLoop();
    }
});