document.addEventListener("DOMContentLoaded", function() {
    // Create chart container
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
    
    // Create stats container
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
    
    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'controls';
    controlsContainer.innerHTML = `
        <button id="dino-start-button">Start Game</button>
        <button id="dino-train-ai-button">Train AI</button>
        <button id="dino-reset-button">Reset</button>
    `;
    
    // Create mode selector
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
    
    // Initialize visualization components
    function initDinoVisualization() {
        const container = document.querySelector('.container');
        if (!container) {
            console.error('Container element not found');
            return;
        }
        
        if (window.location.pathname.includes('dino')) {
            container.appendChild(modeSelector);
            container.appendChild(controlsContainer);
            container.appendChild(statsContainer);
            container.appendChild(chartContainer);
            
            // Add event listeners
            const trainButton = document.getElementById('dino-train-ai-button');
            const startButton = document.getElementById('dino-start-button');
            const resetButton = document.getElementById('dino-reset-button');
            
            if (trainButton) trainButton.addEventListener('click', trainDinoAI);
            else console.error('Train AI button not found');
            if (startButton) startButton.addEventListener('click', startDinoGame);
            else console.error('Start button not found');
            if (resetButton) resetButton.addEventListener('click', resetDinoGame);
            else console.error('Reset button not found');
            
            const modeRadios = document.querySelectorAll('input[name="dino-game-mode"]');
            modeRadios.forEach(radio => {
                radio.addEventListener('change', handleDinoModeChange);
            });
            
            // Fetch initial visualizations
            updateDinoRealTimeVisualizations();
        }
    }
    
    // Update charts with API data
    function updateCharts(data) {
        console.log('Chart data received:', data); // Debug
        const fitnessChart = document.getElementById('dino-fitness-chart');
        const speciesChart = document.getElementById('dino-species-chart');
        const networkChart = document.getElementById('dino-network-chart');
        
        if (fitnessChart && data.fitness_chart) {
            fitnessChart.src = data.fitness_chart;
            console.log('Fitness chart updated');
        } else {
            console.warn('Fitness chart not updated:', { fitnessChart: !!fitnessChart, data: !!data.fitness_chart });
        }
        
        if (speciesChart && data.species_chart) {
            speciesChart.src = data.species_chart;
            console.log('Species chart updated');
        } else {
            console.warn('Species chart not updated:', { speciesChart: !!speciesChart, data: !!data.species_chart });
        }
        
        if (networkChart && data.network_chart) {
            networkChart.src = data.network_chart;
            console.log('Network chart updated');
        } else {
            console.warn('Network chart not updated:', { networkChart: !!networkChart, data: !!data.network_chart });
        }
    }
    
    // Train Dino AI
    function trainDinoAI() {
        const trainButton = document.getElementById('dino-train-ai-button');
        if (!trainButton) return;
        
        trainButton.disabled = true;
        trainButton.textContent = 'Training...';
        
        fetch('/api/dino/train', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ generations: 5 })
        })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Train AI response:', data); // Debug
            if (data.success) {
                updateCharts(data);
                const generationEl = document.getElementById('dino-generation');
                if (generationEl) generationEl.textContent = data.generation || 0;
            } else {
                console.error('Training failed:', data.error);
            }
            trainButton.disabled = false;
            trainButton.textContent = 'Train AI';
        })
        .catch(error => {
            console.error('Error training AI:', error);
            trainButton.disabled = false;
            trainButton.textContent = 'Train AI';
        });
    }
    
    // Start Dino game
    function startDinoGame() {
        if (window.startGame) {
            window.startGame();
            console.log('Dino game started via window.startGame');
        } else {
            console.log('Starting Dino game via event');
            const startEvent = new CustomEvent('startDinoGame');
            document.dispatchEvent(startEvent);
        }
        startDinoVisualizationUpdates();
    }
    
    // Reset Dino game
    function resetDinoGame() {
        if (window.resetDinoGame) {
            window.resetDinoGame();
            console.log('Dino game reset via window.resetDinoGame');
        } else {
            console.log('Resetting Dino game via event');
            const resetEvent = new CustomEvent('resetDinoGame');
            document.dispatchEvent(resetEvent);
        }
        const scoreEl = document.getElementById('dino-score');
        const aiScoreEl = document.getElementById('dino-ai-score');
        if (scoreEl) scoreEl.textContent = '0';
        if (aiScoreEl) aiScoreEl.textContent = '0';
        if (dinoVisualizationInterval) {
            clearInterval(dinoVisualizationInterval);
        }
    }
    
    // Handle mode change
    function handleDinoModeChange() {
        const gameMode = document.querySelector('input[name="dino-game-mode"]:checked')?.value;
        if (!gameMode) {
            console.warn('No game mode selected');
            return;
        }
        console.log('Dino game mode changed to:', gameMode);
        
        if (window.setDinoGameMode) {
            window.setDinoGameMode(gameMode);
        } else {
            const modeEvent = new CustomEvent('setDinoGameMode', { detail: { mode: gameMode } });
            document.dispatchEvent(modeEvent);
        }
        
        const aiElements = document.querySelectorAll('.dino-ai-only');
        aiElements.forEach(el => {
            el.style.display = (gameMode === 'ai' || gameMode === 'both') ? 'block' : 'none';
        });
        
        if (gameMode === 'ai' || gameMode === 'both') {
            startDinoVisualizationUpdates();
        } else {
            if (dinoVisualizationInterval) {
                clearInterval(dinoVisualizationInterval);
            }
        }
    }
    
    // Real-time visualization updates
    let dinoVisualizationInterval;
    
    function startDinoVisualizationUpdates() {
        if (dinoVisualizationInterval) {
            clearInterval(dinoVisualizationInterval);
        }
        dinoVisualizationInterval = setInterval(() => {
            const gameMode = document.querySelector('input[name="dino-game-mode"]:checked')?.value;
            if (gameMode === 'ai' || gameMode === 'both') {
                updateDinoRealTimeVisualizations();
            }
        }, 5000);
    }
    
    function updateDinoRealTimeVisualizations() {
        fetch('/api/dino/visualizations')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                console.log('Visualization data:', data); // Debug
                updateCharts(data);
            })
            .catch(error => {
                console.error('Error updating visualizations:', error);
            });
    }
    
    // Initialize visualization
    initDinoVisualization();
});