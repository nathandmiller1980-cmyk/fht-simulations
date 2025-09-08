"""
Fractal Holonomy Theory (FHT) – 2D Cantor Dust Entanglement Simulation
=======================================================================

This module implements a simple toy model to study entanglement dynamics
across a two‑dimensional fractal region (a "Cantor dust").  While this
simulation is highly idealised, it captures qualitative features of
ballistic entanglement spreading and non‑local correlations in fractal
lattices.

The key ideas implemented here are:

* Construction of a Cantor dust on a square lattice via recursive removal
  of central blocks.
* Calculation of the number of sites in each fractal region and the number
  of boundary edges connecting disjoint regions.  These counts are used
  as proxies for entanglement entropy.
* A simple time evolution where entanglement spreads outward from an
  initially entangled seed at ballistic speed until saturating the fractal.

Run this script directly to view a summary of entanglement growth as a
function of time.

Note: This is not a physical quantum simulation; it is a combinatorial
exercise designed for pedagogical purposes.
"""

from __future__ import annotations

import numpy as np


def cantor_dust_mask(depth: int) -> np.ndarray:
    """Return a 2D boolean mask for a Cantor dust of the given depth.

    At each recursion level, the middle third of each occupied block is
    removed in both dimensions.  The resulting mask indicates which
    lattice sites are present (True) or removed (False).

    Parameters
    ----------
    depth : int
        The number of recursion steps.  Depth 0 returns a single True.

    Returns
    -------
    numpy.ndarray
        A square boolean array of side length 3**depth.
    """
    if depth == 0:
        return np.array([[True]])
    prev = cantor_dust_mask(depth - 1)
    n = prev.shape[0]
    # Construct a 3×3 block from the previous pattern with central block removed.
    block = np.empty((3 * n, 3 * n), dtype=bool)
    for i in range(3):
        for j in range(3):
            if i == 1 and j == 1:
                block[i * n:(i + 1) * n, j * n:(j + 1) * n] = False
            else:
                block[i * n:(i + 1) * n, j * n:(j + 1) * n] = prev
    return block


def entanglement_entropy(mask: np.ndarray) -> float:
    """Estimate a proxy for entanglement entropy of a fractal region.

    We count the number of boundary edges (adjacent True–False pairs) and
    return their logarithm base 2.  This serves as a stand‑in for the
    entanglement between the fractal and its complement.

    Parameters
    ----------
    mask : numpy.ndarray
        Boolean mask of occupied sites.

    Returns
    -------
    float
        Entanglement entropy estimate in bits.
    """
    # Count horizontal and vertical boundaries between occupied and empty cells.
    horz_edges = np.logical_xor(mask[:, :-1], mask[:, 1:]).sum()
    vert_edges = np.logical_xor(mask[:-1, :], mask[1:, :]).sum()
    boundary_edges = horz_edges + vert_edges
    # Avoid log(0) by ensuring at least one boundary.
    return float(0 if boundary_edges == 0 else np.log2(boundary_edges))


def entanglement_growth(depth: int, max_time: int) -> list[float]:
    """Simulate ballistic growth of entanglement on a Cantor dust lattice.

    At time t the entangled region is defined by a diamond (Manhattan
    metric) of radius t/2 centred in the lattice.  Entanglement saturates
    when the diamond covers the entire fractal.  For each time step we
    compute an entropy proxy by restricting the fractal mask to the
    entangled region and counting boundary edges.

    Parameters
    ----------
    depth : int
        Depth of the Cantor construction.
    max_time : int
        Number of time steps to simulate.

    Returns
    -------
    list of float
        Entropy proxy at each time step.
    """
    mask = cantor_dust_mask(depth)
    N = mask.shape[0]
    # Coordinates of each site
    coords = np.indices(mask.shape).reshape(2, -1).T
    centre = np.array([N // 2, N // 2])
    entanglement = []
    for t in range(max_time + 1):
        radius = t / 2
        # Determine which sites lie within the diamond region.
        within = np.sum(np.abs(coords - centre), axis=1) <= radius
        entangled_mask = np.zeros_like(mask, dtype=bool)
        entangled_mask[coords[within, 0], coords[within, 1]] = mask[coords[within, 0], coords[within, 1]]
        S = entanglement_entropy(entangled_mask)
        entanglement.append(S)
    return entanglement


def main() -> None:
    """Run the entanglement simulation for a sample fractal and report results."""
    depth = 3
    max_time = 10
    entropy_series = entanglement_growth(depth, max_time)
    print(f"Fractal lattice side length: {3**depth}")
    print("Entanglement proxy as a function of time (bits):")
    for t, S in enumerate(entropy_series):
        print(f"t={t}: S={S:.3f}")


if __name__ == "__main__":
    main()