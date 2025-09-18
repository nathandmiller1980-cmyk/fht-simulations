"use client";
import { useState } from "react";

export default function Page() {
  const [inputs, setInputs] = useState<any[]>([
    { symbol: "Na", count: 1 },
    { symbol: "Cl", count: 1 }
  ]);
  const [res, setRes] = useState<any>(null);

  async function validate() {
    const r = await fetch("/api/chem/validate", {
      method: "POST",
      body: JSON.stringify({ inputs })
    });
    setRes(await r.json());
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Chemical Sandbox</h1>

      <div className="space-y-2">
        {inputs.map((p, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              className="border px-2 py-1 w-24"
              value={p.symbol}
              onChange={(e) => {
                const c = [...inputs];
                c[i] = { ...p, symbol: e.target.value };
                setInputs(c);
              }}
            />
            <input
              type="number"
              className="border px-2 py-1 w-20"
              value={p.count}
              onChange={(e) => {
                const c = [...inputs];
                c[i] = { ...p, count: parseInt(e.target.value || "0") };
                setInputs(c);
              }}
            />
            <button
              className="text-red-600"
              onClick={() => setInputs(inputs.filter((_, j) => j !== i))}
            >
              remove
            </button>
          </div>
        ))}
        <button
          className="border px-3 py-1 rounded"
          onClick={() => setInputs([...inputs, { symbol: "", count: 1 }])}
        >
          + add
        </button>
      </div>

      <button
        className="mt-4 px-4 py-2 rounded bg-black text-white"
        onClick={validate}
      >
        Validate
      </button>
      {res && (
        <div className="mt-4 border rounded p-3">
          <div>
            Verdict: <b>{res.verdict}</b>
          </div>
          <div>Formula: {res.formula}</div>
          <div className="text-sm opacity-70">{res.rationale}</div>
        </div>
      )}
    </main>
  );
}
