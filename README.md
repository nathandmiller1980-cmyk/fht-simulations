# fht-simulations

This repository contains a toy implementation of Fractal Holonomy Theory (FHT)
simulations and a living compendium of theoretical concepts.

- **Python package:** `fht` provides modules for group operations,
  holonomy transport, fractal topologies, and entropy estimators.
- **Examples:** Demonstrates how to run an entropy growth simulation.
- **Tests:** Simple unit tests to validate entropy computations.
- **Documentation:** See `docs/master_fht_compendium.md` for a high-level
  overview of FHT.

## Getting Started

Install the package in editable mode and run the example script:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
python examples/run_entropy_growth.py
```

This will produce entanglement entropy values for depths 1–6.
