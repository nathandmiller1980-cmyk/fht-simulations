import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function Home() {
  const elements = await prisma.element.findMany({ orderBy: { atomicNumber: "asc" } });
  // 18x7 grid via CSS; position by group/period when available, else flow
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Periodic Table</h1>
      <div className="grid" style={{ gridTemplateColumns: "repeat(18,minmax(2.5rem,1fr))", gap: "0.25rem" }}>
        {elements.map((e) => (
          <Link key={e.id} href={`/element/${e.symbol}`} className="rounded-xl border p-2 hover:shadow bg-white">
            <div className="text-xs opacity-70">{e.atomicNumber}</div>
            <div className="text-lg font-bold">{e.symbol}</div>
            <div className="text-xs truncate">{e.name}</div>
          </Link>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <Link href="/sandbox" className="underline">Chemical Sandbox</Link>
        <Link href="/nuclear" className="underline">Nuclear Sandbox</Link>
      </div>
    </main>
  );
}
