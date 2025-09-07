"""Example simulation runner for FHT simulations.

This script demonstrates a toy entropy growth simulation on a fractal
substrate. It evolves a simple state vector across fractal depths and
records the von Neumann entropy at each stage.
"""
import numpy as np
from fht.math.groups import su2_rotation
from fht.holonomy.transport import parallel_transport
from fht.topology.fractal_space import cantor_set
from fht.entropy.estimators import von_neumann_entropy


def run_entropy_growth(max_depth: int = 5):
    """Run a toy simulation of entropy growth over fractal depths.

    Args:
        max_depth: Maximum fractal depth to simulate.

    Returns:
        A list of entropy values at each depth.
    """
    state = np.array([1.0 + 0j, 0.0 + 0j])
    entropies = []
    for depth in range(1, max_depth + 1):
        # Example rotation about Z-axis
        rot = su2_rotation(np.pi / (depth + 1), np.array([0, 0, 1]))
        state = rot @ state
        state = parallel_transport(state, depth)
        rho = np.outer(state, np.conj(state))
        entropy = von_neumann_entropy(rho)
        entropies.append(entropy)
    return entropies


if __name__ == "__main__":
    entropies = run_entropy_growth()
    for depth, ent in enumerate(entropies, start=1):
        print(f"Depth {depth}: Entropy = {ent:.4f}")
