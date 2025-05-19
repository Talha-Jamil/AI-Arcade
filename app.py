from flask import Flask, render_template, jsonify, request
import os
import logging
from dino_ai import DinoGameAI
from flappy_ai import FlappyBirdAI

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize AI instances
try:
    dino_ai = DinoGameAI()
    logger.info("DinoGameAI initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize DinoGameAI: {e}")
    dino_ai = None

try:
    flappy_ai = FlappyBirdAI()
    logger.info("FlappyBirdAI initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize FlappyBirdAI: {e}")
    flappy_ai = None

@app.route('/')
def home():
    logger.debug("Serving index page")
    return render_template('index.html')

@app.route('/dino')
def dino():
    logger.debug("Serving dino page")
    return render_template('dino.html')

@app.route('/chess')
def chess():
    logger.debug("Serving chess page")
    return render_template('chess.html')

@app.route('/flappy')
def flappy():
    logger.debug("Serving flappy page")
    return render_template('flappy.html')

@app.route('/api/dino/train', methods=['POST'])
def train_dino_ai():
    if not dino_ai:
        logger.error("DinoGameAI not initialized")
        return jsonify({'success': False, 'error': 'AI not initialized'}), 500

    try:
        generations = request.json.get('generations', 5)
        logger.info(f"Starting training for {generations} generations")

        result = dino_ai.train(generations)
        logger.debug(f"Train result: {result}")

        response = {
            'success': True,
            'generation': result.get('generation', dino_ai.current_generation),
            'best_fitness': result.get('best_fitness', dino_ai.best_fitness),
            'fitness_chart': dino_ai.get_fitness_chart(),
            'species_chart': dino_ai.get_species_chart(),
            'network_chart': dino_ai.get_network_chart()
        }

        # Log chart data presence
        logger.debug(f"Train response: success={response['success']}, "
                     f"generation={response['generation']}, "
                     f"best_fitness={response['best_fitness']}, "
                     f"fitness_chart={'Valid' if response['fitness_chart'] else 'Missing'}, "
                     f"species_chart={'Valid' if response['species_chart'] else 'Missing'}, "
                     f"network_chart={'Valid' if response['network_chart'] else 'Missing'}")

        return jsonify(response)
    except Exception as e:
        logger.error(f"Error in train_dino_ai: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dino/visualizations', methods=['GET'])
def get_dino_visualizations():
    if not dino_ai:
        logger.error("DinoGameAI not initialized")
        return jsonify({'success': False, 'error': 'AI not initialized'}), 500

    try:
        response = {
            'success': True,
            'generation': dino_ai.current_generation,
            'best_fitness': dino_ai.best_fitness,
            'fitness_chart': dino_ai.get_fitness_chart(),
            'species_chart': dino_ai.get_species_chart(),
            'network_chart': dino_ai.get_network_chart()
        }

        logger.debug(f"Visualizations response: success={response['success']}, "
                     f"generation={response['generation']}, "
                     f"best_fitness={response['best_fitness']}, "
                     f"fitness_chart={'Valid' if response['fitness_chart'] else 'Missing'}, "
                     f"species_chart={'Valid' if response['species_chart'] else 'Missing'}, "
                     f"network_chart={'Valid' if response['network_chart'] else 'Missing'}")

        return jsonify(response)
    except Exception as e:
        logger.error(f"Error in get_dino_visualizations: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/flappy/train', methods=['POST'])
def train_flappy_ai():
    if not flappy_ai:
        logger.error("FlappyBirdAI not initialized")
        return jsonify({'success': False, 'error': 'AI not initialized'}), 500

    try:
        generations = request.json.get('generations', 5)
        logger.info(f"Starting Flappy training for {generations} generations")

        result = flappy_ai.train(generations)
        logger.debug(f"Flappy train result: {result}")

        response = {
            'success': True,
            'generation': result.get('generation', flappy_ai.current_generation),
            'best_fitness': result.get('best_fitness', flappy_ai.best_fitness),
            'fitness_chart': flappy_ai.get_fitness_chart(),
            'species_chart': flappy_ai.get_species_chart(),
            'network_chart': flappy_ai.get_network_chart()
        }

        logger.debug(f"Flappy train response: success={response['success']}, "
                     f"generation={response['generation']}, "
                     f"best_fitness={response['best_fitness']}, "
                     f"fitness_chart={'Valid' if response['fitness_chart'] else 'Missing'}, "
                     f"species_chart={'Valid' if response['species_chart'] else 'Missing'}, "
                     f"network_chart={'Valid' if response['network_chart'] else 'Missing'}")

        return jsonify(response)
    except Exception as e:
        logger.error(f"Error in train_flappy_ai: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dino/action', methods=['POST'])
def get_dino_action():
    if not dino_ai:
        logger.error("DinoGameAI not initialized")
        return jsonify({'success': False, 'error': 'AI not initialized'}), 500

    try:
        game_state = request.json.get('game_state', [100, 20, 10])
        logger.debug(f"Received game_state: {game_state}")
        action = dino_ai.get_action(game_state)
        logger.debug(f"Dino action: {action}")
        return jsonify({'action': action})
    except Exception as e:
        logger.error(f"Error in get_dino_action: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/flappy/action', methods=['POST'])
def get_flappy_action():
    if not flappy_ai:
        logger.error("FlappyBirdAI not initialized")
        return jsonify({'success': False, 'error': 'AI not initialized'}), 500

    try:
        game_state = request.json.get('game_state', [100, 50, 50])
        logger.debug(f"Received flappy game_state: {game_state}")
        action = flappy_ai.get_action(game_state)
        logger.debug(f"Flappy action: {action}")
        return jsonify({'action': action})
    except Exception as e:
        logger.error(f"Error in get_flappy_action: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# --- TIC TAC TOE ---
@app.route('/tictactoe')
def tic_tac_toe():
    logger.debug("Serving tictactoe page")
    return render_template('tictactoe.html')

def check_winner(board):
    wins = [
        (0,1,2),(3,4,5),(6,7,8),
        (0,3,6),(1,4,7),(2,5,8),
        (0,4,8),(2,4,6)
    ]
    for a, b, c in wins:
        if board[a] and board[a] == board[b] == board[c]:
            return board[a]
    if all(cell for cell in board):
        return 'Draw'
    return None

def minimax(board, player, ai_symbol, human_symbol):
    winner = check_winner(board)
    if winner == ai_symbol:
        return 1, None
    if winner == human_symbol:
        return -1, None
    if winner == 'Draw':
        return 0, None

    moves = []
    for idx, cell in enumerate(board):
        if not cell:
            new_board = board.copy()
            new_board[idx] = player
            next_p = human_symbol if player == ai_symbol else ai_symbol
            score, _ = minimax(new_board, next_p, ai_symbol, human_symbol)
            moves.append((score, idx))

    if player == ai_symbol:
        max_score = max(moves, key=lambda x: x[0])[0]
        best_idxs = [idx for score, idx in moves if score == max_score]
        return max_score, best_idxs[0]
    else:
        min_score = min(moves, key=lambda x: x[0])[0]
        best_idxs = [idx for score, idx in moves if score == min_score]
        return min_score, best_idxs[0]

@app.route('/api/tictactoe/ai_move', methods=['POST'])
def tictactoe_ai_move():
    try:
        data = request.json
        board = data.get('board', [''] * 9)
        ai_symbol = data.get('ai', 'O')
        human_symbol = 'X' if ai_symbol == 'O' else 'O'
        logger.debug(f"Tic-Tac-Toe board: {board}, AI: {ai_symbol}")
        _, move = minimax(board, ai_symbol, ai_symbol, human_symbol)
        logger.debug(f"Tic-Tac-Toe AI move: {move}")
        return jsonify({'move': move})
    except Exception as e:
        logger.error(f"Error in tictactoe_ai_move: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    # Ensure directories exist
    os.makedirs('static/images', exist_ok=True)
    os.makedirs('checkpoints', exist_ok=True)

    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False)
