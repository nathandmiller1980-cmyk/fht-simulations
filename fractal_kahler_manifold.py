"""
fractal_kahler_manifold
=======================

This module implements a basic two‑dimensional Kähler manifold using a
real‑valued potential function to generate a metric with fractal
fluctuations.  The manifold is discretized on a regular grid in the
plane.  The goal of this implementation is to provide a simplified
setting for exploring holonomy on a fractal geometry using real
coordinates.

Note that this class is largely for reference and completeness.  It
produces a scalar metric which is used for parallel transport in the
real coordinate basis (x,y).  The geometry is less rich than the
complex Hermitian case, but it can still exhibit nontrivial holonomy.
"""

import numpy as np
import matplotlib.pyplot as plt


class FractalKahlerManifold:
    """A 2D manifold with a metric derived from a fractal Kähler potential.

    Parameters
    ----------
    size : int
        The number of grid points along each axis.
    fractal_level : int
        Number of refinement levels in the potential.
    scale : float
        Amplitude of the fractal oscillations in the potential.
    """

    def __init__(self, size: int = 100, fractal_level: int = 3, scale: float = 0.1) -> None:
        self.size = size
        self.fractal_level = fractal_level
        self.scale = scale
        # coordinate grid
        self.x = np.linspace(-2, 2, size)
        self.y = np.linspace(-2, 2, size)
        self.xx, self.yy = np.meshgrid(self.x, self.y)
        # build a fractal potential and derive the metric
        self.K = self._generate_fractal_potential(fractal_level, scale)
        self.g = self._compute_metric_from_potential()
        # compute Christoffel symbols for real coordinates (approximate)
        self.Gamma = self._compute_christoffel()

    def _generate_fractal_potential(self, level: int, scale: float) -> np.ndarray:
        """Generate a fractal Kähler potential via superposition of waves."""
        rng = np.random.RandomState(0)
        K = np.zeros_like(self.xx)
        for l in range(level):
            freq = 2 ** l
            weight = 1.0 / (freq ** 1.2)
            phase = rng.uniform(0, 2 * np.pi)
            K += scale * weight * (
                np.sin(freq * self.xx + phase) + np.cos(freq * self.yy + phase)
            )
        return K

    def _compute_metric_from_potential(self) -> np.ndarray:
        """Derive the scalar metric g = (1/4)(∂²K/∂x² + ∂²K/∂y²)."""
        dx = self.x[1] - self.x[0]
        dy = self.y[1] - self.y[0]
        d2K_dx2 = np.gradient(np.gradient(self.K, dx, axis=1), dx, axis=1)
        d2K_dy2 = np.gradient(np.gradient(self.K, dy, axis=0), dy, axis=0)
        return 0.25 * (d2K_dx2 + d2K_dy2)

    def _compute_christoffel(self) -> dict:
        """Compute simplified Christoffel symbols for a diagonal metric."""
        # derivative of metric
        dx = self.x[1] - self.x[0]
        dy = self.y[1] - self.y[0]
        dg_dx = np.gradient(self.g, dx, axis=1)
        dg_dy = np.gradient(self.g, dy, axis=0)
        # Since metric is diagonal (g_xx = g_yy = g), off-diagonal Christoffel vanish
        # nonzero components: Γ^x_{xx} = (1/2 g) ∂g/∂x, Γ^y_{yy} = (1/2 g) ∂g/∂y
        Gamma_x_xx = 0.5 * dg_dx / self.g
        Gamma_y_yy = 0.5 * dg_dy / self.g
        return {"Gamma_x_xx": Gamma_x_xx, "Gamma_y_yy": Gamma_y_yy}

    def get_christoffel(self, x: float, y: float) -> dict:
        """Return Christoffel symbols at the nearest grid point."""
        ix = np.argmin(np.abs(self.x - x))
        iy = np.argmin(np.abs(self.y - y))
        return {
            "Gamma_x_xx": self.Gamma["Gamma_x_xx"][iy, ix],
            "Gamma_y_yy": self.Gamma["Gamma_y_yy"][iy, ix],
        }

    def parallel_transport(self, curve, initial_vector: tuple[float, float], steps: int = 100):
        """Parallel transport a vector along a real parametric curve."""
        t_span = np.linspace(0, 1, steps)
        points = np.array([curve(t) for t in t_span], dtype=float)
        vx = np.zeros(steps)
        vy = np.zeros(steps)
        vx[0], vy[0] = initial_vector
        for i in range(steps - 1):
            dt = t_span[i + 1] - t_span[i]
            x, y = points[i]
            # approximate derivatives of path
            if i == 0:
                dxdt = (points[i + 1, 0] - x) / dt
                dydt = (points[i + 1, 1] - y) / dt
            else:
                dxdt = (points[i + 1, 0] - points[i - 1, 0]) / (2 * dt)
                dydt = (points[i + 1, 1] - points[i - 1, 1]) / (2 * dt)
            # get Christoffel symbols
            Gamma = self.get_christoffel(x, y)
            gamma_x = Gamma["Gamma_x_xx"]
            gamma_y = Gamma["Gamma_y_yy"]
            # derivatives of vector components
            dvxdt = -gamma_x * vx[i] * dxdt
            dvydt = -gamma_y * vy[i] * dydt
            vx[i + 1] = vx[i] + dvxdt * dt
            vy[i + 1] = vy[i] + dvydt * dt
        return (vx, vy), points

    def compute_holonomy(self, loop, initial_vector: tuple[float, float], steps: int = 100):
        """Compute holonomy angle after parallel transport around a loop."""
        (vx, vy), points = self.parallel_transport(loop, initial_vector, steps)
        v_initial = np.array(initial_vector)
        v_final = np.array([vx[-1], vy[-1]])
        dot = np.dot(v_initial, v_final)
        norm0 = np.linalg.norm(v_initial)
        norm1 = np.linalg.norm(v_final)
        cos_theta = dot / (norm0 * norm1)
        cos_theta = np.clip(cos_theta, -1.0, 1.0)
        angle = np.arccos(cos_theta)
        # sign using cross product in 2D
        cross = v_initial[0] * v_final[1] - v_initial[1] * v_final[0]
        if cross < 0:
            angle = -angle
        # build a rotation matrix representing the holonomy
        rot = np.array([[np.cos(angle), -np.sin(angle)], [np.sin(angle), np.cos(angle)]])
        return angle, rot, (vx, vy), points

    def visualize_metric(self) -> None:
        """Plot the potential and metric to inspect the geometry."""
        plt.figure(figsize=(10, 4))
        plt.subplot(1, 2, 1)
        plt.contourf(self.xx, self.yy, self.K, levels=100)
        plt.title("Fractal Kähler Potential K(x,y)")
        plt.colorbar()
        plt.subplot(1, 2, 2)
        plt.contourf(self.xx, self.yy, self.g, levels=100)
        plt.title("Metric component g(x,y)")
        plt.colorbar()
        plt.tight_layout()
        plt.show()


if __name__ == "__main__":
    # demonstration: run a simple holonomy computation on a circle
    fm = FractalKahlerManifold(size=150, fractal_level=4, scale=0.2)
    def circle_loop(t: float):
        theta = 2 * np.pi * t
        return (0.5 + 0.5 * np.cos(theta), -0.3 + 0.5 * np.sin(theta))
    init_v = (1.0, 0.0)
    angle, rot, (vx, vy), pts = fm.compute_holonomy(circle_loop, init_v, steps=200)
    print("Holonomy angle (deg):", np.degrees(angle))
    # plot path and transported vectors
    plt.figure(figsize=(6, 6))
    plt.title("Parallel Transport on Fractal Kähler Manifold (Real Coordinates)")
    plt.imshow(fm.g, extent=(-2, 2, -2, 2), origin="lower", alpha=0.3)
    plt.plot(pts[:, 0], pts[:, 1], "r-")
    skip = len(pts) // 20
    for i in range(0, len(pts), skip):
        x, y = pts[i]
        plt.quiver(x, y, vx[i], vy[i], scale=20, width=0.005)
    plt.xlabel("x")
    plt.ylabel("y")
    plt.tight_layout()
    plt.show()