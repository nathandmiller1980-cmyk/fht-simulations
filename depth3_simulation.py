"""
depth3_simulation
=================

Run a depth‑3 parallel transport simulation on a fractal Kähler manifold with
complex structure and save the results.  This script relies on the
``ComplexKahlerManifold`` class defined in :mod:`complex_kahler_manifold`.

When executed, it performs parallel transport of a complex tangent vector
around three distinct loops in sequence.  After each loop, the holonomy
phase, angle and corresponding unitary matrix are recorded.  Finally, the
total holonomy is computed by composing the individual transformations.  The
results are written to a human‑readable log file and printed to stdout.

To run the simulation simply execute this module as a script::

    python depth3_simulation.py

The output log file will be placed in the same directory with the name
``depth3_results.md``.
"""

import numpy as np
from complex_kahler_manifold import ComplexKahlerManifold

def run_depth3_simulation() -> dict:
    """Execute three consecutive holonomy computations and return results.

    Returns
    -------
    dict
        A dictionary summarising the phase factors, rotation angles and
        holonomy matrices for each loop and the total composed holonomy.
    """
    # construct a more detailed manifold for this simulation
    ckm = ComplexKahlerManifold(size=300, fractal_level=5, curvature_scale=0.3)
    # define three parameterized loops as nested functions
    def loop1(t: float) -> complex:
        """Circle in the upper right quadrant."""
        return 0.5 + 0.5j + 0.4 * np.exp(2j * np.pi * t)

    def loop2(t: float) -> complex:
        """Lemniscate of Bernoulli centred near the origin."""
        theta = 2 * np.pi * t
        return 0.1 * (np.cos(theta) + 1j * np.sin(2 * theta)) / (1 + np.sin(theta) ** 2)

    def loop3(t: float) -> complex:
        """Large circle in the lower left quadrant."""
        return -0.7 - 0.6j + 0.5 * np.exp(2j * np.pi * t)

    # initial complex tangent vector
    init_vec = (1.0 + 0j, 1.0 - 0j)

    results = {}
    # loop 1
    phase1, M1, (v_z1, v_zc1), pts1 = ckm.compute_holonomy_complex(loop1, init_vec, steps=300)
    angle1 = np.degrees(np.angle(phase1))
    results['loop1'] = {
        'phase': phase1,
        'angle_degrees': angle1,
        'matrix': M1,
    }
    # loop 2 starting from end of loop 1 transport
    current_vec = (v_z1[-1], v_zc1[-1])
    phase2, M2, (v_z2, v_zc2), pts2 = ckm.compute_holonomy_complex(loop2, current_vec, steps=300)
    angle2 = np.degrees(np.angle(phase2))
    results['loop2'] = {
        'phase': phase2,
        'angle_degrees': angle2,
        'matrix': M2,
    }
    # loop 3 starting from end of loop 2 transport
    current_vec = (v_z2[-1], v_zc2[-1])
    phase3, M3, (v_z3, v_zc3), pts3 = ckm.compute_holonomy_complex(loop3, current_vec, steps=300)
    angle3 = np.degrees(np.angle(phase3))
    results['loop3'] = {
        'phase': phase3,
        'angle_degrees': angle3,
        'matrix': M3,
    }
    # total holonomy: multiply phase factors and compose matrices
    total_phase = phase1 * phase2 * phase3
    total_angle_degrees = np.degrees(np.angle(total_phase))
    total_matrix = M3 @ M2 @ M1
    results['total'] = {
        'phase': total_phase,
        'angle_degrees': total_angle_degrees,
        'matrix': total_matrix,
    }
    return results

def write_results(results: dict, filename: str = 'depth3_results.md') -> None:
    """Write a human‑readable summary of the simulation to a Markdown file."""
    lines: list[str] = []
    lines.append("# Depth‑3 Fractal Holonomy Simulation Results\n")
    for key in ['loop1', 'loop2', 'loop3']:
        res = results[key]
        lines.append(f"## {key.capitalize()}\n")
        lines.append(f"Phase factor: {res['phase']:.4f}\n")
        lines.append(f"Rotation angle: {res['angle_degrees']:.4f}°\n")
        lines.append("Holonomy matrix:\n")
        mat = res['matrix']
        lines.append('\\n'.join(['  ' + '  '.join(f"{val.real:+.4f}{val.imag:+.4f}j" for val in row) for row in mat]))
        lines.append("\n")
    # total
    total = results['total']
    lines.append("## Total Holonomy\n")
    lines.append(f"Phase factor: {total['phase']:.4f}\n")
    lines.append(f"Rotation angle: {total['angle_degrees']:.4f}°\n")
    lines.append("Holonomy matrix:\n")
    mat = total['matrix']
    lines.append('\\n'.join(['  ' + '  '.join(f"{val.real:+.4f}{val.imag:+.4f}j" for val in row) for row in mat]))
    lines.append("\n")
    with open(filename, 'w') as f:
        f.write('\n'.join(lines))

if __name__ == '__main__':
    res = run_depth3_simulation()
    write_results(res)
    # print summary to stdout
    print("=== Depth‑3 Fractal Holonomy Simulation ===")
    for key in ['loop1', 'loop2', 'loop3']:
        r = res[key]
        print(f"{key}: phase={r['phase']:.4f}, angle={r['angle_degrees']:.2f}°")
    total = res['total']
    print(f"Total: phase={total['phase']:.4f}, angle={total['angle_degrees']:.2f}°")