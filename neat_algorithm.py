import os
import neat
import numpy as np
import pickle
import matplotlib.pyplot as plt
from matplotlib.figure import Figure
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
import io
import base64

class NEATAlgorithm:
    """
    A class to handle the NEAT algorithm implementation for game AI.
    This class is designed to be reusable across different game environments.
    """
    
    def __init__(self, config_file, checkpoint_prefix, checkpoint_dir='checkpoints'):
        """
        Initialize the NEAT algorithm with configuration.
        
        Args:
            config_file (str): Path to the NEAT configuration file
            checkpoint_prefix (str): Prefix for checkpoint files
            checkpoint_dir (str): Directory to store checkpoints
        """
        print(f"Initializing NEATAlgorithm with config: {config_file}")  # Debug
        self.checkpoint_dir = checkpoint_dir
        os.makedirs(self.checkpoint_dir, exist_ok=True)
        
        self.config_path = os.path.join(os.path.dirname(__file__), config_file)
        if not os.path.exists(self.config_path):
            raise FileNotFoundError(f"Config file not found: {self.config_path}")
        
        self.config = neat.Config(
            neat.DefaultGenome,
            neat.DefaultReproduction,
            neat.DefaultSpeciesSet,
            neat.DefaultStagnation,
            self.config_path
        )
        
        self.checkpoint_prefix = os.path.join(self.checkpoint_dir, checkpoint_prefix)
        self.population = neat.Population(self.config)
        
        self.population.add_reporter(neat.StdOutReporter(True))
        self.stats = neat.StatisticsReporter()
        self.population.add_reporter(self.stats)
        self.population.add_reporter(neat.Checkpointer(
            generation_interval=5,
            time_interval_seconds=300,
            filename_prefix=self.checkpoint_prefix
        ))
        
        self.generation = 0
        self.best_fitness_history = []
        self.avg_fitness_history = []
        self.species_counts = []
    
    def restore_checkpoint(self, checkpoint_file):
        """
        Restore a population from a checkpoint file.
        
        Args:
            checkpoint_file (str): Path to the checkpoint file
        """
        full_path = os.path.join(self.checkpoint_dir, checkpoint_file)
        if os.path.exists(full_path):
            self.population = neat.Checkpointer.restore_checkpoint(full_path)
            print(f"Restored checkpoint: {full_path}")
            return True
        print(f"Checkpoint not found: {full_path}")
        return False
    
    def get_latest_checkpoint(self):
        """
        Get the latest checkpoint file.
        
        Returns:
            str: Path to the latest checkpoint file or None if no checkpoints exist
        """
        checkpoints = [f for f in os.listdir(self.checkpoint_dir) 
                      if f.startswith(os.path.basename(self.checkpoint_prefix))]
        if not checkpoints:
            print("No checkpoints found")
            return None
        checkpoints.sort(key=lambda x: int(x.split('-')[-1]))
        latest = os.path.join(self.checkpoint_dir, checkpoints[-1])
        print(f"Latest checkpoint: {latest}")
        return latest
    
    def save_best_genome(self, genome, filename='best_genome.pkl'):
        """
        Save the best genome to a file.
        
        Args:
            genome: The genome to save
            filename (str): The filename to save to
        """
        if genome is None:
            print("No genome to save")
            return
        filepath = os.path.join(self.checkpoint_dir, filename)
        with open(filepath, 'wb') as f:
            pickle.dump(genome, f)
        print(f"Saved best genome to: {filepath}")
    
    def load_best_genome(self, filename='best_genome.pkl'):
        """
        Load the best genome from a file.
        
        Args:
            filename (str): The filename to load from
            
        Returns:
            The loaded genome or None if file doesn't exist
        """
        filepath = os.path.join(self.checkpoint_dir, filename)
        if os.path.exists(filepath):
            with open(filepath, 'rb') as f:
                genome = pickle.load(f)
                print(f"Loaded best genome from: {filepath}")
                return genome
        print(f"Best genome file not found: {filepath}")
        return None
    
    def run_generation(self, eval_genomes_function, n=1):
        """
        Run the NEAT algorithm for n generations.
        
        Args:
            eval_genomes_function: Function to evaluate genomes
            n (int): Number of generations to run
            
        Returns:
            The best genome after n generations
        """
        print(f"Running {n} generations")  # Debug
        best_genome = self.population.run(eval_genomes_function, n)
        self.generation += n
        print(f"Completed {n} generations. Best genome fitness: {best_genome.fitness if best_genome else 'None'}")
        return best_genome
    
    def update_metrics(self, generation_stats):
        """
        Update metrics for visualization.
        
        Args:
            generation_stats: Dictionary with 'best_genome' and 'mean' keys
        """
        print(f"Updating metrics with stats: {generation_stats}")  # Debug
        if generation_stats.get('best_genome') and hasattr(generation_stats['best_genome'], 'fitness'):
            self.best_fitness_history.append(generation_stats['best_genome'].fitness)
        else:
            self.best_fitness_history.append(0)
            print("No valid best_genome fitness in generation_stats")
        
        if generation_stats.get('mean') is not None:
            self.avg_fitness_history.append(generation_stats['mean'])
        else:
            self.avg_fitness_history.append(0)
            print("No mean fitness in generation_stats")
        
        species_sizes = self.stats.get_species_sizes()
        if species_sizes:
            self.species_counts.append(len(species_sizes))
        else:
            self.species_counts.append(0)
            print("No species sizes available")
    
    def create_fitness_chart(self):
        """
        Create a chart showing fitness over generations.
        
        Returns:
            str: Base64 encoded PNG image of the chart or None if no data
        """
        try:
            if not self.best_fitness_history:
                print("No fitness data to plot")
                return None
            
            fig = Figure(figsize=(10, 6))
            canvas = FigureCanvas(fig)
            ax = fig.add_subplot(111)
            
            generations = list(range(1, len(self.best_fitness_history) + 1))
            ax.plot(generations, self.best_fitness_history, 'b-', label='Best Fitness')
            if self.avg_fitness_history and len(self.avg_fitness_history) == len(self.best_fitness_history):
                ax.plot(generations, self.avg_fitness_history, 'r-', label='Average Fitness')
            
            ax.set_xlabel('Generation')
            ax.set_ylabel('Fitness')
            ax.set_title('Fitness over Generations')
            ax.legend()
            ax.grid(True)
            
            buf = io.BytesIO()
            canvas.print_png(buf)
            data = base64.b64encode(buf.getvalue()).decode('ascii')
            print("Fitness chart generated successfully")
            return f"data:image/png;base64,{data}"
        except Exception as e:
            print(f"Error generating fitness chart: {e}")
            return None
    
    def create_species_chart(self):
        """
        Create a chart showing species count over generations.
        
        Returns:
            str: Base64 encoded PNG image of the chart or None if no data
        """
        try:
            if not self.species_counts:
                print("No species data to plot")
                return None
            
            fig = Figure(figsize=(10, 6))
            canvas = FigureCanvas(fig)
            ax = fig.add_subplot(111)
            
            generations = list(range(1, len(self.species_counts) + 1))
            ax.plot(generations, self.species_counts, 'g-', label='Species Count')
            ax.set_xlabel('Generation')
            ax.set_ylabel('Number of Species')
            ax.set_title('Species Count over Generations')
            ax.legend()
            ax.grid(True)
            
            buf = io.BytesIO()
            canvas.print_png(buf)
            data = base64.b64encode(buf.getvalue()).decode('ascii')
            print("Species chart generated successfully")
            return f"data:image/png;base64,{data}"
        except Exception as e:
            print(f"Error generating species chart: {e}")
            return None
    
    def create_network_structure_chart(self, genome):
        """
        Create a visualization of the neural network structure.
        
        Args:
            genome: The genome to visualize
            
        Returns:
            str: Base64 encoded PNG image of the network structure or None if invalid
        """
        try:
            if genome is None:
                print("No genome provided for network chart")
                return None
            
            fig = Figure(figsize=(12, 9))
            canvas = FigureCanvas(fig)
            ax = fig.add_subplot(111)
            
            node_names = {-1: 'Distance', -2: 'Height', -3: 'Speed', 0: 'Jump'}
            visualize_network(genome, self.config, ax=ax, node_names=node_names)
            
            buf = io.BytesIO()
            canvas.print_png(buf)
            data = base64.b64encode(buf.getvalue()).decode('ascii')
            print("Network chart generated successfully")
            return f"data:image/png;base64,{data}"
        except Exception as e:
            print(f"Error generating network chart: {e}")
            return None

