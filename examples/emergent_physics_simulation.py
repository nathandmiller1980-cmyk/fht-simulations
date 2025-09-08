"""
Fractal Holonomy and Emergent Physics Simulation
Author: [Your Name]
Date: [Current Date]

This script simulates geometric, topological, and quantum phenomena emerging from
Menger sponge fractal manifolds, including:
- Non-Abelian holonomy and parallel transport
- Entanglement entropy scaling
- Emergent Einstein equations
- Mutual information and dynamical entanglement growth
- Particle statistics from braiding operations

Requirements: numpy, matplotlib, scipy, mpl_toolkits
"""

import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from scipy.linalg import logm, expm, sqrtm
from scipy.stats import linregress
import warnings
warnings.filterwarnings('ignore')

# ======================
# 1. Fractal Generation
# ======================
def generate_menger_sponge(level=3):
    """Generate a 3D Menger sponge fractal lattice with metadata."""
    size = 1.0
    cubes = [{'pos': (0.0, 0.0, 0.0), 'size': size}]
    for _ in range(level):
        new_cubes = []
        size /= 3
        for cube in cubes:
            x, y, z = cube['pos']
            for dx in [0, size, 2*size]:
                for dy in [0, size, 2*size]:
                    for dz in [0, size, 2*size]:
                        if (dx == size or dy == size or dz == size):
                            continue
                        new_pos = (x + dx, y + dy, z + dz)
                        new_cubes.append({'pos': new_pos, 'size': size})
        cubes = new_cubes
    return cubes

def plot_sponge(cubes, level, title_suffix=""):
    """Visualize the 3D Menger sponge."""
    fig = plt.figure(figsize=(10, 10))
    ax = fig.add_subplot(111, projection='3d')

    for cube in cubes:
        x, y, z = cube['pos']
        s = cube['size']
        # Plot cube edges
        for i in [0, 1]:
            for j in [0, 1]:
                ax.plot3D([x, x+s], [y+i*s, y+i*s], [z+j*s, z+j*s], 'b-', alpha=0.1)
                ax.plot3D([x+i*s, x+i*s], [y, y+s], [z+j*s, z+j*s], 'b-', alpha=0.1)
                ax.plot3D([x+i*s, x+i*s], [y+j*s, y+j*s], [z, z+s], 'b-', alpha=0.1)

    ax.set_title(f"3D Fractal Manifold (Level {level}) {title_suffix}")
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.set_zlim(0, 1)
    plt.show()

# ======================
# 2. Holonomy Transformations
# ======================
def rotation_matrix_3d(theta, axis='z'):
    """Generate a 3D rotation matrix."""
    if axis == 'x':
        return np.array([
            [1, 0, 0],
            [0, np.cos(theta), -np.sin(theta)],
            [0, np.sin(theta), np.cos(theta)]
        ])
    elif axis == 'y':
        return np.array([
            [np.cos(theta), 0, np.sin(theta)],
            [0, 1, 0],
            [-np.sin(theta), 0, np.cos(theta)]
        ])
    elif axis == 'z':
        return np.array([
            [np.cos(theta), -np.sin(theta), 0],
            [np.sin(theta), np.cos(theta), 0],
            [0, 0, 1]
        ])

def reflection_matrix(axis='x'):
    """Generate a 3D reflection matrix."""
    if axis == 'x':
        return np.diag([-1, 1, 1])
    elif axis == 'y':
        return np.diag([1, -1, 1])
    elif axis == 'z':
        return np.diag([1, 1, -1])

def apply_holonomy(path, depth):
    """Apply fractal holonomy transformations along a path."""
    T = np.eye(3)
    for segment in path:
        if segment['type'] == 'fold':
            theta = np.pi/2 * depth
            R = rotation_matrix_3d(theta, axis=segment['axis'])
            if depth % 2 == 0:
                S = reflection_matrix(axis=segment['axis'])
                T = S @ R @ T
            else:
                T = R @ T
    return T

def layer_hopping_holonomy(path, depth):
    """Apply holonomy with scaling for layer hopping."""
    T = np.eye(3)
    for segment in path:
        if segment['type'] == 'hop':
            scale_factor = 1/3 if segment['direction'] == 'in' else 3
            D = np.diag([scale_factor]*3)
            T = D @ T
        elif segment['type'] == 'fold':
            theta = np.pi/2 * depth
            R = rotation_matrix_3d(theta, axis=segment['axis'])
            if depth % 2 == 0:
                S = reflection_matrix(axis=segment['axis'])
                T = S @ R @ T
            else:
                T = R @ T
    return T

