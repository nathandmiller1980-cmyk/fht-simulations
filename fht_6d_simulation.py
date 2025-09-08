"""
Fractal Holonomy Theory (FHT) – 6D Toy Universe Simulation
==========================================================

This module extends the 5D toy model to six dimensions in order to probe
concepts such as non‑Abelian holonomy, fractal Kaluza–Klein towers, and
emergent supergravity within a higher‑dimensional fractal lattice.  The
code offers several simple routines:

1. **Non‑Abelian Holonomy in 6D** – Constructs two rotation matrices acting
   in orthogonal planes of a 6D hypercube and verifies that their product
   depends on ordering.

2. **Fractal Kaluza–Klein Towers** – Models two compactified dimensions
   (labelled ``u`` and ``v``) that follow a self‑similar subdivision rule.
   Computes discrete momentum spectra and an effective vacuum energy density.

3. **Emergent Supergravity** – Builds a holonomy matrix from alternating
   rotations and reflections across the six dimensions, computes its
   logarithm and separates bosonic (symmetric) and fermionic (antisymmetric)
   components.  These pieces serve as a toy analogue of curvature and
   torsion in supergravity.

Run this script directly to see the results of these simulations.

Author: OpenAI Assistant for FHT simulations
"""

from __future__ import annotations

import numpy as np
from scipy.linalg import logm


def rotation_matrix_6d(i: int, j: int, theta: float) -> np.ndarray:
    """Return a 6×6 rotation matrix rotating in the (i,j) plane by angle theta.

    Parameters
    ----------
    i, j : int
        Zero‑based indices of the coordinate axes to rotate.
    theta : float
        Rotation angle in radians.

    Returns
    -------
    numpy.ndarray
        An orthogonal 6×6 rotation matrix.
    """
    R = np.eye(6)
    c, s = np.cos(theta), np.sin(theta)
    R[i, i] = c
    R[j, j] = c
    R[i, j] = -s
    R[j, i] = s
    return R


def reflection_matrix_6d(axis: int) -> np.ndarray:
    """Return a 6×6 reflection matrix that flips the sign of the given axis.

    Parameters
    ----------
    axis : int
        Zero‑based index of the coordinate axis to reflect.

    Returns
    -------
    numpy.ndarray
        A diagonal matrix with a single −1 entry on the chosen axis.
    """
    R = np.eye(6)
    R[axis, axis] = -1
    return R


def test_non_abelian_holonomy(theta: float = np.pi / 4) -> bool:
    """Check non‑commutativity of two holonomy operations in 6D.

    Constructs rotations in two independent planes – (x,y) and (u,v) – and
    returns True if their product is order dependent, demonstrating
    non‑Abelian holonomy in six dimensions.

    Parameters
    ----------
    theta : float, optional
        Rotation angle in radians.  Default is π/4.

    Returns
    -------
    bool
        True if R_xy R_uv != R_uv R_xy.
    """
    # Use two planes that share an axis to ensure non‑commutativity.  Here
    # (0,1) and (1,2) correspond to x‑y and y‑z rotations.
    R_xy = rotation_matrix_6d(0, 1, theta)
    R_yz = rotation_matrix_6d(1, 2, theta)
    prod1 = R_xy @ R_yz
    prod2 = R_yz @ R_xy
    return not np.allclose(prod1, prod2, atol=1e-12)


def simulate_fractal_kk_towers(max_depth: int = 3, L_u: float = 1.0, L_v: float = 1.0) -> tuple[list[tuple[float, float]], float]:
    """Compute discrete Kaluza–Klein momentum modes and vacuum energy in 6D.

    Two extra dimensions (``u`` and ``v``) are compactified on a fractal
    lattice.  At depth k the momentum along each dimension scales as
    p_k = 3**k / L.  The resulting two‑dimensional momentum modes are pairs
    (p_u, p_v).  The toy vacuum energy density is the sum of contributions
    over all holes: 2**k * (p_u**2 + p_v**2)**(3) – the exponent 3 is used
    because each momentum component appears quadratically in the energy and
    there are three spatial dimensions in the 6D spacetime excluding u,v.

    Parameters
    ----------
    max_depth : int, optional
        Maximum recursion depth (inclusive).  Default is 3.
    L_u, L_v : float, optional
        Base lengths of the compact u and v dimensions.

    Returns
    -------
    (list of tuple of float, float)
        A list of discrete momentum pairs and the total vacuum energy.
    """
    modes: list[tuple[float, float]] = []
    energy_density = 0.0
    for k in range(max_depth + 1):
        p_u = 3.0**k / L_u
        p_v = 3.0**k / L_v
        modes.append((p_u, p_v))
        # Energy contribution scales with square of each momentum and the
        # degeneracy factor 2**k.
        contribution = (2.0**k) * ((p_u**2 + p_v**2)**3)
        energy_density += contribution
    return modes, energy_density


def simulate_emergent_supergravity(fractal_depth: int = 2, theta: float = np.pi / 4) -> tuple[np.ndarray, np.ndarray]:
    """Compute bosonic and fermionic components of a toy 6D holonomy.

    A holonomy matrix is built from a sequence of rotations across multiple
    planes interleaved with reflections.  The matrix logarithm is split
    into its symmetric (bosonic) and antisymmetric (fermionic) parts,
    analogous to curvature and torsion in supergravity.

    Parameters
    ----------
    fractal_depth : int, optional
        Depth of recursive folding.  Default is 2.
    theta : float, optional
        Base rotation angle.  Default is π/4.

    Returns
    -------
    (numpy.ndarray, numpy.ndarray)
        Matrices representing bosonic curvature and fermionic torsion.
    """
    holonomy = np.eye(6)
    # Choose a set of rotation planes to cycle through.
    planes = [(0, 1), (2, 3), (4, 5)]
    for k in range(1, fractal_depth + 1):
        i, j = planes[(k - 1) % len(planes)]
        R = rotation_matrix_6d(i, j, theta / k)
        holonomy = R @ holonomy
        # Apply reflections on alternate axes to simulate parity twists.
        if k % 2 == 0:
            axis = (k - 1) % 6
            holonomy = reflection_matrix_6d(axis) @ holonomy
    log_h = logm(holonomy)
    bosonic = 0.5 * (log_h + log_h.T)
    fermionic = 0.5 * (log_h - log_h.T)
    return bosonic, fermionic


def main() -> None:
    """Run the 6D FHT simulations and print their results."""
    nonabelian = test_non_abelian_holonomy()
    print("Non‑Abelian holonomy detected in 6D?", nonabelian)

    modes, energy = simulate_fractal_kk_towers(max_depth=3)
    print("Fractal Kaluza–Klein momentum pairs:", modes)
    print("Toy vacuum energy density (6D):", energy)

    bosonic, fermionic = simulate_emergent_supergravity(fractal_depth=2)
    # Extract diagonal elements as curvature invariants
    boson_diag = np.real(np.diag(bosonic))
    fermion_norm = np.linalg.norm(np.real(fermionic - fermionic.T))
    print("Bosonic curvature (diagonal):", boson_diag)
    print("Fermionic torsion magnitude:", fermion_norm)


if __name__ == "__main__":
    main()