"""Entropy estimators for FHT simulations.

This module provides a basic von Neumann entropy estimator. The real
simulator uses partial trace over layers and more sophisticated
estimators.
"""
import numpy as np


def von_neumann_entropy(rho: np.ndarray) -> float:
    """Compute the von Neumann entropy of a density matrix.

    Args:
        rho: Density matrix (Hermitian, trace=1).

    Returns:
        The entropy in nats.
    """
    eigenvalues = np.linalg.eigvalsh(rho)
    # Filter out zeros to avoid log issues
    eigenvalues = eigenvalues[eigenvalues > 1e-12]
    return -np.sum(eigenvalues * np.log(eigenvalues))
