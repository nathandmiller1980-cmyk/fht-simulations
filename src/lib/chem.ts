export type Formula = Record<string, number>;

export function normalizeFormula(parts: { symbol: string; count: number }[]): Formula {
  const f: Formula = {};
  for (const p of parts) {
    if (!p.symbol || p.count <= 0) continue;
    f[p.symbol] = (f[p.symbol] ?? 0) + p.count;
  }
  return f;
}

export function formatFormula(f: Formula): string {
  // H2O → "H₂O"
  const sub = (n: number) => (n === 1 ? "" : n.toString().replace(/[0-9]/g, d => "₀₁₂₃₄₅₆₇₈₉"[+d]));
  return Object.entries(f).sort().map(([sym, n]) => `${sym}${sub(n)}`).join("");
}

// very small plausibility heuristics
const typicalOx = new Map<string, number>([
  ["Na", +1], ["Cl", -1], ["O", -2], ["H", +1], ["C", 4]
]);

export function ionicPlausible(inParts: {symbol:string;count:number}[]) {
  // Check net charge ~ 0 if we pair metal + nonmetal with typical ox states
  const charge = inParts.reduce((acc,p)=> acc + (typicalOx.get(p.symbol) ?? 0)*p.count, 0);
  return Math.abs(charge) < 1e-6;
}
