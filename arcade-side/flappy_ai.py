import os
import neat
import numpy as np
from neat_algorithm import NEATAlgorithm

class FlappyBirdAI:
    """
    Class to handle the AI for the Flappy Bird game using NEAT algorithm.
    """
    
    def __init__(self, config_file='neat_config.txt'):
        """
        Initialize the Flappy Bird AI.
        
        Args:
            config_file (str): Path to the NEAT configuration file
        """
        # Create NEAT algorithm instance
        self.neat_algorithm = NEATAlgorithm(config_file, 'flappy-checkpoint-')
        
        # Game parameters
        self.gravity = 0.5
        self.flap_velocity = -8
        
        # Track current generation
        self.current_generation = 0
        
        # Best genome so far
        self.best_genome = None
        self.best_fitness = 0
        
    def eval_genomes(self, genomes, config):
        """
        Evaluate each genome by letting it play the game.
        
        Args:
            genomes: List of genomes to evaluate
            config: NEAT configuration
        """
        self.current_generation += 1
        
        # Track best fitness in this generation
        max_fitness = 0
        best_genome_id = None
        
        for genome_id, genome in genomes:
            # Create neural network from genome
            net = neat.nn.FeedForwardNetwork.create(genome, config)
            
            # Reset fitness
            genome.fitness = 0
            
            # Simulate game for this genome
            fitness = self.simulate_game(net)
            genome.fitness = fitness
            
            # Track best genome
            if fitness > max_fitness:
                max_fitness = fitness
                best_genome_id = genome_id
            
            # Update best overall genome
            if fitness > self.best_fitness:
                self.best_fitness = fitness
                self.best_genome = genome
                self.neat_algorithm.save_best_genome(genome)
        
        # Update metrics for visualization
        self.neat_algorithm.update_metrics({
            'best_genome': genomes[best_genome_id][1] if best_genome_id is not None else None,
            'mean': np.mean([g.fitness for _, g in genomes])
        })
        
        print(f"Generation {self.current_generation} - Max Fitness: {max_fitness}")
    
    def simulate_game(self, neural_network):
        """
        Simulate the game for a single neural network.
        
        Args:
            neural_network: Neural network to evaluate
            
        Returns:
            float: Fitness score
        """
        # This is a simplified simulation for the evaluation function
        # The actual game simulation will be implemented in the game code
        
        # Placeholder variables
        bird_y = 300  # Bird's y position
        bird_velocity = 0  # Bird's velocity
        score = 0
        alive = True
        
        # Pipe variables
        pipe_x = 500  # Initial pipe position
        pipe_gap_y = 200  # Position of the gap in the pipe
        pipe_gap_height = 100  # Height of the gap
        
        # Simulate for a maximum of 1000 frames
        for _ in range(1000):
            if not alive:
                break
                
            # Get game state
            horizontal_distance_to_pipe = pipe_x - 50  # Distance from bird to next pipe
            vertical_distance_to_top_pipe = bird_y - (pipe_gap_y - pipe_gap_height/2)  # Distance to top pipe
            vertical_distance_to_bottom_pipe = (pipe_gap_y + pipe_gap_height/2) - bird_y  # Distance to bottom pipe
            
            # Normalize inputs
            inputs = [
                horizontal_distance_to_pipe / 500.0,  # Normalize to 0-1
                vertical_distance_to_top_pipe / 400.0,  # Normalize to 0-1
                vertical_distance_to_bottom_pipe / 400.0  # Normalize to 0-1
            ]
            
            # Get neural network output
            output = neural_network.activate(inputs)
            
            # Decide action based on output
            # Output > 0.5 means flap
            should_flap = output[0] > 0.5
            
            # Update bird position and velocity
            if should_flap:
                bird_velocity = self.flap_velocity
            
            bird_velocity += self.gravity
            bird_y += bird_velocity
            
            # Update pipe position
            pipe_x -= 5
            
            # Check if bird passed the pipe
            if pipe_x < 0:
                pipe_x = 500
                pipe_gap_y = np.random.randint(100, 400)
                score += 1
            
            # Check for collisions
            # Bird hits the ground or ceiling
            if bird_y < 0 or bird_y > 600:
                alive = False
            
            # Bird hits the pipes
            if 0 < pipe_x < 100:
                if bird_y < (pipe_gap_y - pipe_gap_height/2) or bird_y > (pipe_gap_y + pipe_gap_height/2):
                    alive = False
        
        return score
    
    def get_action(self, game_state):
        """
        Get the AI action for the current game state.
        
        Args:
            game_state: Current state of the game (distance to pipe, vertical distances)
            
        Returns:
            bool: True if the AI should flap, False otherwise
        """
        if self.best_genome is None:
            return False
            
        # Create neural network from best genome
        net = neat.nn.FeedForwardNetwork.create(self.best_genome, self.neat_algorithm.config)
        
        # Normalize inputs
        horizontal_distance, vertical_distance_top, vertical_distance_bottom = game_state
        inputs = [
            horizontal_distance / 500.0,  # Normalize to 0-1
            vertical_distance_top / 400.0,  # Normalize to 0-1
            vertical_distance_bottom / 400.0  # Normalize to 0-1
        ]
        
        # Get neural network output
        output = net.activate(inputs)
        
        # Output > 0.5 means flap
        return output[0] > 0.5
    
    def train(self, generations=10):
        """
        Train the AI for a specified number of generations.
        
        Args:
            generations (int): Number of generations to train
            
        Returns:
            The best genome after training
        """
        # Run NEAT algorithm
        best_genome = self.neat_algorithm.run_generation(self.eval_genomes, generations)
        
        # Save best genome
        self.best_genome = best_genome
        self.neat_algorithm.save_best_genome(best_genome)
        
        return best_genome
    
    def get_fitness_chart(self):
        """
        Get the fitness chart.
        
        Returns:
            str: Base64 encoded PNG image of the fitness chart
        """
        return self.neat_algorithm.create_fitness_chart()
    
    def get_species_chart(self):
        """
        Get the species chart.
        
        Returns:
            str: Base64 encoded PNG image of the species chart
        """
        return self.neat_algorithm.create_species_chart()
    
    def get_network_chart(self):
        """
        Get the neural network structure chart.
        
        Returns:
            str: Base64 encoded PNG image of the network structure
        """
        return self.neat_algorithm.create_network_structure_chart(self.best_genome)
