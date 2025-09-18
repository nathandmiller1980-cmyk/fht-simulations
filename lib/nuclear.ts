export type Nuclide = { Z: number; A: number; massU?: number };
export type Particle = { name: string; Z: number; A: number; massU?: number };

export const PARTICLES: Record<string, Particle> = {
  n: { name: "n", Z: 0, A: 1, massU: 1.00866491588 },
  p: { name: "p", Z: 1, A: 1, massU: 1.00727646688 }, // nuclear masses; good enough for demo
  alpha: { name: "alpha", Z: 2, A: 4, massU: 4.001506179127 },
  gamma: { name: "gamma", Z: 0, A: 0, massU: 0 },
  // beta are tricky (neutrino etc.), omit from mass sum for demo
};

const MEV_PER_U = 931.49410242;

export function sumZA(list: { Z: number; A: number; count?: number }[]) {
  let Z = 0,
    A = 0;
  for (const x of list) {
    const c = x.count ?? 1;
    Z += x.Z * c;
    A += x.A * c;
  }
  return { Z, A };
}

export function qValueMeV(
  inputs: { massU?: number; count?: number }[],
  outputs: { massU?: number; count?: number }[]
) {
  if (!inputs.every((x) => x.massU) || !outputs.every((x) => x.massU)) return undefined;
  const mi = inputs.reduce((s, x) => s + x.massU! * (x.count ?? 1), 0);
  const mo = outputs.reduce((s, x) => s + x.massU! * (x.count ?? 1), 0);
  return (mi - mo) * MEV_PER_U;
}

export function conservationVerdict(
  inpZA: { Z: number; A: number; count?: number }[],
  outZA: { Z: number; A: number; count?: number }[]
) {
  const i = sumZA(inpZA),
    o = sumZA(outZA);
  if (i.Z !== o.Z || i.A !== o.A)
    return {
      ok: false,
      reason: `Conservation violated: in(Z=${i.Z},A=${i.A}) != out(Z=${o.Z},A=${o.A})`,
    };
  return { ok: true };
}