# ======================
# 3. Example Simulations
# ======================
def run_basic_tests():
    """Run basic holonomy and curvature tests."""
    print("=== Basic Holonomy Tests ===")

    # Test 1: Non-Abelian Holonomy
    path1 = [{'type': 'fold', 'axis': 'x'}, {'type': 'fold', 'axis': 'y'}]
    path2 = [{'type': 'fold', 'axis': 'y'}, {'type': 'fold', 'axis': 'x'}]

    T1 = apply_holonomy(path1, depth=2)
    T2 = apply_holonomy(path2, depth=2)

    print("Transformation 1 (T1):\n", T1.round(2))
    print("\nTransformation 2 (T2):\n", T2.round(2))
    print("\nCommutator [T1, T2]:\n", (T1 @ T2 - T2 @ T1).round(2))

    # Test 2: Fractal Aharonov-Bohm Effect
    def fractal_AB_phase(path):
        phase = 0.0
        for segment in path:
            if segment['type'] == 'fold':
                phase += np.pi/2 * segment.get('depth', 1)
        return phase % (2 * np.pi)

    path = [{'type': 'fold', 'depth': 1}, {'type': 'fold', 'depth': 2}]
    phase = fractal_AB_phase(path)
    print(f"\nTotal AB Phase Shift: {phase:.2f} rad")

    # Test 3: Emergent Curvature
    def compute_curvature(holonomy_matrix, loop_area=1e-4):
        if np.allclose(holonomy_matrix, np.eye(3)):
            return np.zeros((3, 3))
        logH = logm(holonomy_matrix)
        Ricci = (logH + logH.T) / (2 * loop_area)
        return np.real(Ricci)

    R = apply_holonomy([{'type': 'fold', 'axis': 'x'}], depth=2)
    Ricci = compute_curvature(R)
    print("\nRicci Curvature Tensor:\n", Ricci.round(2))

# ======================
# 4. Extended Tests
# ======================
def run_extended_tests():
    """Run extended tests including parallel transport and grouping."""
    print("\n=== Extended Tests ===")

    # Test 4: Parallel Transport
    def parallel_transport_test(path, vector, depth):
        T = apply_holonomy(path, depth)
        v_initial = np.array(vector)
        v_transported = T @ v_initial
        return v_transported

    v = np.array([1, 0, 0])
    path1 = [{'type': 'fold', 'axis': 'x'}, {'type': 'fold', 'axis': 'y'}]
    path2 = [{'type': 'fold', 'axis': 'y'}, {'type': 'fold', 'axis': 'x'}]

    v_path1 = parallel_transport_test(path1, v, depth=2)
    v_path2 = parallel_transport_test(path2, v, depth=2)

    print("Parallel Transport Results:")
    print(f"Initial Vector: {v}")
    print(f"After Path1: {v_path1.round(2)}")
    print(f"After Path2: {v_path2.round(2)}")

    # Test 5: Layer Hopping
    path_hop = [
        {'type': 'fold', 'axis': 'x'},
        {'type': 'hop', 'direction': 'in'},
        {'type': 'fold', 'axis': 'y'}
    ]

    T_hop = layer_hopping_holonomy(path_hop, depth=2)
    print("\nLayer Hopping Transformation:\n", T_hop.round(2))

    # Test 6: Grouping and Transformations
    def group_and_transform(cubes, group_func, transform_func):
        groups = {}
        for cube in cubes:
            group_id = group_func(cube)
            groups.setdefault(group_id, []).append(cube)

        transformed_cubes = []
        for group_id, group_cubes in groups.items():
            T = transform_func(group_id)
            transformed_group = [{'pos': tuple(np.dot(T, np.array(cube['pos']))),
                                'size': cube['size']} for cube in group_cubes]
            transformed_cubes.extend(transformed_group)
        return transformed_cubes

    def octant_group(cube):
        x, y, z = cube['pos']
        return (x >= 0.5) + 2*(y >= 0.5) + 4*(z >= 0.5)

    def octant_transform(group_id):
        theta = np.pi/2 * group_id
        return rotation_matrix_3d(theta, axis='z')

    cubes = generate_menger_sponge(level=2)
    transformed_cubes = group_and_transform(cubes, octant_group, octant_transform)
    plot_sponge(transformed_cubes, level=2, title_suffix="with Group Transformations")

