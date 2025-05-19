// Chrome Dino Game Implementation
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
        color: "#535353", // Dark gray for player dino
        
        draw: function() {
            ctx.fillStyle = this.color;
            
            // Draw dino body
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Draw dino head
            ctx.fillRect(this.x + this.width - 20, this.y - 20, 40, 30);
            
            // Draw dino eye
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(this.x + this.width + 5, this.y - 5, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw dino legs
            ctx.fillStyle = this.color;
            if (this.jumping) {
                // Both legs up when jumping
                ctx.fillRect(this.x + 10, this.y + this.height, 15, 20);
                ctx.fillRect(this.x + this.width - 25, this.y + this.height, 15, 20);
            } else {
                // Alternate legs when running (based on score for animation)
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
            // Apply gravity
            this.velocity += GRAVITY;
            this.y += this.velocity;
            
            // Ground collision
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
        color: "#FF6347", // Tomato color for AI dino
        
        draw: function() {
            ctx.fillStyle = this.color;
            
            // Draw dino body
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Draw dino head
            ctx.fillRect(this.x + this.width - 20, this.y - 20, 40, 30);
            
            // Draw dino eye
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(this.x + this.width + 5, this.y - 5, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw dino legs
            ctx.fillStyle = this.color;
            // Always draw legs in "up" position (same as jumping) - FIXED
            ctx.fillRect(this.x + 10, this.y + this.height, 15, 20);
            ctx.fillRect(this.x + this.width - 25, this.y + this.height, 15, 20);
        },
        
        update: function() {
            // Apply gravity
            this.velocity += GRAVITY;
            this.y += this.velocity;
            
            // Ground collision
            if (this.y > canvas.height - GROUND_HEIGHT - this.height) {
                this.y = canvas.height - GROUND_HEIGHT - this.height;
                this.velocity = 0;
                this.jumping = false;
            }
            
            // AI decision making
            if (obstacles.length > 0) {
                // Find the next obstacle
                let nextObstacle = null;
                for (let i = 0; i < obstacles.length; i++) {
                    if (obstacles[i].x + obstacles[i].width > this.x) {
                        nextObstacle = obstacles[i];
                        break;
                    }
                }
                
                if (nextObstacle) {
                    // Calculate inputs for AI
                    const distanceToObstacle = (nextObstacle.x - this.x) / canvas.width;
                    const heightOfObstacle = nextObstacle.height / canvas.height;
                    const currentSpeed = gameSpeed / 20;
                    
                    // Call the AI API to get the action
                    if (nextObstacle.x - this.x < 200 && !this.jumping) {
                        // For now, use a simple heuristic
                        // In a real implementation, this would call the AI model
                        this.jump();
                        
                        // Simulate API call to get AI action
                        fetch('/api/dino/action', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                game_state: [distanceToObstacle * 100, heightOfObstacle * 50, currentSpeed * 20]
                            }),
                        })
                        .then(response => response.json())
                        .then(data => {
                            // In a real implementation, we would use this action
                            console.log('AI action:', data.action);
                        })
                        .catch(error => {
                            console.error('Error getting AI action:', error);
                        });
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
    
    // Create a new obstacle
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
    
    // Create a new cloud
    function createCloud() {
        const y = Math.floor(Math.random() * (canvas.height / 2));
        
        clouds.push({
            x: canvas.width,
            y: y,
            width: CLOUD_WIDTH,
            height: CLOUD_HEIGHT
        });
    }
    
    // Draw obstacles
    function drawObstacles() {
        ctx.fillStyle = "#535353"; // Dark gray for obstacles
        
        for (let i = 0; i < obstacles.length; i++) {
            const obstacle = obstacles[i];
            
            // Draw cactus
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Draw cactus details (spikes)
            ctx.fillRect(obstacle.x + 10, obstacle.y - 10, 5, 20);
            ctx.fillRect(obstacle.x + 30, obstacle.y - 15, 5, 25);
        }
    }
    
    // Draw clouds
    function drawClouds() {
        ctx.fillStyle = "white";
        
        for (let i = 0; i < clouds.length; i++) {
            const cloud = clouds[i];
            
            // Draw cloud
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, 20, 0, Math.PI * 2);
            ctx.arc(cloud.x + 15, cloud.y - 10, 15, 0, Math.PI * 2);
            ctx.arc(cloud.x + 35, cloud.y, 20, 0, Math.PI * 2);
            ctx.arc(cloud.x + 50, cloud.y - 5, 15, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Update obstacles
    function updateObstacles() {
        for (let i = 0; i < obstacles.length; i++) {
            const obstacle = obstacles[i];
            
            // Move obstacle
            obstacle.x -= gameSpeed;
            
            // Check if dino passed the obstacle
            if (!obstacle.counted && obstacle.x + obstacle.width < dino.x) {
                score++;
                obstacle.counted = true;
                updateScore();
                
                if (score > highScore) {
                    highScore = score;
                    document.getElementById("dino-high-score").textContent = highScore;
                }
                
                // Increase game speed
                if (score % 10 === 0) {
                    gameSpeed += 0.4;
                }
            }
            
            // Check if AI dino passed the obstacle
            if (gameMode === "ai" || gameMode === "both") {
                if (!obstacle.counted && obstacle.x + obstacle.width < aiDino.x) {
                    aiScore++;
                    document.getElementById("dino-ai-score").textContent = aiScore;
                }
            }
            
            // Remove obstacle if it's off screen
            if (obstacle.x + obstacle.width < 0) {
                obstacles.splice(i, 1);
                i--;
            }
        }
        
        // Add new obstacle when needed
        if (obstacles.length === 0 || 
            obstacles[obstacles.length - 1].x < canvas.width - 
            (Math.floor(Math.random() * (OBSTACLE_MAX_SPACING - OBSTACLE_MIN_SPACING + 1)) + OBSTACLE_MIN_SPACING)) {
            createObstacle();
        }
    }
    
    // Update clouds
    function updateClouds() {
        for (let i = 0; i < clouds.length; i++) {
            const cloud = clouds[i];
            
            // Move cloud (slower than obstacles)
            cloud.x -= gameSpeed / 2;
            
            // Remove cloud if it's off screen
            if (cloud.x + cloud.width < 0) {
                clouds.splice(i, 1);
                i--;
            }
        }
        
        // Add new cloud when needed
        if (clouds.length === 0 || 
            clouds[clouds.length - 1].x < canvas.width - 
            (Math.floor(Math.random() * 300) + 200)) {
            createCloud();
        }
    }
    
    // Check collisions
    function checkCollisions() {
        // Player dino collisions
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
        
        // AI dino collisions (only for visualization, doesn't end game)
        if (gameMode === "ai" || gameMode === "both") {
            for (let i = 0; i < obstacles.length; i++) {
                const obstacle = obstacles[i];
                
                if (
                    aiDino.x < obstacle.x + obstacle.width &&
                    aiDino.x + aiDino.width > obstacle.x &&
                    aiDino.y < obstacle.y + obstacle.height &&
                    aiDino.y + aiDino.height > obstacle.y
                ) {
                    // AI collision handling
                    aiDino.reset();
                    aiScore = 0;
                    document.getElementById("dino-ai-score").textContent = aiScore;
                    generation++;
                    document.getElementById("dino-generation").textContent = generation;
                }
            }
        }
    }
    
    // Update score display
    function updateScore() {
        document.getElementById("dino-score").textContent = score;
    }
    
    // Draw ground
    function drawGround() {
        ctx.fillStyle = "#535353"; // Dark gray for ground
        ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);
        
        // Draw ground details
        ctx.fillStyle = "#FFFFFF"; // White for ground details
        for (let i = 0; i < canvas.width; i += 50) {
            ctx.fillRect(i, canvas.height - GROUND_HEIGHT + 20, 30, 2);
        }
    }
    
    // Draw game over screen
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
    
    // Game loop
    function gameLoop() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background (sky)
        ctx.fillStyle = "#F7F7F7"; // Light gray for sky
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (gameStarted) {
            // Update game objects
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
            
            // Draw clouds
            drawClouds();
            
            // Draw ground
            drawGround();
            
            // Draw obstacles
            drawObstacles();
            
            // Draw dinos
            if (gameMode === "player" || gameMode === "both") {
                dino.draw();
            }
            
            if (gameMode === "ai" || gameMode === "both") {
                aiDino.draw();
            }
            
            // Draw score
            ctx.fillStyle = "#535353"; // Dark gray for score
            ctx.font = "20px Arial";
            ctx.textAlign = "right";
            ctx.fillText(`Score: ${score}`, canvas.width - 20, 30);
            
            // Draw game over screen
            if (gameOver) {
                drawGameOver();
            }
        } else {
            // Draw title screen
            ctx.fillStyle = "#535353"; // Dark gray for title
            ctx.font = "48px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Chrome Dino Game", canvas.width / 2, canvas.height / 2 - 50);
            
            ctx.font = "24px Arial";
            ctx.fillText("Press 'Start Game' to play", canvas.width / 2, canvas.height / 2 + 50);
            
            // Draw ground
            drawGround();
            
            // Draw dino
            dino.draw();
        }
        
        // Continue game loop
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    // Event listeners
    document.addEventListener("keydown", function(e) {
        if (e.code === "Space") {
            e.preventDefault(); // This stops the page from scrolling/refreshing
            
            if (!gameStarted) {
                startGame(); // Space starts the game if not started
            } else if (!gameOver && (gameMode === "player" || gameMode === "both")) {
                dino.jump(); // Space makes dino jump during gameplay
            }
        }
    });
    
    canvas.addEventListener("click", function() {
        if (gameStarted && !gameOver && (gameMode === "player" || gameMode === "both")) {
            dino.jump();
        }
    });
    
    // Listen for custom events from dino_visualization.js
    document.addEventListener("startDinoGame", function() {
        startGame();
    });
    
    document.addEventListener("resetDinoGame", function() {
        resetGame();
    });
    
    document.addEventListener("setDinoGameMode", function(e) {
        if (e.detail && e.detail.mode) {
            gameMode = e.detail.mode;
        }
    });
    
    // Expose functions to window for dino_visualization.js to access
    window.startGame = startGame;
    window.resetDinoGame = resetGame;
    window.setDinoGameMode = function(mode) {
        gameMode = mode;
    };
    
    // Function to start the game
    function startGame() {
        // Reset game state
        resetGame();
        
        // Start the game
        gameStarted = true;
        gameOver = false;
        
        // Start game loop if not already running
        if (!animationFrameId) {
            gameLoop();
        }
    }
    
    // Reset game
    function resetGame() {
        dino.reset();
        aiDino.reset();
        obstacles = [];
        clouds = [];
        score = 0;
        aiScore = 0;
        gameSpeed = 10;
        updateScore();
        
        // Update UI
        if (document.getElementById("dino-score")) {
            document.getElementById("dino-score").textContent = '0';
        }
        if (document.getElementById("dino-ai-score")) {
            document.getElementById("dino-ai-score").textContent = '0';
        }
        
        gameOver = false;
    }
    
    // Update charts (placeholder)
    function updateCharts() {
        // In a real implementation, this would fetch chart data from the backend
        fetch('/api/placeholder_charts')
            .then(response => response.json())
            .then(data => {
                const fitnessChart = document.getElementById('dino-fitness-chart');
                const speciesChart = document.getElementById('dino-species-chart');
                const networkChart = document.getElementById('dino-network-chart');
                
                if (fitnessChart && data.fitness_chart) {
                    fitnessChart.src = data.fitness_chart;
                }
                
                if (speciesChart && data.species_chart) {
                    speciesChart.src = data.species_chart;
                }
                
                if (networkChart && data.network_chart) {
                    networkChart.src = data.network_chart;
                }
            })
            .catch(error => {
                console.error('Error updating charts:', error);
            });
    }
    
    // Initialize game
    if (canvas) {
        // Create initial clouds
        for (let i = 0; i < 3; i++) {
            createCloud();
        }
        
        // Start game loop
        gameLoop();
        
        // Fetch initial chart data
        updateCharts();
    }
});
