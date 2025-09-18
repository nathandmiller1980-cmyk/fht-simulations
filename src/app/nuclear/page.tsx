"use client";
import { useState } from "react";

type Item = { type: "nuclide"; Z: number; A: number; count: number } | { type: "particle"; key: "n" | "p" | "alpha" | "gamma"; count: number };

export default function Page() {
  const [rtype, setRtype] = useState("capture");
  const [inputs, setInputs] = useState<Item[]>([
    { type: "nuclide", Z: 92, A: 235, count: 1 },
    { type: "particle", key: "n", count: 1 }
  ]);
  const [outputs, setOutputs] = useState<Item[]>([
    { type: "nuclide", Z: 92, A: 236, count: 1 },
    { type: "particle", key: "gamma", count: 1 }
  ]);
  const [res, setRes] = useState<any>(null);

  async function validate() {
    const r = await fetch("/api/nuclear/validate", {
      method: "POST",
      body: JSON.stringify({ inputs, outputs, rtype })
    });
    setRes(await r.json());
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Nuclear Sandbox</h1>

      <div className="mb-2">
        <label className="mr-2">Type</label>
        <select
          className="border px-2 py-1"
          value={rtype}
          onChange={(e) => setRtype(e.target.value)}
        >
          <option>capture</option>
          <option>beta_decay</option>
          <option>alpha_decay</option>
          <option>gamma</option>
          <option>fission</option>
          <option>fusion</option>
          <option>transmutation</option>
          <option>custom</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h2 className="font-semibold">Reactants</h2>
          <List items={inputs} setItems={setInputs} />
        </div>
        <div>
          <h2 className="font-semibold">Products</h2>
          <List items={outputs} setItems={setOutputs} />
        </div>
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
          <div>
            Q-value: {res.qMeV === null ? "—" : `${res.qMeV.toFixed(3)} MeV`}
          </div>
          <div className="text-sm opacity-70">{res.rationale}</div>
        </div>
      )}
    </main>
  );
}

function List({
  items,
  setItems
}: {
  items: Item[];
  setItems: (x: Item[]) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex gap-2 items-center">
          <select
            className="border px-2 py-1"
            value={it.type}
            onChange={(e) => {
              const t = e.target.value as "nuclide" | "particle";
              const copy = [...items];
              copy[i] =
                t === "nuclide"
                  ? { type: "nuclide", Z: 1, A: 1, count: 1 }
                  : { type: "particle", key: "n", count: 1 };
              setItems(copy);
            }}
          >
            <option value="nuclide">nuclide</option>
            <option value="particle">particle</option>
          </select>
          {it.type === "nuclide" ? (
            <>
              <input
                className="border px-2 py-1 w-20"
                type="number"
                value={it.Z}
                onChange={(e) => {
                  const c = [...items];
                  (c[i] as any).Z = parseInt(e.target.value || "0");
                  setItems(c);
                }}
                placeholder="Z"
              />
              <input
                className="border px-2 py-1 w-20"
                type="number"
                value={it.A}
                onChange={(e) => {
                  const c = [...items];
                  (c[i] as any).A = parseInt(e.target.value || "0");
                  setItems(c);
                }}
                placeholder="A"
              />
            </>
          ) : (
            <select
              className="border px-2 py-1"
              value={(it as any).key}
              onChange={(e) => {
                const c = [...items];
                (c[i] as any).key = e.target.value;
                setItems(c);
              }}
            >
              <option value="n">n</option>
              <option value="p">p</option>
              <option value="alpha">alpha</option>
              <option value="gamma">gamma</option>
            </select>
          )}
          <input
            className="border px-2 py-1 w-16"
            type="number"
            value={it.count}
            onChange={(e) => {
              const c = [...items];
              (c[i] as any).count = parseInt(e.target.value || "1");
              setItems(c);
            }}
          />
          <button
            className="text-red-600"
            onClick={() => setItems(items.filter((_, j) => j !== i))}
          >
            remove
          </button>
        </div>
      ))}
      <button
        className="border px-3 py-1 rounded"
        onClick={() => setItems([...items, { type: "nuclide", Z: 1, A: 1, count: 1 } as any])}
      >
        + add
      </button>
    </div>
  );
}