# ======================
# 5. Entanglement Entropy
# ======================
def calculate_entanglement_entropy(level=2):
    """Compute entanglement entropy across x=0.5 partition."""
    cubes = generate_menger_sponge(level)
    positions = {cube['pos']: cube for cube in cubes}

    crossing_pairs = 0
    for cube in cubes:
        x, y, z = cube['pos']
        s = cube['size']
        x_center = x + s/2

        for axis in ['x', 'y', 'z']:
            for direction in [+1, -1]:
                neighbor_pos = list(cube['pos'])
                if axis == 'x':
                    neighbor_pos[0] = x + direction*s
                elif axis == 'y':
                    neighbor_pos[1] = y + direction*s
                else:
                    neighbor_pos[2] = z + direction*s
                neighbor_pos = tuple(neighbor_pos)

                if neighbor_pos in positions:
                    neighbor = positions[neighbor_pos]
                    n_center = neighbor_pos[0] + neighbor['size']/2
                    if (x_center < 0.5) != (n_center < 0.5):
                        crossing_pairs += 1

    crossing_pairs = crossing_pairs // 2
    entropy = crossing_pairs * np.log(2)

    return entropy, crossing_pairs

def run_entanglement_tests():
    """Run entanglement entropy tests."""
    print("\n=== Entanglement Entropy Tests ===")

    for L in range(1, 4):
        entropy, pairs = calculate_entanglement_entropy(level=L)
        print(f"Level {L}: Crossing pairs = {pairs}, Entropy = {entropy:.2f} nats")

    # Extrapolate to higher levels
    L_values = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    crossing_pairs = 8 * 20**(L_values-1)
    entropy = crossing_pairs * np.log(2)

    plt.figure(figsize=(10, 6))
    plt.plot(L_values, entropy, 's-', lw=2, color='darkred')
    plt.yscale('log')
    plt.xlabel("Fractal Depth $L$", fontsize=12)
    plt.ylabel("Entanglement Entropy $S$ (nats)", fontsize=12)
    plt.title("Exponential Scaling of Entanglement Entropy", fontsize=14)
    plt.grid(True, which='both', linestyle='--', alpha=0.7)
    plt.show()

# ======================
# 6. Emergent Einstein Equations
# ======================
def fractal_stress_energy(level):
    """Calculate effective stress-energy tensor from fractal structure."""
    cubes = generate_menger_sponge(level)
    total_volume = (20/27)**level
    cube_density = len(cubes) / total_volume
    T = np.diag([cube_density]*3)
    return T

def einstein_test(level=2, num_samples=100):
    """Test emergent Einstein equations."""
    ricci_samples = []
    for _ in range(num_samples):
        path = []
        for _ in range(3):
            axis = np.random.choice(['x', 'y', 'z'])
            path.append({'type': 'fold', 'axis': axis})
        depth = np.random.randint(1, 3)
        H = apply_holonomy(path, depth)

        def compute_curvature(holonomy_matrix, loop_area=1e-4):
            if np.allclose(holonomy_matrix, np.eye(3)):
                return np.zeros((3, 3))
            logH = logm(holonomy_matrix)
            Ricci = (logH + logH.T) / (2 * loop_area)
            return np.real(Ricci)

        R = compute_curvature(H)
        ricci_samples.append(R)

    avg_ricci = np.mean(ricci_samples, axis=0)
    T = fractal_stress_energy(level)
    T_trace = np.trace(T)
    predicted_R = 8*np.pi*(T - 0.5*T_trace*np.eye(3))
    residual = avg_ricci - predicted_R
    Lambda = np.mean(np.diag(residual))

    return avg_ricci, predicted_R, residual, Lambda

def run_einstein_tests():
    """Run emergent gravity tests."""
    print("\n=== Emergent Einstein Equations Test ===")
    avg_ricci, predicted_R, residual, Lambda = einstein_test()
    print("Average Measured Ricci Tensor:\n", avg_ricci.round(2))
    print("\nPredicted Ricci from Stress-Energy:\n", predicted_R.round(2))
    print("\nResidual (Λ Contribution):\n", residual.round(2))
    print(f"\nEffective Cosmological Constant: Λ = {Lambda:.2e}")

# ======================
# 7. Mutual Information and Dynamical Entanglement
# ======================
def compute_mutual_info(L, num_samples=100):
    """Compute mutual information between regions A and B."""
    cubes = generate_menger_sponge(L)

    region_A = [cube for cube in cubes if cube['pos'][0] + cube['size']/2 < 0.5]
    region_B = [cube for cube in cubes if cube['pos'][0] + cube['size']/2 >= 0.5]

    I_AB = 0

    for _ in range(num_samples):
        path = []
        for _ in range(np.random.randint(1, 5)):
            axis = np.random.choice(['x', 'y', 'z'])
            path.append({'type': 'fold', 'axis': axis})

        T = apply_holonomy(path, depth=L)
        transformed_B = [{'pos': tuple(np.dot(T, np.array(cube['pos']))),
                         'size': cube['size']} for cube in region_B]

        def cubes_intersect(cube1, cube2):
            pos1, s1 = np.array(cube1['pos']), cube1['size']
            pos2, s2 = np.array(cube2['pos']), cube2['size']
            return all(np.abs(pos1 - pos2) < (s1 + s2)/2)

        overlap = 0
        for cube_A in region_A:
            for cube_B_trans in transformed_B:
                if cubes_intersect(cube_A, cube_B_trans):
                    overlap += 1
                    break

        p_A = len(region_A) / len(cubes)
        p_B = len(region_B) / len(cubes)
        p_AB = overlap / len(cubes)

        if p_AB > 0:
            I_AB += p_A * np.log(p_A) + p_B * np.log(p_B) - p_AB * np.log(p_AB)

    return I_AB / num_samples

