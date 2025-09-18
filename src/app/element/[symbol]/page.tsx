import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { symbol: string } }) {
  const el = await prisma.element.findFirst({ where: { symbol: params.symbol }, include: { isotopes: true } });
  if (!el) return notFound();
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">{el.symbol} — {el.name}</h1>
      <p className="text-sm opacity-70">Z={el.atomicNumber} • group {el.group ?? "—"} • period {el.period ?? "—"} • {el.category}</p>
      <section className="mt-4">
        <h2 className="font-semibold">Isotopes</h2>
        <ul className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
          {el.isotopes.sort((a, b) => a.A - b.A).map((iso) => (
            <li key={iso.id} className="border rounded p-2">
              <div className="font-mono">{iso.symbol} (Z={iso.Z}, N={iso.N})</div>
              <div className="text-xs">mass u: {iso.atomicMassU ?? "?"}</div>
              <div className="text-xs">t½: {iso.halfLifeS ? `${iso.halfLifeS}s` : "stable"}</div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
