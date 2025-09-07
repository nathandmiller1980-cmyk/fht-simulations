"""Fractal substrate definitions.

This module defines a simple Cantor-like fractal space used as the base
space for simulations. In full FHT simulations, more sophisticated
multi-dimensional fractals are used.
"""



def cantor_set(depth: int):
    """Generate a Cantor set approximation of given depth.

    Args:
        depth: Number of recursive steps.

    Returns:
        A list of interval endpoints representing the Cantor set at that depth.
    """
    intervals = [(0.0, 1.0)]
    for _ in range(depth):
        new = []
        for a, b in intervals:
            third = (b - a) / 3.0
            new.append((a, a + third))
            new.append((b - third, b))
        intervals = new
    return intervals