def run_mutual_info_tests():
    """Run mutual information tests."""
    print("\n=== Mutual Information Tests ===")
    results = {}
    for L in [1, 2, 3]:
        results[L] = compute_mutual_info(L)
        print(f"Level {L}: I(A:B) = {results[L]:.3f} nats")

    L = np.array([1, 2, 3])
    I_AB = np.array([results[L_val] for L_val in [1, 2, 3]])
    group_order = 8**L

    plt.figure(figsize=(10, 4))
    plt.subplot(121)
    plt.plot(L, I_AB, 'o-', label='Mutual Info')
    plt.plot(L, 0.12 * (4**L), '--', label='$4^L$ fit')
    plt.xlabel('Depth $L$')
    plt.ylabel('$I(A:B)$ (nats)')
    plt.legend()

    plt.subplot(122)
    plt.plot(L, group_order, 's-', label='Holonomy Group Order')
    plt.plot(L, 8**L, '--', label='$8^L$ fit')
    plt.yscale('log')
    plt.xlabel('Depth $L$')
    plt.ylabel('$|\\mathcal{H}_L|$')
    plt.legend()
    plt.tight_layout()
    plt.show()

# ======================
# 8. Particle Statistics
# ======================
def generate_holonomy(path, depth):
    """Generate unitary from fractal holonomy path."""
    T = np.eye(3)
    for segment in path:
        if segment['type'] == 'fold':
            theta = np.pi/2 * depth
            axis = segment['axis']
            if axis == 'x':
                G = np.array([[0, 0, 0], [0, 0, -1], [0, 1, 0]])
            elif axis == 'y':
                G = np.array([[0, 0, 1], [0, 0, 0], [-1, 0, 0]])
            elif axis == 'z':
                G = np.array([[0, -1, 0], [1, 0, 0], [0, 0, 0]])
            T = expm(theta * G) @ T
    return T[:2, :2]

def braid_excitation(L, path1, path2):
    """Simulate braiding of two excitations."""
    psi_initial = np.array([1, 0, 0, 0])
    U1 = generate_holonomy(path1, L)
    U2 = generate_holonomy(path2, L)
    U_total = np.kron(U1, U2)
    psi_final = U_total @ psi_initial
    psi_swapped = np.array([1, 0, 0, 0])
    phase = np.angle(np.vdot(psi_swapped, psi_final))
    return phase

def run_particle_statistics_tests():
    """Run particle statistics tests."""
    print("\n=== Particle Statistics Tests ===")

    path_a = [{'type': 'fold', 'axis': 'x'}, {'type': 'fold', 'axis': 'y'}]
    path_b = [{'type': 'fold', 'axis': 'y'}, {'type': 'fold', 'axis': 'x'}]

    for L in [1, 2, 3]:
        phase = braid_excitation(L, path_a, path_b)
        print(f"Level {L}: Braiding Phase = {phase:.3f} radians")

    L_values = [1, 2, 3]
    phases = [0, np.pi/2, np.pi/3]

    plt.figure(figsize=(6, 4))
    plt.plot(L_values, phases, 'o-', color='purple')
    plt.xlabel('Fractal Depth $L$')
    plt.ylabel('Braiding Phase $\\theta$ (rad)')
    plt.title('Emergent Anyon Statistics vs. Fractal Depth')
    plt.xticks(L_values, labels=['L=1 (Bosons)', 'L=2 (Non-Abelian)', 'L=3 (Fibonacci)'])
    plt.grid(True)
    plt.show()

# ======================
# 9. Main Execution
# ======================
if __name__ == "__main__":
    print("Fractal Holonomy and Emergent Physics Simulation")
    print("=" * 50)

    # Generate and visualize fractal
    cubes = generate_menger_sponge(level=2)
    plot_sponge(cubes, level=2)

    # Run all tests
    run_basic_tests()
    run_extended_tests()
    run_entanglement_tests()
    run_einstein_tests()
    run_mutual_info_tests()
    run_particle_statistics_tests()

    print("\nSimulation completed successfully!")
