// AI Connector for Chrome Dino and Flappy Bird Games
document.addEventListener("DOMContentLoaded", function() {
    // Variables to track AI state
    let aiTraining = false;
    let aiPlaying = false;
    let currentGame = null;
    let aiDecisionInterval = null;
    
    // Initialize the AI connector
    function initAIConnector() {
        // Determine which game we're on
        if (window.location.pathname.includes('dino')) {
            currentGame = 'dino';
        } else if (window.location.pathname.includes('flappy')) {
            currentGame = 'flappy';
        }
        
        // Add event listeners for AI mode changes
        const dinoModeRadios = document.querySelectorAll('input[name="dino-game-mode"]');
        dinoModeRadios.forEach(radio => {
            radio.addEventListener('change', handleAIModeChange);
        });
        
        const flappyModeRadios = document.querySelectorAll('input[name="game-mode"]');
        flappyModeRadios.forEach(radio => {
            radio.addEventListener('change', handleAIModeChange);
        });
        
        // Add event listeners for AI training
        const dinoTrainButton = document.getElementById('dino-train-ai-button');
        if (dinoTrainButton) {
            dinoTrainButton.addEventListener('click', trainAI);
        }
        
        const flappyTrainButton = document.getElementById('train-ai-button');
        if (flappyTrainButton) {
            flappyTrainButton.addEventListener('click', trainAI);
        }
    }
    
    // Handle AI mode changes
    function handleAIModeChange(event) {
        const mode = event.target.value;
        
        // Start or stop AI based on mode
        if (mode === 'ai' || mode === 'both') {
            startAI();
        } else {
            stopAI();
        }
    }
    
    // Start AI decision making
    function startAI() {
        if (aiPlaying) return;
        
        aiPlaying = true;
        
        // Clear any existing interval
        if (aiDecisionInterval) {
            clearInterval(aiDecisionInterval);
        }
        
        // Set up interval for AI decisions
        aiDecisionInterval = setInterval(() => {
            if (currentGame === 'dino') {
                makeAIDecisionForDino();
            } else if (currentGame === 'flappy') {
                makeAIDecisionForFlappy();
            }
        }, 100); // Make decisions 10 times per second
    }
    
    // Stop AI decision making
    function stopAI() {
        aiPlaying = false;
        
        if (aiDecisionInterval) {
            clearInterval(aiDecisionInterval);
            aiDecisionInterval = null;
        }
    }
    
    // Train the AI
    function trainAI() {
        if (aiTraining) return;
        
        aiTraining = true;
        
        // Show training status
        const trainButton = currentGame === 'dino' ? 
            document.getElementById('dino-train-ai-button') : 
            document.getElementById('train-ai-button');
        
        if (trainButton) {
            trainButton.disabled = true;
            trainButton.textContent = 'Training...';
        }
        
        // Call the appropriate API endpoint
        fetch(`/api/${currentGame}/train`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                generations: 5
            }),
        })
        .then(response => response.json())
        .then(data => {
            // Update charts
            updateCharts(data);
            
            // Update generation display
            const generationDisplay = currentGame === 'dino' ? 
                document.getElementById('dino-generation') : 
                document.getElementById('generation');
            
            if (generationDisplay && data.generation) {
                generationDisplay.textContent = data.generation;
            }
            
            // Reset button state
            if (trainButton) {
                trainButton.disabled = false;
                trainButton.textContent = 'Train AI';
            }
            
            aiTraining = false;
        })
        .catch(error => {
            console.error(`Error training ${currentGame} AI:`, error);
            
            // Reset button state
            if (trainButton) {
                trainButton.disabled = false;
                trainButton.textContent = 'Train AI';
            }
            
            aiTraining = false;
        });
    }
    
    // Update charts with data from the backend
    function updateCharts(data) {
        if (currentGame === 'dino') {
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
        } else if (currentGame === 'flappy') {
            const fitnessChart = document.getElementById('fitness-chart');
            const speciesChart = document.getElementById('species-chart');
            const networkChart = document.getElementById('network-chart');
            
            if (fitnessChart && data.fitness_chart) {
                fitnessChart.src = data.fitness_chart;
            }
            
            if (speciesChart && data.species_chart) {
                speciesChart.src = data.species_chart;
            }
            
            if (networkChart && data.network_chart) {
                networkChart.src = data.network_chart;
            }
        }
    }
    
    // Make AI decision for Dino game
    function makeAIDecisionForDino() {
        // Only make decisions if the game is running
        if (!window.gameStarted || window.gameOver) return;
        
        // Get game state
        const obstacles = window.obstacles || [];
        if (obstacles.length === 0) return;
        
        // Find the next obstacle
        let nextObstacle = null;
        for (let i = 0; i < obstacles.length; i++) {
            if (obstacles[i].x + obstacles[i].width > window.aiDino.x) {
                nextObstacle = obstacles[i];
                break;
            }
        }
        
        if (!nextObstacle) return;
        
        // Calculate inputs for AI
        const distanceToObstacle = (nextObstacle.x - window.aiDino.x) / window.canvas.width;
        const heightOfObstacle = nextObstacle.height / window.canvas.height;
        const currentSpeed = window.gameSpeed / 20;
        
        // Call the AI API to get the action
        fetch('/api/dino/action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                game_state: [
                    distanceToObstacle * 100, 
                    heightOfObstacle * 50, 
                    currentSpeed * 20
                ]
            }),
        })
        .then(response => response.json())
        .then(data => {
            // Execute the action
            if (data.action && !window.aiDino.jumping) {
                window.aiDino.jump();
            }
        })
        .catch(error => {
            console.error('Error getting AI action:', error);
            
            // Fallback to simple heuristic if API fails
            if (nextObstacle.x - window.aiDino.x < 200 && !window.aiDino.jumping) {
                window.aiDino.jump();
            }
        });
    }
    
    // Make AI decision for Flappy Bird game
    function makeAIDecisionForFlappy() {
        // Only make decisions if the game is running
        if (!window.gameStarted || window.gameOver) return;
        
        // Get game state
        const pipes = window.pipes || [];
        if (pipes.length === 0) return;
        
        // Find the next pipe
        let nextPipe = null;
        for (let i = 0; i < pipes.length; i++) {
            if (pipes[i].x + pipes[i].width > window.aiBird.x) {
                nextPipe = pipes[i];
                break;
            }
        }
        
        if (!nextPipe) return;
        
        // Calculate inputs for AI
        const horizontalDistance = (nextPipe.x - window.aiBird.x) / window.canvas.width;
        const verticalDistanceTop = (window.aiBird.y - nextPipe.y) / window.canvas.height;
        const verticalDistanceBottom = (nextPipe.y + window.PIPE_GAP - window.aiBird.y) / window.canvas.height;
        
        // Call the AI API to get the action
        fetch('/api/flappy/action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                game_state: [
                    horizontalDistance * 500, 
                    verticalDistanceTop * 400, 
                    verticalDistanceBottom * 400
                ]
            }),
        })
        .then(response => response.json())
        .then(data => {
            // Execute the action
            if (data.action) {
                window.aiBird.flap();
            }
        })
        .catch(error => {
            console.error('Error getting AI action:', error);
            
            // Fallback to simple heuristic if API fails
            if (Math.random() < 0.05 && window.aiBird.y > nextPipe.y + window.PIPE_GAP / 2 - 50) {
                window.aiBird.flap();
            }
        });
    }
    
    // Initialize the AI connector
    initAIConnector();
});
