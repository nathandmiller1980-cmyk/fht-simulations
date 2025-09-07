"""Group operations for SU(2) and U(1) with golden ratio weighting.

This module provides basic rotation and phase operations on vectors and
states. It serves as a placeholder for a more sophisticated implementation
used in the Fractal Holonomy Theory (FHT) simulations.
"""
import numpy as np

PHI = (1 + 5 ** 0.5) / 2  # golden ratio


def su2_rotation(theta: float, axis: np.ndarray) -> np.ndarray:
    """Return an SU(2) rotation matrix for a rotation of angle theta about an axis.

    Args:
        theta: Rotation angle in radians.
        axis: 3D unit vector indicating the rotation axis.

    Returns:
        A 2x2 complex rotation matrix.
    """
    axis = axis / np.linalg.norm(axis)
    a = np.cos(theta / 2.0)
    b, c, d = -1j * axis * np.sin(theta / 2.0)
    return np.array([[a + b, c + 1j * d], [-c + 1j * d, a - b]])


def u1_phase(phi: float) -> complex:
    """Return a U(1) phase factor for a given angle.

    Args:
        phi: Phase angle in radians.

    Returns:
        A complex number on the unit circle.
    """
    return np.exp(1j * phi)
