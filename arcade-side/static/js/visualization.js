// Visualization Components for AI Learning
document.addEventListener("DOMContentLoaded", function() {
    // Elements for charts
    const fitnessChart = document.getElementById("fitness-chart");
    const speciesChart = document.getElementById("species-chart");
    const networkChart = document.getElementById("network-chart");
    
    // Elements for controls
    const trainAiButton = document.getElementById("train-ai-button");
    const generationDisplay = document.getElementById("generation");
    
    // Initialize charts with placeholders
    fetchPlaceholderCharts();
    
    // Event listener for training AI
    if (trainAiButton) {
        trainAiButton.addEventListener("click", function() {
            // Show loading state
            trainAiButton.disabled = true;
            trainAiButton.textContent = "Training...";
            
            // Determine which game we're on
            const currentGame = window.location.pathname.includes('flappy') ? 'flappy' : 'dino';
            
            // Call API to train AI
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
                if (data.fitness_chart) {
                    fitnessChart.src = data.fitness_chart;
                }
                
                if (data.species_chart) {
                    speciesChart.src = data.species_chart;
                }
                
                if (data.network_chart) {
                    networkChart.src = data.network_chart;
                }
                
                // Update generation display
                if (generationDisplay) {
                    generationDisplay.textContent = data.generation;
                }
                
                // Reset button state
                trainAiButton.disabled = false;
                trainAiButton.textContent = "Train AI";
            })
            .catch(error => {
                console.error('Error training AI:', error);
                // Reset button state
                trainAiButton.disabled = false;
                trainAiButton.textContent = "Train AI";
            });
        });
    }
    
    // Function to fetch placeholder charts
    function fetchPlaceholderCharts() {
        fetch('/api/placeholder_charts')
            .then(response => response.json())
            .then(data => {
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
    
    // Real-time visualization update (for when AI is playing)
    let visualizationInterval;
    
    // Function to start real-time visualization updates
    function startVisualizationUpdates() {
        // Clear any existing interval
        if (visualizationInterval) {
            clearInterval(visualizationInterval);
        }
        
        // Determine which game we're on
        const currentGame = window.location.pathname.includes('flappy') ? 'flappy' : 'dino';
        
        // Set interval to update visualizations
        visualizationInterval = setInterval(() => {
            // Only update if in AI or both mode
            const gameMode = document.querySelector('input[name="game-mode"]:checked')?.value;
            if (gameMode === 'ai' || gameMode === 'both') {
                updateRealTimeVisualizations(currentGame);
            }
        }, 5000); // Update every 5 seconds
    }
    
    // Function to update real-time visualizations
    function updateRealTimeVisualizations(game) {
        fetch(`/api/${game}/visualizations`)
            .then(response => response.json())
            .then(data => {
                // Update charts if available
                if (data.fitness_chart && fitnessChart) {
                    fitnessChart.src = data.fitness_chart;
                }
                
                if (data.species_chart && speciesChart) {
                    speciesChart.src = data.species_chart;
                }
                
                if (data.network_chart && networkChart) {
                    networkChart.src = data.network_chart;
                }
            })
            .catch(error => {
                console.error('Error updating visualizations:', error);
            });
    }
    
    // Start visualization updates when game starts
    const startButton = document.getElementById("start-button");
    if (startButton) {
        startButton.addEventListener("click", function() {
            startVisualizationUpdates();
        });
    }
    
    // Stop visualization updates when game is reset
    const resetButton = document.getElementById("reset-button");
    if (resetButton) {
        resetButton.addEventListener("click", function() {
            if (visualizationInterval) {
                clearInterval(visualizationInterval);
            }
        });
    }
    
    // Update mode-specific visualizations when mode changes
    const modeRadios = document.querySelectorAll('input[name="game-mode"]');
    if (modeRadios.length > 0) {
        modeRadios.forEach(radio => {
            radio.addEventListener("change", function() {
                const gameMode = this.value;
                
                // Show/hide AI-specific elements based on mode
                const aiElements = document.querySelectorAll('.ai-only');
                aiElements.forEach(el => {
                    if (gameMode === 'ai' || gameMode === 'both') {
                        el.style.display = 'block';
                    } else {
                        el.style.display = 'none';
                    }
                });
                
                // Restart visualization updates if in AI or both mode
                if (gameMode === 'ai' || gameMode === 'both') {
                    startVisualizationUpdates();
                } else {
                    if (visualizationInterval) {
                        clearInterval(visualizationInterval);
                    }
                }
            });
        });
    }
});
