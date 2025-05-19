// Visualization Components for Chrome Dino Game
document.addEventListener("DOMContentLoaded", function() {
    // Create a chart container for the Dino game
    const chartContainer = document.createElement('div');
    chartContainer.className = 'charts';
    chartContainer.innerHTML = `
        <div class="chart">
            <h3>Fitness Over Generations</h3>
            <img id="dino-fitness-chart" src="" alt="Fitness Chart">
        </div>
        <div class="chart">
            <h3>Species Count</h3>
            <img id="dino-species-chart" src="" alt="Species Chart">
        </div>
        <div class="chart">
            <h3>Neural Network</h3>
            <img id="dino-network-chart" src="" alt="Network Structure">
        </div>
    `;
    
    // Add stats container
    const statsContainer = document.createElement('div');
    statsContainer.className = 'stats';
    statsContainer.innerHTML = `
        <div class="stat-box">
            <h3>Score</h3>
            <p id="dino-score">0</p>
        </div>
        <div class="stat-box">
            <h3>High Score</h3>
            <p id="dino-high-score">0</p>
        </div>
        <div class="stat-box">
            <h3>Generation</h3>
            <p id="dino-generation">0</p>
        </div>
        <div class="stat-box">
            <h3>AI Score</h3>
            <p id="dino-ai-score">0</p>
        </div>
    `;
    
    // Add controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'controls';
    controlsContainer.innerHTML = `
        <button id="dino-start-button">Start Game</button>
        <button id="dino-train-ai-button">Train AI</button>
        <button id="dino-reset-button">Reset</button>
    `;
    
    // Add mode selector
    const modeSelector = document.createElement('div');
    modeSelector.className = 'mode-selector';
    modeSelector.innerHTML = `
        <input type="radio" id="dino-player-mode" name="dino-game-mode" value="player" checked>
        <label for="dino-player-mode">Player Mode</label>
        
        <input type="radio" id="dino-ai-mode" name="dino-game-mode" value="ai">
        <label for="dino-ai-mode">AI Mode</label>
        
        <input type="radio" id="dino-both-mode" name="dino-game-mode" value="both">
        <label for="dino-both-mode">Player + AI Mode</label>
    `;
    
    // Function to initialize the visualization components
    function initDinoVisualization() {
        const container = document.querySelector('.container');
        if (!container) return;
        
        // Check if we're on the dino page
        if (window.location.pathname.includes('dino')) {
            // Add the components to the page
            container.appendChild(modeSelector);
            container.appendChild(controlsContainer);
            container.appendChild(statsContainer);
            container.appendChild(chartContainer);
            
            // Initialize charts with placeholders
            fetchPlaceholderCharts();
            
            // Add event listeners
            document.getElementById('dino-train-ai-button').addEventListener('click', trainDinoAI);
            document.getElementById('dino-start-button').addEventListener('click', startDinoGame);
            document.getElementById('dino-reset-button').addEventListener('click', resetDinoGame);
            
            // Add mode change listeners
            const modeRadios = document.querySelectorAll('input[name="dino-game-mode"]');
            modeRadios.forEach(radio => {
                radio.addEventListener('change', handleDinoModeChange);
            });
        }
    }
    
    // Function to fetch placeholder charts
    function fetchPlaceholderCharts() {
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
                console.error('Error fetching placeholder charts:', error);
            });
    }
    
    // Function to train Dino AI
    function trainDinoAI() {
        const trainButton = document.getElementById('dino-train-ai-button');
        trainButton.disabled = true;
        trainButton.textContent = 'Training...';
        
        fetch('/api/dino/train', {
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
            if (data.fitness_chart) {
                document.getElementById('dino-fitness-chart').src = data.fitness_chart;
            }
            
            if (data.species_chart) {
                document.getElementById('dino-species-chart').src = data.species_chart;
            }
            
            if (data.network_chart) {
                document.getElementById('dino-network-chart').src = data.network_chart;
            }
            
            // Update generation display
            document.getElementById('dino-generation').textContent = data.generation;
            
            // Reset button state
            trainButton.disabled = false;
            trainButton.textContent = 'Train AI';
        })
        .catch(error => {
            console.error('Error training AI:', error);
            // Reset button state
            trainButton.disabled = false;
            trainButton.textContent = 'Train AI';
        });
    }
    
    // Function to start Dino game
    function startDinoGame() {
        // Access the gameStarted variable from dino.js and set it to true
        if (window.startGame) {
            window.startGame();
        } else {
            // Fallback if the function isn't available
            console.log('Starting Dino game');
            // Try to find and set the gameStarted variable directly
            const gameScript = document.querySelector('script[src*="dino.js"]');
            if (gameScript) {
                // Dispatch a custom event that dino.js can listen for
                const startEvent = new CustomEvent('startDinoGame');
                document.dispatchEvent(startEvent);
            }
        }
        
        // Start visualization updates
        startDinoVisualizationUpdates();
    }
    
    // Function to reset Dino game
    function resetDinoGame() {
        // Access the resetGame function from dino.js
        if (window.resetDinoGame) {
            window.resetDinoGame();
        } else {
            // Fallback if the function isn't available
            console.log('Resetting Dino game');
            // Try to reset the game by dispatching an event
            const resetEvent = new CustomEvent('resetDinoGame');
            document.dispatchEvent(resetEvent);
        }
        
        // Reset stats
        document.getElementById('dino-score').textContent = '0';
        document.getElementById('dino-ai-score').textContent = '0';
        
        // Stop visualization updates
        if (dinoVisualizationInterval) {
            clearInterval(dinoVisualizationInterval);
        }
    }
    
    // Function to handle mode change
    function handleDinoModeChange() {
        const gameMode = document.querySelector('input[name="dino-game-mode"]:checked').value;
        console.log('Dino game mode changed to:', gameMode);
        
        // Set the game mode in dino.js
        if (window.setDinoGameMode) {
            window.setDinoGameMode(gameMode);
        } else {
            // Fallback if the function isn't available
            // Dispatch a custom event with the game mode
            const modeEvent = new CustomEvent('setDinoGameMode', { detail: { mode: gameMode } });
            document.dispatchEvent(modeEvent);
        }
        
        // Show/hide AI-specific elements based on mode
        const aiElements = document.querySelectorAll('.dino-ai-only');
        aiElements.forEach(el => {
            if (gameMode === 'ai' || gameMode === 'both') {
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
        });
        
        // Restart visualization updates if in AI or both mode
        if (gameMode === 'ai' || gameMode === 'both') {
            startDinoVisualizationUpdates();
        } else {
            if (dinoVisualizationInterval) {
                clearInterval(dinoVisualizationInterval);
            }
        }
    }
    
    // Real-time visualization update (for when AI is playing)
    let dinoVisualizationInterval;
    
    // Function to start real-time visualization updates
    function startDinoVisualizationUpdates() {
        // Clear any existing interval
        if (dinoVisualizationInterval) {
            clearInterval(dinoVisualizationInterval);
        }
        
        // Set interval to update visualizations
        dinoVisualizationInterval = setInterval(() => {
            // Only update if in AI or both mode
            const gameMode = document.querySelector('input[name="dino-game-mode"]:checked')?.value;
            if (gameMode === 'ai' || gameMode === 'both') {
                updateDinoRealTimeVisualizations();
            }
        }, 5000); // Update every 5 seconds
    }
    
    // Function to update real-time visualizations
    function updateDinoRealTimeVisualizations() {
        fetch('/api/dino/visualizations')
            .then(response => response.json())
            .then(data => {
                // Update charts if available
                if (data.fitness_chart) {
                    document.getElementById('dino-fitness-chart').src = data.fitness_chart;
                }
                
                if (data.species_chart) {
                    document.getElementById('dino-species-chart').src = data.species_chart;
                }
                
                if (data.network_chart) {
                    document.getElementById('dino-network-chart').src = data.network_chart;
                }
            })
            .catch(error => {
                console.error('Error updating visualizations:', error);
            });
    }
    
    // Initialize visualization components when the page loads
    initDinoVisualization();
});
