"""Parallel transport on a fractal substrate.
"""Parallel transport on a fractal substrate.


This module defines a simple scale-dependent connection and parallel
transport function used in FHT simulations. The actual implementation
involves recursive structures and golden-ratio weighting, but the
functions here serve as placeholders.
"""
import numpy as np


def connection(depth: int) -> float:
    """Return a toy scale-dependent connection value for a given depth.

    Args:
        depth: Fractal depth.

    Returns:
        A float representing the connection strength.
    """
    return 1.0 / (depth + 1)


def parallel_transport(state: np.ndarray, depth: int) -> np.ndarray:
    """Perform a toy parallel transport on a state vector.

    Args:
        state: A complex vector representing the state.
        depth: Fractal depth.

    Returns:
        The transported state vector.
    """
    conn = connection(depth)
    phase = np.exp(1j * conn)
    return state * phase
