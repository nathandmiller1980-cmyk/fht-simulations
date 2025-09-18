import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const elements = [
  { Z: 1,  symbol: "H",  name: "Hydrogen",  group: 1, period: 1, block: "s", category: "nonmetal", atomicMassU: 1.00784 },
  { Z: 2,  symbol: "He", name: "Helium",    group: 18, period: 1, block: "s", category: "noble gas", atomicMassU: 4.002602 },
  { Z: 6,  symbol: "C",  name: "Carbon",    group: 14, period: 2, block: "p", category: "nonmetal", atomicMassU: 12.0107 },
  { Z: 7,  symbol: "N",  name: "Nitrogen",  group: 15, period: 2, block: "p", category: "nonmetal", atomicMassU: 14.0067 },
  { Z: 8,  symbol: "O",  name: "Oxygen",    group: 16, period: 2, block: "p", category: "nonmetal", atomicMassU: 15.999 },
  { Z: 11, symbol: "Na", name: "Sodium",    group: 1,  period: 3, block: "s", category: "alkali metal", atomicMassU: 22.98976928 },
  { Z: 17, symbol: "Cl", name: "Chlorine",  group: 17, period: 3, block: "p", category: "halogen", atomicMassU: 35.45 },
  { Z: 92, symbol: "U",  name: "Uranium",   group: 6,  period: 7, block: "f", category: "actinide", atomicMassU: 238.02891 },
];

const isotopes = [
  { Z:1, N:0, A:1, symbol:"1H", atomicMassU:1.007825, halfLifeS:null, decayModes:[], abundancePct:99.9885 },
  { Z:1, N:1, A:2, symbol:"2H", atomicMassU:2.014102, halfLifeS:null, decayModes:[], abundancePct:0.0115 },
  { Z:2, N:2, A:4, symbol:"4He", atomicMassU:4.002603, halfLifeS:null, decayModes:[], abundancePct:100 },
  { Z:6, N:6, A:12, symbol:"12C", atomicMassU:12.000000, halfLifeS:null, decayModes:[], abundancePct:98.93 },
  { Z:7, N:7, A:14, symbol:"14N", atomicMassU:14.003074, halfLifeS:null, decayModes:[], abundancePct:99.636 },
  { Z:8, N:8, A:16, symbol:"16O", atomicMassU:15.994915, halfLifeS:null, decayModes:[], abundancePct:99.762 },
  { Z:11,N:12,A:23, symbol:"23Na", atomicMassU:22.989770, halfLifeS:null, decayModes:[], abundancePct:100 },
  { Z:17,N:18,A:35, symbol:"35Cl", atomicMassU:34.968853, halfLifeS:null, decayModes:[], abundancePct:75.78 },
  { Z:17,N:20,A:37, symbol:"37Cl", atomicMassU:36.965903, halfLifeS:null, decayModes:[], abundancePct:24.22 },
  { Z:92,N:143,A:235, symbol:"235U", atomicMassU:235.0439299, halfLifeS:2.221e16, decayModes:[{mode:"alpha", branch:1.0}] },
  { Z:92,N:146,A:238, symbol:"238U", atomicMassU:238.0507882, halfLifeS:1.41e17, decayModes:[{mode:"alpha", branch:1.0}] },
];

async function main() {
  for (const e of elements) {
    await prisma.element.upsert({
      where: { atomicNumber: e.Z },
      update: {},
      create: {
        atomicNumber: e.Z,
        symbol: e.symbol,
        name: e.name,
        group: e.group,
        period: e.period,
        block: e.block,
        category: e.category,
        atomicMassU: e.atomicMassU,
      },
    });
  }
  const all = await prisma.element.findMany();
  const byZ = new Map(all.map(e => [e.atomicNumber, e]));
  for (const iso of isotopes) {
    const el = byZ.get(iso.Z);
    if (!el) continue;
    await prisma.isotope.upsert({
      where: { Z_N: { Z: iso.Z, N: iso.N } },
      update: {},
      create: {
        elementId: el.id,
        Z: iso.Z, N: iso.N, A: iso.A,
        symbol: iso.symbol,
        atomicMassU: iso.atomicMassU ?? null,
        halfLifeS: iso.halfLifeS ?? null,
        decayModes: iso.decayModes ?? [],
        abundancePct: iso.abundancePct ?? null,
      },
    });
  }
}
main().then(() => prisma.$disconnect());
