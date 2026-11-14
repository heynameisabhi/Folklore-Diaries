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
    title: "Plant Origin",
    sanskrit: "वनस्पति (Vanaspati)",
    tag: "BOTANICAL FLORA",
    description:
      "Medicinal leaves, barks, rhizomes, and wild-harvested herbs used for single-drug and compound decoctions.",
    examples: "Tulsi · Ashwagandha · Neem · Brahmi",
    image: "/images/vanaspati-plant.jpg",
    count: "350+ Taxa",
  },
  {
    title: "Organic Origin",
    sanskrit: "जाङ्गम (Jangama)",
    tag: "ORGANIC DERIVATIVES",
    description:
      "Natural therapeutic byproducts including raw wild honey, purified resins, and traditional carriers.",
    examples: "Madhu (Raw Honey) · Ghruta · Natural Resins",
    image: "/images/jangama-organic.jpg",
    count: "40+ Sources",
  },
  {
    title: "Mineral Origin",
    sanskrit: "पार्थिव (Parthiva)",
    tag: "MINERAL & EARTH",
    description:
      "Purified natural ores, elemental minerals, and geo-deposits prepared through classical purification protocols.",
    examples: "Shilajit · Swarna Makshika · Gairika",
    image: "/images/parthiva-mineral.jpg",
    count: "30+ Minerals",
  },
  {
    title: "Lineage & Texts",
    sanskrit: "ग्रन्थ व परम्परा (Grantha)",
    tag: "MANUSCRIPTS & LINEAGE",
    description:
      "Uncataloged palm-leaf folios, regional healer lineages, and preserved oral guru-shishya traditions.",
    examples: "Talapatra Folios · Folk Vaidya Lineages",
    image: "/images/grantha-manuscript.jpg",
    count: "120+ Healers",
  },
];

export default function SourceTaxonomySection() {
  return (
    <section className="py-24 bg-black relative border-t border-zinc-900">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/60 text-zinc-400 text-xs font-mono tracking-wider mb-4">
              <span>●</span> TAXONOMIC CLASSIFICATION
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
              Classified by Natural Origin
            </h2>
            <p className="text-zinc-400 text-sm md:text-base mt-2 max-w-xl">
              Following traditional classical principles, formulations in the
              archive are structured across four fundamental source disciplines.
            </p>
          </div>

          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-300 hover:text-white transition-colors group self-start md:self-end"
          >
            <span>Browse Full Classification</span>
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
                  <span className="text-zinc-400">Ex: </span>
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
