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
        self.neat_algorithm = NEATAlgorithm(config_file, 'dino-checkpoint-')

        # Game parameters
        self.game_speed = 10
        self.gravity = 0.8
        self.jump_velocity = -16
        self.dino_height = 70
        self.dino_width = 50
        self.ground_height = 50
        self.canvas_height = 400
        self.obstacle_width = 40
        self.obstacle_min_height = 40
        self.obstacle_max_height = 80

        self.current_generation = 0
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

        max_fitness = 0
        best_genome = None
        fitnesses = []

        for genome_id, genome in genomes:
            net = neat.nn.FeedForwardNetwork.create(genome, config)
            genome.fitness = 0

            fitness = self.simulate_game(net)
            genome.fitness = fitness
            fitnesses.append(fitness)

            if fitness > max_fitness:
                max_fitness = fitness
                best_genome = genome

            if fitness > self.best_fitness:
                self.best_fitness = fitness
                self.best_genome = genome
                self.neat_algorithm.save_best_genome(genome)

        self.neat_algorithm.update_metrics({
            'best_genome': best_genome,
            'mean': np.mean(fitnesses) if fitnesses else 0
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
        dino = {
            'x': 100,
            'y': self.canvas_height - self.ground_height - self.dino_height,
            'width': self.dino_width,
            'height': self.dino_height,
            'velocity': 0,
            'jumping': False
        }

        obstacles = []
        distance = 0
        score = 0
        game_speed = self.game_speed
        alive = True

        for frame in range(1000):
            if not alive:
                break

            # Physics
            dino['velocity'] += self.gravity
            dino['y'] += dino['velocity']

            if dino['y'] > self.canvas_height - self.ground_height - dino['height']:
                dino['y'] = self.canvas_height - self.ground_height - dino['height']
                dino['velocity'] = 0
                dino['jumping'] = False

            # Obstacle creation
            if not obstacles or obstacles[-1]['x'] < 800 - (400 + np.random.randint(0, 350)):
                obstacle_height = np.random.randint(self.obstacle_min_height, self.obstacle_max_height + 1)
                obstacles.append({
                    'x': 800,
                    'y': self.canvas_height - self.ground_height - obstacle_height,
                    'width': self.obstacle_width,
                    'height': obstacle_height
                })

            # Update obstacles
            for obstacle in obstacles[:]:
                obstacle['x'] -= game_speed
                if obstacle['x'] + obstacle['width'] < 0:
                    obstacles.remove(obstacle)
                    score += 1

            # Find next obstacle
            next_obstacle = None
            for obstacle in obstacles:
                if obstacle['x'] + obstacle['width'] > dino['x']:
                    next_obstacle = obstacle
                    break

            if next_obstacle:
                distance_to_obstacle = next_obstacle['x'] - dino['x']
                height_of_obstacle = next_obstacle['height']
            else:
                distance_to_obstacle = 800
                height_of_obstacle = 0

            # Neural network input
            inputs = [
                distance_to_obstacle / 800.0,
                height_of_obstacle / 80.0,
                game_speed / 20.0
            ]

            output = neural_network.activate(inputs)
            should_jump = output[0] > 0.5

            if should_jump and not dino['jumping']:
                dino['velocity'] = self.jump_velocity
                dino['jumping'] = True

            # Collision detection
            for obstacle in obstacles:
                if (
                    dino['x'] < obstacle['x'] + obstacle['width'] and
                    dino['x'] + dino['width'] > obstacle['x'] and
                    dino['y'] < obstacle['y'] + obstacle['height'] and
                    dino['y'] + dino['height'] > obstacle['y']
                ):
                    alive = False
                    break

            distance += game_speed

            if score % 10 == 0 and score > 0:
                game_speed += 0.4

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

        net = neat.nn.FeedForwardNetwork.create(self.best_genome, self.neat_algorithm.config)
        distance_to_obstacle, height_of_obstacle, current_speed = game_state
        inputs = [
            distance_to_obstacle / 800.0,
            height_of_obstacle / 80.0,
            current_speed / 20.0
        ]
        output = net.activate(inputs)
        return output[0] > 0.5
    
    def train(self, generations=5):
        """
        Train the AI for a specified number of generations.
        
        Args:
            generations (int): Number of generations to train
            
        Returns:
            The best genome after training
        """
        best_genome = self.neat_algorithm.run_generation(self.eval_genomes, generations)

        if best_genome and (not self.best_genome or best_genome.fitness > self.best_fitness):
            self.best_genome = best_genome
            self.best_fitness = best_genome.fitness
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
