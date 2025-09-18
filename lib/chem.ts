// Minimal chemistry helpers for FHT simulations

export type Formula = Record<string, number>;

/**
 * Normalize a set of chemical parts into a formula object.
 * Each input part has a symbol and count. The function aggregates counts
 * for duplicate symbols and ignores non-positive counts.
 *
 * @param parts A list of symbol/count objects
 * @returns A formula mapping element symbols to counts
 */
export function normalizeFormula(parts: { symbol: string; count: number }[]): Formula {
  const f: Formula = {};
  for (const p of parts) {
    if (!p.symbol || p.count <= 0) continue;
    f[p.symbol] = (f[p.symbol] ?? 0) + p.count;
  }
  return f;
}

/**
 * Format a formula object into a human deable chemical formula.
 * Numbers greater than 1 are rendered as subscript digits.
 *
 * @param f A normalized formula mapping symbols to counts
 * @returns A formatted string, e.g. H₂O
 */
export function formatFormula(f: Formula): string {
  const subDigits = ['₀','₁','₂','₃','₄','₅','₆','₇','₈','₉'];
  const sub = (n: number) => (n === 1 ? '' : n.toString().split('').map(d => subDigits[Number(d)]).join(''));
  // Sort keys alphabetically for deterministic output
  return Object.entries(f)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([sym, n]) => `${sym}${sub(n)}`)
    .join('');
}

// Very minimal oxidation state heuristics for a few common elements
const typicalOx: Record<string, number> = {
  'Na': +1,
  'Cl': -1,
  'O': -2,
  'H': +1,
  'C': +4,
};

/**
 * Check whether a proposed ionic compound is plausible by balancing typical oxidation states.
 * This does not guarantee the compound exists, only that the sum of charges is near zero.
 *
 * @param parts A list of symbol/count objects representing a compound
 * @returns true if the net charge is approximately zero; false otherwise
 */
export function ionicPlausible(parts: { symbol: string; count: number }[]): boolean {
  const charge = parts.reduce((acc, p) => acc + (typicalOx[p.symbol] ?? 0) * p.count, 0);
  return Math.abs(charge) < 1e-6;
}
