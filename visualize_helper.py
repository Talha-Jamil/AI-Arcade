from graphviz import Digraph

def make_net(genome, config, node_names=None, show_disabled=True, prune_unused=False, node_colors=None):
    connections = [cg for cg in genome.connections.values() if show_disabled or cg.enabled]
    nodes = set()
    for cg in connections:
        nodes.add(cg.key[0])
        nodes.add(cg.key[1])

    dot = Digraph(format='svg')
    for n in genome.nodes:
        name = node_names[n] if node_names and n in node_names else str(n)
        dot.node(name, _attributes={"shape": "circle"})

    for cg in connections:
        input_node = node_names[cg.key[0]] if node_names and cg.key[0] in node_names else str(cg.key[0])
        output_node = node_names[cg.key[1]] if node_names and cg.key[1] in node_names else str(cg.key[1])
        style = "solid" if cg.enabled else "dotted"
        color = "green" if cg.weight > 0 else "red"
        dot.edge(input_node, output_node, _attributes={"style": style, "color": color})

    return dot