def visualize_network(genome, config, ax=None, node_names=None):
    """
    Visualize the network structure of a genome.
    
    Args:
        genome: The genome to visualize
        config: The NEAT configuration
        ax: Matplotlib axis to draw on
        node_names: Dictionary mapping node IDs to names
    """
    if ax is None:
        fig = plt.figure(figsize=(12, 9))
        ax = fig.add_subplot(111)
    
    if node_names is None:
        node_names = {}
    
    nodes = {}
    for k in config.genome_config.input_keys:
        nodes[k] = {'type': 'input', 'name': node_names.get(k, f'Input {k}')}
    for k in config.genome_config.output_keys:
        nodes[k] = {'type': 'output', 'name': node_names.get(k, f'Output {k}')}
    for k, g in genome.nodes.items():
        if k not in nodes:
            nodes[k] = {'type': 'hidden', 'name': node_names.get(k, f'Hidden {k}')}
    
    input_nodes = [k for k, v in nodes.items() if v['type'] == 'input']
    output_nodes = [k for k, v in nodes.items() if v['type'] == 'output']
    hidden_nodes = [k for k, v in nodes.items() if v['type'] == 'hidden']
    
    n_inputs = len(input_nodes)
    n_outputs = len(output_nodes)
    n_hidden = len(hidden_nodes)
    
    y_gap = 1.0 / (max(n_inputs, n_outputs) + 1)
    
    positions = {}
    
    # Position input nodes on left
    for i, node in enumerate(sorted(input_nodes)):
        positions[node] = (0.1, 1 - (i + 1) * y_gap)
    
    # Position output nodes on right
    for i, node in enumerate(sorted(output_nodes)):
        positions[node] = (0.9, 1 - (i + 1) * y_gap)
    
    # Position hidden nodes in the middle vertically spaced
    for i, node in enumerate(sorted(hidden_nodes)):
        positions[node] = (0.5, 1 - (i + 1) * y_gap)
    
    # Draw nodes
    for node, pos in positions.items():
        x, y = pos
        node_type = nodes[node]['type']
        color = 'lightblue' if node_type == 'input' else 'lightgreen' if node_type == 'output' else 'lightgray'
        ax.scatter(x, y, s=1000, color=color, edgecolor='black', zorder=5)
        ax.text(x, y, nodes[node]['name'], fontsize=10, ha='center', va='center', zorder=6)
    
    # Draw connections
    for cg in genome.connections.values():
        if not cg.enabled:
            continue
        in_pos = positions.get(cg.key[0])
        out_pos = positions.get(cg.key[1])
        if in_pos and out_pos:
            ax.annotate("",
                        xy=out_pos, xycoords='data',
                        xytext=in_pos, textcoords='data',
                        arrowprops=dict(arrowstyle="->", color='black', lw=2))
    
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
