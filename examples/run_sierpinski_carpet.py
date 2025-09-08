import numpy as np
import matplotlib.pyplot as plt
import random
import math

# --- Parameters ---
grid_size = 3**5  # 243x243 Sierpinski carpet at depth 5
recursion_depth = 5
steps = 1000  # Number of time steps for entanglement growth
num_particles = 200  # Simulated quantum walkers

# --- Fractal Lattice (Sierpinski Carpet) ---
def make_sierpinski_carpet(depth):
    def is_hole(x, y, level):
        while level > 0:
            if (x // 3) % 3 == 1 and (y // 3) % 3 == 1:
                return True
            x //= 3
            y //= 3
            level -= 1
        return False

    lattice = np.ones((3**depth, 3**depth), dtype=bool)
    for x in range(3**depth):
        for y in range(3**depth):
            if is_hole(x, y, depth):
                lattice[x, y] = False
    return lattice

lattice = make_sierpinski_carpet(recursion_depth)

# --- Entanglement Tracking ---
entanglement = np.zeros(steps)

# --- Particle State ---
class Walker:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.path = [(x, y)]

    def move(self, lattice):
        moves = [(1,0), (-1,0), (0,1), (0,-1)]
        random.shuffle(moves)
        for dx, dy in moves:
            nx, ny = self.x + dx, self.y + dy
            if 0 <= nx < lattice.shape[0] and 0 <= ny < lattice.shape[1]:
                if lattice[nx, ny]:
                    self.x, self.y = nx, ny
                    self.path.append((nx, ny))
                    return

# --- Run Simulation ---
walkers = [Walker(grid_size // 2, grid_size // 2) for _ in range(num_particles)]

for t in range(steps):
    for w in walkers:
        w.move(lattice)

    # Grouping by holonomic path locality
    group_dict = {}
    for w in walkers:
        last = w.path[-1]
        group_dict.setdefault(last, []).append(w)

    S = 0
    for group in group_dict.values():
        lengths = [len(w.path) for w in group]
        avg_len = np.mean(lengths)
        S += math.log1p(avg_len) * (1 + math.log(len(group)+1))  # log-based entropy growth

    entanglement[t] = S

# --- Visualization ---
plt.figure(figsize=(10, 6))
plt.plot(entanglement, label="Holonomic Entanglement Entropy S(t)")
plt.title("Dynamical Entanglement Growth in Fractal Holonomy")
plt.xlabel("Time Step")
plt.ylabel("Entanglement Entropy S(t)")
plt.grid(True)
plt.legend()
plt.tight_layout()
plt.show()
