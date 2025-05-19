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
        # Ensure checkpoint directory exists
        self.checkpoint_dir = checkpoint_dir
        os.makedirs(self.checkpoint_dir, exist_ok=True)
        
        # Load configuration
        self.config_path = os.path.join(os.path.dirname(__file__), config_file)
        self.config = neat.Config(
            neat.DefaultGenome,
            neat.DefaultReproduction,
            neat.DefaultSpeciesSet,
            neat.DefaultStagnation,
            self.config_path
        )
        
        # Set checkpoint prefix
        self.checkpoint_prefix = os.path.join(self.checkpoint_dir, checkpoint_prefix)
        
        # Initialize population
        self.population = neat.Population(self.config)
        
        # Add reporters to show progress
        self.population.add_reporter(neat.StdOutReporter(True))
        self.stats = neat.StatisticsReporter()
        self.population.add_reporter(self.stats)
        self.population.add_reporter(neat.Checkpointer(
            generation_interval=5,
            time_interval_seconds=300,
            filename_prefix=self.checkpoint_prefix
        ))
        
        # Track metrics for visualization
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
            return None
        
        # Sort by generation number
        checkpoints.sort(key=lambda x: int(x.split('-')[-1]))
        return os.path.join(self.checkpoint_dir, checkpoints[-1])
    
    def save_best_genome(self, genome, filename='best_genome.pkl'):
        """
        Save the best genome to a file.
        
        Args:
            genome: The genome to save
            filename (str): The filename to save to
        """
        with open(os.path.join(self.checkpoint_dir, filename), 'wb') as f:
            pickle.dump(genome, f)
            
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
                return pickle.load(f)
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
        # Set the evaluation function
        self.population.reproduction.genome_indexer.eval_function = eval_genomes_function
        
        # Run for n generations
        best_genome = self.population.run(eval_genomes_function, n)
        
        # Update metrics
        self.generation += n
        
        return best_genome
    
    def update_metrics(self, generation_stats):
        """
        Update metrics for visualization.
        
        Args:
            generation_stats: Statistics from the current generation
        """
        if hasattr(generation_stats, 'best_genome'):
            self.best_fitness_history.append(generation_stats.best_genome.fitness)
        if hasattr(generation_stats, 'mean'):
            self.avg_fitness_history.append(generation_stats.mean)
        if hasattr(self.stats, 'get_species_sizes'):
            self.species_counts.append(len(self.stats.get_species_sizes()))
    
    def create_fitness_chart(self):
        """
        Create a chart showing fitness over generations.
        
        Returns:
            str: Base64 encoded PNG image of the chart
        """
        fig = Figure(figsize=(10, 6))
        canvas = FigureCanvas(fig)
        ax = fig.add_subplot(111)
        
        generations = list(range(1, len(self.best_fitness_history) + 1))
        
        ax.plot(generations, self.best_fitness_history, 'b-', label='Best Fitness')
        if self.avg_fitness_history:
            ax.plot(generations, self.avg_fitness_history, 'r-', label='Average Fitness')
        
        ax.set_xlabel('Generation')
        ax.set_ylabel('Fitness')
        ax.set_title('Fitness over Generations')
        ax.legend()
        ax.grid(True)
        
        # Save to a PNG image
        buf = io.BytesIO()
        canvas.print_png(buf)
        data = base64.b64encode(buf.getbuffer()).decode('ascii')
        
        return f"data:image/png;base64,{data}"
    
    def create_species_chart(self):
        """
        Create a chart showing species count over generations.
        
        Returns:
            str: Base64 encoded PNG image of the chart
        """
        if not self.species_counts:
            return None
            
        fig = Figure(figsize=(10, 6))
        canvas = FigureCanvas(fig)
        ax = fig.add_subplot(111)
        
        generations = list(range(1, len(self.species_counts) + 1))
        
        ax.plot(generations, self.species_counts, 'g-')
        ax.set_xlabel('Generation')
        ax.set_ylabel('Number of Species')
        ax.set_title('Species Count over Generations')
        ax.grid(True)
        
        # Save to a PNG image
        buf = io.BytesIO()
        canvas.print_png(buf)
        data = base64.b64encode(buf.getbuffer()).decode('ascii')
        
        return f"data:image/png;base64,{data}"
    
    def create_network_structure_chart(self, genome):
        """
        Create a visualization of the neural network structure.
        
        Args:
            genome: The genome to visualize
            
        Returns:
            str: Base64 encoded PNG image of the network structure
        """
        if genome is None:
            return None
            
        # Create the network
        network = neat.nn.FeedForwardNetwork.create(genome, self.config)
        
        # Get node and connection information
        node_names = {-1: 'Distance', -2: 'Height', -3: 'Speed', 0: 'Jump'}
        
        fig = Figure(figsize=(12, 9))
        canvas = FigureCanvas(fig)
        ax = fig.add_subplot(111)
        
        # Draw the network
        visualize_network(genome, self.config, ax=ax, node_names=node_names)
        
        # Save to a PNG image
        buf = io.BytesIO()
        canvas.print_png(buf)
        data = base64.b64encode(buf.getbuffer()).decode('ascii')
        
        return f"data:image/png;base64,{data}"

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
    
    # Create network
    nodes = {}
    for k in config.genome_config.input_keys:
        nodes[k] = {'type': 'input', 'name': node_names.get(k, f'Input {k}')}
    
    for k in config.genome_config.output_keys:
        nodes[k] = {'type': 'output', 'name': node_names.get(k, f'Output {k}')}
    
    for k, g in genome.nodes.items():
        if k not in nodes:
            nodes[k] = {'type': 'hidden', 'name': node_names.get(k, f'Hidden {k}')}
    
    # Calculate positions
    input_nodes = [k for k, v in nodes.items() if v['type'] == 'input']
    output_nodes = [k for k, v in nodes.items() if v['type'] == 'output']
    hidden_nodes = [k for k, v in nodes.items() if v['type'] == 'hidden']
    
    n_inputs = len(input_nodes)
    n_outputs = len(output_nodes)
    n_hidden = len(hidden_nodes)
    
    # Position nodes
    for i, k in enumerate(input_nodes):
        nodes[k]['position'] = (0.1, 0.1 + 0.8 * i / max(1, n_inputs - 1))
    
    for i, k in enumerate(output_nodes):
        nodes[k]['position'] = (0.9, 0.1 + 0.8 * i / max(1, n_outputs - 1))
    
    for i, k in enumerate(hidden_nodes):
        nodes[k]['position'] = (0.5, 0.1 + 0.8 * i / max(1, n_hidden - 1))
    
    # Draw connections
    for cg in genome.connections.values():
        if not cg.enabled:
            continue
        
        input_node = nodes[cg.key[0]]
        output_node = nodes[cg.key[1]]
        
        x1, y1 = input_node['position']
        x2, y2 = output_node['position']
        
        # Determine color based on weight
        color = 'green' if cg.weight > 0 else 'red'
        width = 0.1 + abs(cg.weight) / 5.0
        
        ax.plot([x1, x2], [y1, y2], color=color, linewidth=width, alpha=0.8)
    
    # Draw nodes
    for k, node in nodes.items():
        x, y = node['position']
        
        if node['type'] == 'input':
            color = 'lightblue'
        elif node['type'] == 'output':
            color = 'lightgreen'
        else:
            color = 'lightgray'
        
        ax.scatter(x, y, s=300, color=color, zorder=10)
        ax.text(x, y, node['name'], ha='center', va='center', zorder=11)
    
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.set_title('Neural Network Structure')
    ax.axis('off')
