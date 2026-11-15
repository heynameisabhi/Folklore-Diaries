"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface Category {
  title: string;
  sanskrit: string;
  tag: string;
  description: string;
  examples: string;
  image: string;
  count: string;
}

const CATEGORIES: Category[] = [
  {
    title: "Fresh Medicinal Herbs",
    sanskrit: "पत्र व वनस्पति (Patra & Vanaspati)",
    tag: "FRESH BOTANICALS",
    description:
      "Fresh leaves, whole wild-harvested herbs, and aerial plant parts used for single-herb extracts, fresh juices (Swarasa), and poultices.",
    examples: "Tulsi (Holy Basil) · Neem · Brahmi · Vasa",
    image: "/images/medicinal-tulsi.jpg",
    count: "350+ Herbs",
  },
  {
    title: "Rhizomes, Roots & Churnas",
    sanskrit: "मूल व चूर्ण (Moola & Churna)",
    tag: "HERBAL POWDERS & ROOTS",
    description:
      "Fine therapeutic powders and active rhizomes harvested, sun-dried, and compounded according to classical Ayurvedic samhitās.",
    examples: "Haridra (Turmeric) · Ashwagandha · Triphala · Shatavari",
    image: "/images/turmeric-medicine.jpg",
    count: "180+ Formulations",
  },
  {
    title: "Medicated Oils & Decoctions",
    sanskrit: "तैल व कषाय (Taila & Kashayam)",
    tag: "HERBAL OILS & EXTRACTS",
    description:
      "Slow-infused therapeutic herbal oils (Taila) and concentrated water decoctions (Kashayam) prepared through classical heat processing.",
    examples: "Kshirabala Taila · Mahanarayan · Dashamoola Kashaya",
    image: "/images/herbal-oil-taila.jpg",
    count: "90+ Preparations",
  },
  {
    title: "Therapeutic Spices & Compounds",
    sanskrit: "दीपन व पाचन द्रव्य (Deepana Dravya)",
    tag: "MEDICINAL SPICES & SEEDS",
    description:
      "Classical medicinal spices, seeds, and aromatic botanical catalysts used to stimulate digestive fire (Agni) and compound multi-herb formulas.",
    examples: "Trikatu (Pippali, Maricha, Shunti) · Elaichi · Lavanga · Twak",
    image: "/images/ayurvedic-spices.jpg",
    count: "75+ Compounds",
  },
];

export default function SourceTaxonomySection() {
  return (
    <section className="py-24 bg-black relative border-t border-zinc-900">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-950/60 text-zinc-400 text-xs font-mono tracking-wider mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>AYURVEDIC MATERIA MEDICA</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
              Ayurvedic Herbs & Formulations
            </h2>
            <p className="text-zinc-400 text-sm md:text-base mt-2 max-w-xl">
              From fresh sacred leaves and sun-dried roots to medicated churnas and infused oils,
              explore traditional botanical medicines cataloged across four primary preparation disciplines.
            </p>
          </div>

          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-300 hover:text-white transition-colors group self-start md:self-end"
          >
            <span>Explore Herb Repository</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat, idx) => (
            <div
              key={idx}
              className="group relative rounded-xl border border-zinc-800/80 bg-zinc-950/60 overflow-hidden hover:border-zinc-700 transition-all duration-300 flex flex-col"
            >
              {/* Image Frame */}
              <div className="relative h-48 w-full overflow-hidden bg-zinc-900">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                <span className="absolute top-3 right-3 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-zinc-300 border border-white/10">
                  {cat.count}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono tracking-wider text-emerald-400 mb-1">
                    {cat.tag}
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-serif italic mb-3">
                    {cat.sanskrit}
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                {/* Example pill */}
                <div className="mt-4 pt-3 border-t border-zinc-900/90 text-[11px] text-zinc-400 font-mono truncate">
                  <span className="text-zinc-500">Ex: </span>
                  {cat.examples}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
