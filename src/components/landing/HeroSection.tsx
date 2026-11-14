"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Database, Search, ShieldCheck } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const imageFrameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.from(leftColRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
      }).from(
        imageFrameRef.current,
        {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
        },
        "-=0.6"
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="min-h-[calc(100vh-64px)] relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-black flex items-center"
    >
      {/* Subtle background ambient warmth — very quiet and restrained */}
      <div className="absolute top-0 right-1/4 w-[450px] h-[450px] rounded-full bg-emerald-950/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[350px] h-[350px] rounded-full bg-zinc-900/40 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Mission, Typography, Actions (7 cols) */}
          <div ref={leftColRef} className="lg:col-span-7 flex flex-col justify-center">
            {/* Minimal Archive Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-950/80 text-zinc-400 text-xs font-mono tracking-wider mb-6 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>FOLK MEDICINE REPOSITORY • VERIFIED DATA</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.12] mb-6">
              Documenting Ancestral{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Botanical
              </span>{" "}
              Wisdom.
            </h1>

            {/* Subtitle / Mission */}
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mb-8">
              An open digital archive safeguarding traditional folk medicine knowledge. 
              Cataloging medicinal plants, classical Sanskrit and regional synonyms, 
              disease applications, and the oral lineage healers who hold them.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 mb-12">
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium transition-all shadow-sm hover:shadow-emerald-900/30"
              >
                <span>Explore the Archive</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="#taxonomy"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 text-sm font-medium transition-all"
              >
                <span>Browse Sources</span>
              </Link>
            </div>

            {/* Specimen Key Metrics Strip */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-zinc-900 max-w-lg">
              <div>
                <div className="text-2xl font-semibold text-white tracking-tight">500+</div>
                <div className="text-xs text-zinc-400 mt-0.5">Formulations</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-white tracking-tight">4 Origins</div>
                <div className="text-xs text-zinc-400 mt-0.5">Plant, Organic, Mineral, Oral</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-white tracking-tight">Verified</div>
                <div className="text-xs text-zinc-400 mt-0.5">Research Publications</div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Photograph Frame (5 cols) */}
          <div ref={imageFrameRef} className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Museum-style Card Frame */}
              <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 p-2.5 shadow-2xl overflow-hidden">
                {/* Image Container */}
                <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-zinc-900">
                  <Image
                    src="/images/hero-apothecary.jpg"
                    alt="Authentic traditional herbal apothecary with mortar and fresh botanicals"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 420px"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top Specimen Badge */}
                  <div className="absolute top-3.5 left-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      SPECIMEN NO. 01 • BOTANICA
                    </span>
                  </div>

                  {/* Bottom Image Plaque */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                      Materia Medica & Lineage
                    </p>
                    <h3 className="text-sm font-medium text-white mt-0.5">
                      Traditional Mortar & Pestle (Kharal) Preparation
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">
                      Preserving traditional grinding, extraction, and fresh leaf decoction methods.
                    </p>
                  </div>
                </div>

                {/* Lower Card Bar */}
                <div className="mt-2.5 px-3 py-2 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span>Archived at Folklore Diaries</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> Curated
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
