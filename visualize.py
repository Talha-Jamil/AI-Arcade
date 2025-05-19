import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # For headless environments (no GUI)

import os
import numpy as np
import graphviz
import visualize_helper as helper  # We'll add this below if needed


def plot_stats(statistics, filename):
    generation = range(len(statistics.most_fit_genomes))
    best_fitness = [g.fitness for g in statistics.most_fit_genomes]

    plt.figure()
    plt.plot(generation, best_fitness)
    plt.title("Fitness over Generations")
    plt.xlabel("Generation")
    plt.ylabel("Best Fitness")
    plt.grid(True)
    plt.savefig(filename)
    plt.close()


def plot_species(statistics, filename):
    species_sizes = statistics.get_species_sizes()
    num_generations = len(species_sizes)

    data = np.zeros((num_generations, len(statistics.species_spawns[0])))

    for i in range(num_generations):
        for j in range(len(species_sizes[i])):
            data[i][j] = species_sizes[i][j]

    plt.stackplot(range(num_generations), data.T)
    plt.title("Species Size over Generations")
    plt.xlabel("Generation")
    plt.ylabel("Species Size")
    plt.savefig(filename)
    plt.close()


def draw_net(config, genome, filename):
    node_names = {}
    dot = helper.make_net(genome, config, node_names=node_names)
    dot.render(filename, format="svg", cleanup=True)
