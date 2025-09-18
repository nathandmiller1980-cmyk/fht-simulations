import { NextRequest, NextResponse } from "next/server";
import { normalizeFormula, formatFormula, ionicPlausible } from "@/lib/chem";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { inputs } = body as { inputs: {symbol:string;count:number}[] };
  const f = normalizeFormula(inputs);
  const plausible = ionicPlausible(inputs);
  const verdict = plausible ? "valid" : "uncertain";
  const rationale = plausible ? "Charge balance heuristic satisfied." : "Charge heuristic not decisive.";
  return NextResponse.json({ verdict, formula: formatFormula(f), rationale });
}
