"""Basic tests for entropy estimators."""
import numpy as np
from fht.entropy.estimators import von_neumann_entropy


def test_entropy_pure_state():
    state = np.array([1.0 + 0j, 0.0 + 0j])
    rho = np.outer(state, np.conjugate(state))
    entropy = von_neumann_entropy(rho)
    assert abs(entropy) < 1e-6


def test_entropy_mixed_state():
    rho = 0.5 * np.eye(2)
    entropy = von_neumann_entropy(rho)
    assert abs(entropy - np.log(2)) < 1e-6
