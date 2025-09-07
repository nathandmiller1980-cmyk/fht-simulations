"""Run the toy entropy growth simulation and print the results."""
from fht.sim.runner import run_entropy_growth

if __name__ == '__main__':
    entropies = run_entropy_growth(6)
    for depth, ent in enumerate(entropies, start=1):
        print(f"Depth {depth}: Entropy = {ent:.4f}")
