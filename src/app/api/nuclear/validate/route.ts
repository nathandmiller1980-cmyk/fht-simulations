import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { conservationVerdict, qValueMeV, PARTICLES } from "@/lib/nuclear";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { inputs, outputs, rtype } = body as any;

  const load = async (x: any) => {
    if (x.type === "particle") return { Z: PARTICLES[x.key].Z, A: PARTICLES[x.key].A, massU: PARTICLES[x.key].massU, count: x.count ?? 1, label: x.key };
    // nuclide
    const iso = await prisma.isotope.findFirst({ where: { Z: x.Z, A: x.A } });
    if (!iso) return { Z: x.Z, A: x.A, massU: undefined, count: x.count ?? 1, label: `${x.A}${"X"}` };
    return { Z: iso.Z, A: iso.A, massU: iso.atomicMassU ?? undefined, count: x.count ?? 1, label: `${iso.symbol}` };
  };

  const IN = await Promise.all(inputs.map(load));
  const OUT = await Promise.all(outputs.map(load));

  const cons = conservationVerdict(IN, OUT);
  if (!cons.ok) return NextResponse.json({ verdict: "invalid", qMeV: null, rationale: cons.reason });

  const q = qValueMeV(IN, OUT);
  const rationale = q !== undefined ? `Q = ${q.toFixed(3)} MeV` : "Q not computed (missing masses).";

  // simple plausibility tags
  let plausible = true;
  if (rtype === "beta_decay") {
    // A same, |ΔZ|=1
    const zin = IN.reduce((s, x) => s + x.Z * (x.count ?? 1), 0);
    const zout = OUT.reduce((s, x) => s + x.Z * (x.count ?? 1), 0);
    const ain = IN.reduce((s, x) => s + x.A * (x.count ?? 1), 0);
    const aout = OUT.reduce((s, x) => s + x.A * (x.count ?? 1), 0);
    plausible = ain === aout && Math.abs(zout - zin) === 1;
  }
  const verdict = plausible ? "valid" : "uncertain";
  return NextResponse.json({ verdict, qMeV: q ?? null, rationale });
}
