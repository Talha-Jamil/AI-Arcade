# AI-Arcade

AI-Arcade is an interactive platform that demonstrates how artificial intelligence can learn to play classic arcade games in real-time. The platform features two games - Chrome Dino and Flappy Bird - with AI opponents powered by the NEAT (NeuroEvolution of Augmenting Topologies) algorithm.

## Features

- **Two Classic Games**: Chrome Dino and Flappy Bird implementations
- **NEAT Algorithm Integration**: Watch AI learn to play games through neural network evolution
- **Real-time Visualization**: See fitness scores, species counts, and neural network structures
- **Multiple Play Modes**:
  - Player Mode: Play the games yourself
  - AI Mode: Watch the AI play and learn
  - Player + AI Mode: Play alongside the AI

## Installation

1. Clone this repository:
```
git clone https://github.com/yourusername/AI-Arcade.git
cd AI-Arcade
```

2. Install the required dependencies:
```
pip install neat-python numpy matplotlib flask
```

3. Run the application:
```
python app.py
```

4. Open your browser and navigate to:
```
http://localhost:5000
```

## How It Works

### NEAT Algorithm

The NEAT algorithm is a genetic algorithm that evolves neural networks. It starts with simple networks and gradually adds complexity through:

1. **Mutation**: Adding/removing nodes and connections
2. **Crossover**: Combining genetic material from parents
3. **Speciation**: Grouping similar networks to protect innovation

### Game Integration

Each game has its own AI implementation that:
- Provides game state as input to neural networks
- Interprets network outputs as game actions
- Calculates fitness based on game performance
- Evolves the population over generations

### Visualization

The platform provides real-time visualization of:
- Fitness scores over generations
- Species count over time
- Neural network structure

## Usage

1. **Home Page**: Select a game to play (Chrome Dino or Flappy Bird)
2. **Game Page**: Choose a mode (Player, AI, or Player + AI)
3. **Training**: Click "Train AI" to run the NEAT algorithm for several generations
4. **Playing**: Use spacebar or click to control your character
5. **Visualization**: Watch the charts update as the AI learns

## Project Structure

- `app.py`: Flask application with routes and API endpoints
- `neat_algorithm.py`: Core NEAT algorithm implementation
- `dino_ai.py` & `flappy_ai.py`: Game-specific AI implementations
- `static/js/`: Game mechanics and visualization components
- `static/css/`: Styling for the games and UI
- `templates/`: HTML templates for the web pages

## Future Improvements

- Add more games (Chess, Tic-Tac-Toe, etc.)
- Implement more advanced AI algorithms
- Add multiplayer functionality
- Improve visualization with more detailed metrics
- Save and load trained AI models

## Credits

This project was built using:
- [NEAT-Python](https://neat-python.readthedocs.io/)
- [Flask](https://flask.palletsprojects.com/)
- [Matplotlib](https://matplotlib.org/)
