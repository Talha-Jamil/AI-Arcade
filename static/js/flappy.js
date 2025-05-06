// Flappy Bird Game Implementation
document.addEventListener("DOMContentLoaded", function() {
    // Canvas setup
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    
    // Game constants
    const GRAVITY = 0.5;
    const FLAP_VELOCITY = -8;
    const PIPE_SPEED = 3;
    const PIPE_WIDTH = 80;
    const PIPE_GAP = 150;
    const PIPE_SPACING = 300;
    
    // Game variables
    let gameStarted = false;
    let gameOver = false;
    let score = 0;
    let highScore = 0;
    let aiScore = 0;
    let generation = 0;
    let gameMode = "player"; // player, ai, or both
    
    // Bird object
    const bird = {
        x: 150,
        y: canvas.height / 2,
        width: 40,
        height: 30,
        velocity: 0,
        color: "#FFD700", // Gold color for player bird
        
        draw: function() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw bird eye
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(this.x + 10, this.y - 5, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw bird beak
            ctx.fillStyle = "orange";
            ctx.beginPath();
            ctx.moveTo(this.x + 20, this.y);
            ctx.lineTo(this.x + 30, this.y - 5);
            ctx.lineTo(this.x + 30, this.y + 5);
            ctx.closePath();
            ctx.fill();
        },
        
        update: function() {
            // Apply gravity
            this.velocity += GRAVITY;
            this.y += this.velocity;
            
            // Prevent bird from going off screen
            if (this.y < 0) {
                this.y = 0;
                this.velocity = 0;
            }
            
            if (this.y > canvas.height) {
                this.y = canvas.height;
                this.velocity = 0;
                gameOver = true;
            }
        },
        
        flap: function() {
            this.velocity = FLAP_VELOCITY;
        },
        
        reset: function() {
            this.y = canvas.height / 2;
            this.velocity = 0;
        }
    };
    
    // AI Bird object
    const aiBird = {
        x: 150,
        y: canvas.height / 2,
        width: 40,
        height: 30,
        velocity: 0,
        color: "#FF6347", // Tomato color for AI bird
        
        draw: function() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw bird eye
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(this.x + 10, this.y - 5, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw bird beak
            ctx.fillStyle = "orange";
            ctx.beginPath();
            ctx.moveTo(this.x + 20, this.y);
            ctx.lineTo(this.x + 30, this.y - 5);
            ctx.lineTo(this.x + 30, this.y + 5);
            ctx.closePath();
            ctx.fill();
        },
        
        update: function() {
            // Apply gravity
            this.velocity += GRAVITY;
            this.y += this.velocity;
            
            // Prevent bird from going off screen
            if (this.y < 0) {
                this.y = 0;
                this.velocity = 0;
            }
            
            if (this.y > canvas.height) {
                this.y = canvas.height;
                this.velocity = 0;
            }
            
            // AI decision making
            if (pipes.length > 0) {
                // Find the next pipe
                let nextPipe = null;
                for (let i = 0; i < pipes.length; i++) {
                    if (pipes[i].x + PIPE_WIDTH > this.x) {
                        nextPipe = pipes[i];
                        break;
                    }
                }
                
                if (nextPipe) {
                    // Calculate inputs for AI
                    const horizontalDistance = (nextPipe.x - this.x) / canvas.width;
                    const verticalDistanceTop = (this.y - nextPipe.y) / canvas.height;
                    const verticalDistanceBottom = (nextPipe.y + PIPE_GAP - this.y) / canvas.height;
                    
                    // Simulate AI decision (placeholder for actual AI)
                    // In a real implementation, this would call the AI model
                    if (Math.random() < 0.05 && this.y > nextPipe.y + PIPE_GAP / 2 - 50) {
                        this.flap();
                    }
                }
            }
        },
        
        flap: function() {
            this.velocity = FLAP_VELOCITY;
        },
        
        reset: function() {
            this.y = canvas.height / 2;
            this.velocity = 0;
        }
    };
    
    // Pipes array
    let pipes = [];
    
    // Create a new pipe
    function createPipe() {
        const pipeY = Math.floor(Math.random() * (canvas.height - PIPE_GAP - 100)) + 50;
        
        pipes.push({
            x: canvas.width,
            y: pipeY,
            counted: false
        });
    }
    
    // Draw pipes
    function drawPipes() {
        ctx.fillStyle = "#2ECC71"; // Green color for pipes
        
        for (let i = 0; i < pipes.length; i++) {
            const pipe = pipes[i];
            
            // Top pipe
            ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.y);
            
            // Bottom pipe
            ctx.fillRect(pipe.x, pipe.y + PIPE_GAP, PIPE_WIDTH, canvas.height - pipe.y - PIPE_GAP);
            
            // Pipe caps
            ctx.fillStyle = "#27AE60"; // Darker green for caps
            ctx.fillRect(pipe.x - 5, pipe.y - 20, PIPE_WIDTH + 10, 20);
            ctx.fillRect(pipe.x - 5, pipe.y + PIPE_GAP, PIPE_WIDTH + 10, 20);
            ctx.fillStyle = "#2ECC71"; // Reset color
        }
    }
    
    // Update pipes
    function updatePipes() {
        for (let i = 0; i < pipes.length; i++) {
            const pipe = pipes[i];
            
            // Move pipe
            pipe.x -= PIPE_SPEED;
            
            // Check if bird passed the pipe
            if (!pipe.counted && pipe.x + PIPE_WIDTH < bird.x) {
                score++;
                pipe.counted = true;
                updateScore();
                
                if (score > highScore) {
                    highScore = score;
                    document.getElementById("high-score").textContent = highScore;
                }
            }
            
            // Check if AI bird passed the pipe
            if (gameMode === "ai" || gameMode === "both") {
                if (!pipe.counted && pipe.x + PIPE_WIDTH < aiBird.x) {
                    aiScore++;
                    document.getElementById("ai-score").textContent = aiScore;
                }
            }
            
            // Remove pipe if it's off screen
            if (pipe.x + PIPE_WIDTH < 0) {
                pipes.splice(i, 1);
                i--;
            }
        }
        
        // Add new pipe when needed
        if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - PIPE_SPACING) {
            createPipe();
        }
    }
    
    // Check collisions
    function checkCollisions() {
        // Player bird collisions
        if (gameMode === "player" || gameMode === "both") {
            for (let i = 0; i < pipes.length; i++) {
                const pipe = pipes[i];
                
                // Check collision with top pipe
                if (
                    bird.x + bird.width / 2 > pipe.x &&
                    bird.x - bird.width / 2 < pipe.x + PIPE_WIDTH &&
                    bird.y - bird.height / 2 < pipe.y
                ) {
                    gameOver = true;
                }
                
                // Check collision with bottom pipe
                if (
                    bird.x + bird.width / 2 > pipe.x &&
                    bird.x - bird.width / 2 < pipe.x + PIPE_WIDTH &&
                    bird.y + bird.height / 2 > pipe.y + PIPE_GAP
                ) {
                    gameOver = true;
                }
            }
        }
        
        // AI bird collisions (only for visualization, doesn't end game)
        if (gameMode === "ai" || gameMode === "both") {
            for (let i = 0; i < pipes.length; i++) {
                const pipe = pipes[i];
                
                // Check collision with top pipe
                if (
                    aiBird.x + aiBird.width / 2 > pipe.x &&
                    aiBird.x - aiBird.width / 2 < pipe.x + PIPE_WIDTH &&
                    aiBird.y - aiBird.height / 2 < pipe.y
                ) {
                    // AI collision handling
                    aiBird.reset();
                    aiScore = 0;
                    document.getElementById("ai-score").textContent = aiScore;
                    generation++;
                    document.getElementById("generation").textContent = generation;
                }
                
                // Check collision with bottom pipe
                if (
                    aiBird.x + aiBird.width / 2 > pipe.x &&
                    aiBird.x - aiBird.width / 2 < pipe.x + PIPE_WIDTH &&
                    aiBird.y + aiBird.height / 2 > pipe.y + PIPE_GAP
                ) {
                    // AI collision handling
                    aiBird.reset();
                    aiScore = 0;
                    document.getElementById("ai-score").textContent = aiScore;
                    generation++;
                    document.getElementById("generation").textContent = generation;
                }
            }
        }
    }
    
    // Update score display
    function updateScore() {
        document.getElementById("score").textContent = score;
    }
    
    // Draw background
    function drawBackground() {
        // Sky
        ctx.fillStyle = "#70C5CE";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Ground
        ctx.fillStyle = "#DED895";
        ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
        
        // Grass
        ctx.fillStyle = "#5AAA3D";
        ctx.fillRect(0, canvas.height - 50, canvas.width, 10);
        
        // Clouds
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath();
        ctx.arc(100, 100, 30, 0, Math.PI * 2);
        ctx.arc(130, 90, 30, 0, Math.PI * 2);
        ctx.arc(160, 100, 30, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(500, 150, 30, 0, Math.PI * 2);
        ctx.arc(530, 140, 30, 0, Math.PI * 2);
        ctx.arc(560, 150, 30, 0, Math.PI * 2);
        ctx.fill();
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
        
        // Draw background
        drawBackground();
        
        if (gameStarted) {
            // Update game objects
            if (!gameOver) {
                if (gameMode === "player" || gameMode === "both") {
                    bird.update();
                }
                
                if (gameMode === "ai" || gameMode === "both") {
                    aiBird.update();
                }
                
                updatePipes();
                checkCollisions();
            }
            
            // Draw pipes
            drawPipes();
            
            // Draw birds
            if (gameMode === "player" || gameMode === "both") {
                bird.draw();
            }
            
            if (gameMode === "ai" || gameMode === "both") {
                aiBird.draw();
            }
            
            // Draw score
            ctx.fillStyle = "white";
            ctx.font = "32px Arial";
            ctx.textAlign = "center";
            ctx.fillText(score, canvas.width / 2, 50);
            
            // Draw game over screen
            if (gameOver) {
                drawGameOver();
            }
        } else {
            // Draw title screen
            ctx.fillStyle = "white";
            ctx.font = "48px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Flappy Bird", canvas.width / 2, canvas.height / 2 - 50);
            
            ctx.font = "24px Arial";
            ctx.fillText("Press 'Start Game' to play", canvas.width / 2, canvas.height / 2 + 50);
        }
        
        // Continue game loop
        requestAnimationFrame(gameLoop);
    }
    
    // Event listeners
    document.addEventListener("keydown", function(e) {
        if (e.code === "Space" && gameStarted && !gameOver && (gameMode === "player" || gameMode === "both")) {
            bird.flap();
        }
    });
    
    canvas.addEventListener("click", function() {
        if (gameStarted && !gameOver && (gameMode === "player" || gameMode === "both")) {
            bird.flap();
        }
    });
    
    // Mode selector
    const modeRadios = document.querySelectorAll('input[name="game-mode"]');
    modeRadios.forEach(radio => {
        radio.addEventListener("change", function() {
            gameMode = this.value;
            resetGame();
        });
    });
    
    // Start button
    document.getElementById("start-button").addEventListener("click", function() {
        if (!gameStarted || gameOver) {
            resetGame();
            gameStarted = true;
            gameOver = false;
        }
    });
    
    // Reset button
    document.getElementById("reset-button").addEventListener("click", function() {
        resetGame();
    });
    
    // Train AI button
    document.getElementById("train-ai-button").addEventListener("click", function() {
        // This would trigger AI training in a real implementation
        // For now, we'll just simulate training by incrementing the generation
        generation += 5;
        document.getElementById("generation").textContent = generation;
        
        // Simulate updating charts
        updateCharts();
    });
    
    // Reset game
    function resetGame() {
        bird.reset();
        aiBird.reset();
        pipes = [];
        score = 0;
        aiScore = 0;
        updateScore();
        document.getElementById("ai-score").textContent = aiScore;
        gameOver = false;
    }
    
    // Update charts (placeholder)
    function updateCharts() {
        // In a real implementation, this would fetch chart data from the backend
        // For now, we'll just use placeholder images
        document.getElementById("fitness-chart").src = "/static/images/placeholder_fitness.png";
        document.getElementById("species-chart").src = "/static/images/placeholder_species.png";
        document.getElementById("network-chart").src = "/static/images/placeholder_network.png";
    }
    
    // Initialize game
    gameLoop();
    
    // Fetch initial chart data
    updateCharts();
});
