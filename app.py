from flask import Flask, render_template, jsonify, request
import os
import base64
import io
from matplotlib.figure import Figure
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
import numpy as np
from dino_ai import DinoGameAI
from flappy_ai import FlappyBirdAI

app = Flask(__name__)

# Initialize AI instances
dino_ai = DinoGameAI()
flappy_ai = FlappyBirdAI()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/dino')
def dino():
    return render_template('dino.html')

@app.route('/flappy')
def flappy():
    return render_template('flappy.html')

@app.route('/api/dino/train', methods=['POST'])
def train_dino_ai():
    generations = request.json.get('generations', 5)
    dino_ai.train(generations)
    
    return jsonify({
        'success': True,
        'generation': dino_ai.current_generation,
        'best_fitness': dino_ai.best_fitness,
        'fitness_chart': dino_ai.get_fitness_chart(),
        'species_chart': dino_ai.get_species_chart(),
        'network_chart': dino_ai.get_network_chart()
    })

@app.route('/api/flappy/train', methods=['POST'])
def train_flappy_ai():
    generations = request.json.get('generations', 5)
    flappy_ai.train(generations)
    
    return jsonify({
        'success': True,
        'generation': flappy_ai.current_generation,
        'best_fitness': flappy_ai.best_fitness,
        'fitness_chart': flappy_ai.get_fitness_chart(),
        'species_chart': flappy_ai.get_species_chart(),
        'network_chart': flappy_ai.get_network_chart()
    })

@app.route('/api/dino/action', methods=['POST'])
def get_dino_action():
    game_state = request.json.get('game_state', [100, 20, 10])
    action = dino_ai.get_action(game_state)
    
    return jsonify({
        'action': action
    })

@app.route('/api/flappy/action', methods=['POST'])
def get_flappy_action():
    game_state = request.json.get('game_state', [100, 50, 50])
    action = flappy_ai.get_action(game_state)
    
    return jsonify({
        'action': action
    })

@app.route('/api/placeholder_charts')
def placeholder_charts():
    # Create placeholder charts for initial display
    
    # Fitness chart
    fig1 = Figure(figsize=(10, 6))
    canvas1 = FigureCanvas(fig1)
    ax1 = fig1.add_subplot(111)
    
    x = np.arange(10)
    y = np.random.rand(10) * 100
    ax1.plot(x, y, 'b-', label='Best Fitness')
    ax1.set_xlabel('Generation')
    ax1.set_ylabel('Fitness')
    ax1.set_title('Fitness over Generations')
    ax1.legend()
    ax1.grid(True)
    
    buf1 = io.BytesIO()
    canvas1.print_png(buf1)
    fitness_chart = base64.b64encode(buf1.getbuffer()).decode('ascii')
    
    # Species chart
    fig2 = Figure(figsize=(10, 6))
    canvas2 = FigureCanvas(fig2)
    ax2 = fig2.add_subplot(111)
    
    x = np.arange(10)
    y = np.random.randint(1, 10, 10)
    ax2.plot(x, y, 'g-')
    ax2.set_xlabel('Generation')
    ax2.set_ylabel('Number of Species')
    ax2.set_title('Species Count over Generations')
    ax2.grid(True)
    
    buf2 = io.BytesIO()
    canvas2.print_png(buf2)
    species_chart = base64.b64encode(buf2.getbuffer()).decode('ascii')
    
    # Network chart
    fig3 = Figure(figsize=(12, 9))
    canvas3 = FigureCanvas(fig3)
    ax3 = fig3.add_subplot(111)
    
    # Draw a simple network
    ax3.scatter([0.1, 0.1, 0.1, 0.5, 0.5, 0.9], [0.2, 0.5, 0.8, 0.3, 0.7, 0.5], s=300, 
                c=['lightblue', 'lightblue', 'lightblue', 'lightgray', 'lightgray', 'lightgreen'])
    ax3.plot([0.1, 0.5], [0.2, 0.3], 'g-', linewidth=2)
    ax3.plot([0.1, 0.5], [0.2, 0.7], 'g-', linewidth=2)
    ax3.plot([0.1, 0.5], [0.5, 0.3], 'g-', linewidth=2)
    ax3.plot([0.1, 0.5], [0.5, 0.7], 'g-', linewidth=2)
    ax3.plot([0.1, 0.5], [0.8, 0.3], 'g-', linewidth=2)
    ax3.plot([0.1, 0.5], [0.8, 0.7], 'g-', linewidth=2)
    ax3.plot([0.5, 0.9], [0.3, 0.5], 'g-', linewidth=2)
    ax3.plot([0.5, 0.9], [0.7, 0.5], 'g-', linewidth=2)
    
    ax3.text(0.1, 0.2, 'Input 1', ha='center', va='center')
    ax3.text(0.1, 0.5, 'Input 2', ha='center', va='center')
    ax3.text(0.1, 0.8, 'Input 3', ha='center', va='center')
    ax3.text(0.5, 0.3, 'Hidden 1', ha='center', va='center')
    ax3.text(0.5, 0.7, 'Hidden 2', ha='center', va='center')
    ax3.text(0.9, 0.5, 'Output', ha='center', va='center')
    
    ax3.set_xlim(0, 1)
    ax3.set_ylim(0, 1)
    ax3.set_title('Neural Network Structure')
    ax3.axis('off')
    
    buf3 = io.BytesIO()
    canvas3.print_png(buf3)
    network_chart = base64.b64encode(buf3.getbuffer()).decode('ascii')
    
    return jsonify({
        'fitness_chart': f"data:image/png;base64,{fitness_chart}",
        'species_chart': f"data:image/png;base64,{species_chart}",
        'network_chart': f"data:image/png;base64,{network_chart}"
    })

if __name__ == '__main__':
    # Create directories if they don't exist
    os.makedirs('static/images', exist_ok=True)
    os.makedirs('checkpoints', exist_ok=True)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
