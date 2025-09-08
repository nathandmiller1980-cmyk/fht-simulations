"""
Fractal Holonomy Theory (FHT) – 5D Toy Universe Simulation
==========================================================

This module provides a small collection of Python routines that were used to
explore emergent physics in a five‑dimensional (5D) fractal toy universe.  The
code implements three conceptual experiments described in the accompanying
documentation:

1. **Non‑Abelian Holonomy** – Demonstrates that holonomy operations defined
   on a fractal lattice do not commute.  The example constructs rotation
   matrices acting in two independent planes of a 5D hypercube and shows
   explicitly that the order of multiplication matters.

2. **Fractal Kaluza–Klein Modes** – Models the compactification of an extra
   dimension on a fractal lattice.  It computes discrete momentum spectra and
   evaluates a toy vacuum energy density by summing over self‑similar holes.

3. **Emergent Einstein–Cartan Equations** – Constructs a holonomy matrix
   arising from a simple sequence of fractal folds, computes its matrix
   logarithm using SciPy, and extracts symmetric (Ricci curvature) and
   antisymmetric (torsion) parts.  These quantities are analogues of the
   geometric objects that appear in Einstein–Cartan gravity.

This module depends on `numpy` and `scipy`.

Usage
-----
Run this script directly to execute the three simulations and print
their results to standard output::

    python fht_5d_simulation.py

The functions are also exposed for import into other modules.

Author: OpenAI Assistant for FHT simulations
"""

from __future__ import annotations

import numpy as np
from scipy.linalg import logm


def rotation_matrix_5d(i: int, j: int, theta: float) -> np.ndarray:
    """Return a 5×5 rotation matrix rotating in the (i,j) plane by angle theta.

    Parameters
    ----------
    i, j : int
        Zero‑based indices of the coordinate axes to rotate.
    theta : float
        Rotation angle in radians.

    Returns
    -------
    numpy.ndarray
        An orthogonal 5×5 rotation matrix.
    """
    R = np.eye(5)
    c, s = np.cos(theta), np.sin(theta)
    R[i, i] = c
    R[j, j] = c
    R[i, j] = -s
    R[j, i] = s
    return R


def reflection_matrix_5d(axis: int) -> np.ndarray:
    """Return a 5×5 reflection matrix that flips the sign of the given axis.

    Parameters
    ----------
    axis : int
        Zero‑based index of the coordinate axis to reflect.

    Returns
    -------
    numpy.ndarray
        A diagonal matrix with a single −1 entry on the chosen axis.
    """
    R = np.eye(5)
    R[axis, axis] = -1
    return R


def test_non_abelian_holonomy(theta: float = np.pi / 4) -> bool:
    """Check non‑commutativity of two holonomy operations in 5D.

    Constructs two rotation matrices acting in independent planes and returns
    True if they fail to commute, demonstrating non‑Abelian holonomy.

    Parameters
    ----------
    theta : float, optional
        Rotation angle in radians.  Default is π/4.

    Returns
    -------
    bool
        True if R_xy R_zw != R_zw R_xy.
    """
    # Rotations in two planes that share a common axis.  Non‑commutativity
    # requires the planes to overlap (e.g. (x,y) and (y,z)).  Here indices
    # 0,1,2 label x,y,z respectively.
    R_xy = rotation_matrix_5d(0, 1, theta)
    R_yz = rotation_matrix_5d(1, 2, theta)
    prod1 = R_xy @ R_yz
    prod2 = R_yz @ R_xy
    # Use a tolerance on the difference to account for floating point noise.
    return not np.allclose(prod1, prod2, atol=1e-12)


def simulate_fractal_kaluza_klein(max_depth: int = 3, L: float = 1.0) -> tuple[list[float], float]:
    """Compute discrete momentum modes and vacuum energy in a fractal KK model.

    Momentum modes are given by p_k = 3**k / L for depth k.  The toy
    vacuum energy density is approximated by summing contributions from all
    self‑similar voids: sum_k 2**k * (3**k / L)**5.

    Parameters
    ----------
    max_depth : int, optional
        Maximum recursion depth to include (inclusive).  Default is 3.
    L : float, optional
        Base length of the compact dimension.  Default is 1.0.

    Returns
    -------
    (list of float, float)
        A list of discrete momentum modes and the total vacuum energy.
    """
    momentum_modes: list[float] = []
    energy_density = 0.0
    for k in range(max_depth + 1):
        p = 3.0**k / L
        momentum_modes.append(p)
        contribution = (2.0**k) * (p**5)
        energy_density += contribution
    return momentum_modes, energy_density


def simulate_einstein_cartan(fractal_depth: int = 2, theta: float = np.pi / 4) -> tuple[np.ndarray, np.ndarray]:
    """Compute Ricci curvature and torsion tensors from a toy holonomy.

    A holonomy matrix is constructed as the ordered product of rotations and
    reflections following a simple fractal folding rule: alternating
    rotations in two planes and reflections on even depths.  The matrix
    logarithm is computed using SciPy's ``logm``.  The symmetric part of the
    logarithm corresponds to an analogue of the Ricci tensor, while the
    antisymmetric part encodes torsion.

    Parameters
    ----------
    fractal_depth : int, optional
        Number of folding layers to simulate.  Default is 2.
    theta : float, optional
        Rotation angle used at each fold.  Default is π/4.

    Returns
    -------
    (numpy.ndarray, numpy.ndarray)
        Arrays representing toy Ricci curvature and torsion tensors.
    """
    holonomy = np.eye(5)
    for k in range(1, fractal_depth + 1):
        # Alternate between two rotation planes at each depth.
        if k % 2 == 1:
            R = rotation_matrix_5d(0, 1, theta / k)
        else:
            R = rotation_matrix_5d(2, 3, theta / k)
        holonomy = R @ holonomy
        # At even depths apply a reflection on the last axis to mimic non‑orientable twists.
        if k % 2 == 0:
            holonomy = reflection_matrix_5d(4) @ holonomy
    # Compute the matrix logarithm to extract connection components.
    log_h = logm(holonomy)
    # Symmetric (Ricci) and antisymmetric (torsion) parts of the connection.
    ricci = 0.5 * (log_h + log_h.T)
    torsion = 0.5 * (log_h - log_h.T)
    return ricci, torsion


def main() -> None:
    """Run the 5D FHT simulations and print their outcomes."""
    # Test non‑Abelian holonomy.
    nonabelian = test_non_abelian_holonomy()
    print("Non‑Abelian holonomy detected?", nonabelian)

    # Compute fractal KK spectrum.
    modes, energy = simulate_fractal_kaluza_klein(max_depth=3)
    print("Fractal Kaluza–Klein momentum modes:", modes)
    print("Toy vacuum energy density:", energy)

    # Compute emergent Einstein–Cartan tensors.
    ricci, torsion = simulate_einstein_cartan(fractal_depth=2)
    # Summarise by reporting diagonal Ricci components and the magnitude of torsion.
    ricci_diagonal = np.real(np.diag(ricci))
    # Torsion magnitude as Frobenius norm of antisymmetric part.
    torsion_norm = np.linalg.norm(np.real(torsion - torsion.T))
    print("Ricci curvature (diagonal elements):", ricci_diagonal)
    print("Torsion magnitude:", torsion_norm)


if __name__ == "__main__":
    main()