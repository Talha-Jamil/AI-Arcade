import os
import neat
import numpy as np
from neat_algorithm import NEATAlgorithm

class DinoGameAI:
    """
    Class to handle the AI for the Chrome Dino game using NEAT algorithm.
    """
    
    def __init__(self, config_file='neat_config.txt'):
        """
        Initialize the Dino Game AI.
        
        Args:
            config_file (str): Path to the NEAT configuration file
        """
        # Create NEAT algorithm instance
        self.neat_algorithm = NEATAlgorithm(config_file, 'dino-checkpoint-')
        
        # Game parameters
        self.game_speed = 10
        self.gravity = 0.8
        self.jump_velocity = -16
        
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
        distance = 0
        alive = True
        score = 0
        
        # Simulate for a maximum of 1000 frames
        for _ in range(1000):
            if not alive:
                break
                
            # Get game state (in actual implementation, this would come from the game)
            # For now, we'll use placeholder values
            distance_to_obstacle = 100 - (distance % 100)  # Distance to next obstacle
            height_of_obstacle = 20  # Height of obstacle
            current_speed = self.game_speed  # Current game speed
            
            # Normalize inputs
            inputs = [
                distance_to_obstacle / 100.0,  # Normalize to 0-1
                height_of_obstacle / 50.0,     # Normalize to 0-1
                current_speed / 20.0           # Normalize to 0-1
            ]
            
            # Get neural network output
            output = neural_network.activate(inputs)
            
            # Decide action based on output
            # Output > 0.5 means jump
            should_jump = output[0] > 0.5
            
            # Simulate game physics and collision
            # In the actual implementation, this would be handled by the game
            if should_jump and distance % 50 == 0:  # Simplified collision check
                # Successfully jumped over obstacle
                pass
            elif distance % 100 < 5 and distance > 0:  # Simplified collision check
                # Collision with obstacle
                alive = False
            
            # Update distance and score
            distance += self.game_speed
            score = distance
            
            # Increase game speed over time
            if distance % 100 == 0:
                self.game_speed += 0.1
        
        return score
    
    def get_action(self, game_state):
        """
        Get the AI action for the current game state.
        
        Args:
            game_state: Current state of the game (distance to obstacle, height, speed)
            
        Returns:
            bool: True if the AI should jump, False otherwise
        """
        if self.best_genome is None:
            return False
            
        # Create neural network from best genome
        net = neat.nn.FeedForwardNetwork.create(self.best_genome, self.neat_algorithm.config)
        
        # Normalize inputs
        distance_to_obstacle, height_of_obstacle, current_speed = game_state
        inputs = [
            distance_to_obstacle / 100.0,  # Normalize to 0-1
            height_of_obstacle / 50.0,     # Normalize to 0-1
            current_speed / 20.0           # Normalize to 0-1
        ]
        
        # Get neural network output
        output = net.activate(inputs)
        
        # Output > 0.5 means jump
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
