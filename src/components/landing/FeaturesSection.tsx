"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { ScanSearch, FileText, Database, Share2, Search, BarChart3 } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import AyurvedicIllustration from "@/components/AyurvedicIllustration"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  index: number
  accent?: "emerald" | "amber" | "gold"
}

function FeatureCard({ icon, title, description, index, accent = "emerald" }: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger)
    }

    gsap.from(cardRef.current, {
      scrollTrigger: {
        trigger: cardRef.current,
        start: "top bottom-=100",
        toggleActions: "play none none none",
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      delay: index * 0.1,
      ease: "power3.out",
    })
  }, [index])

  const accentMap = {
    emerald: {
      icon: "from-emerald-900 to-green-800",
      border: "hover:border-emerald-800/60",
      glow: "hover:shadow-emerald-900/20",
      title: "text-emerald-300",
    },
    amber: {
      icon: "from-amber-900 to-yellow-800",
      border: "hover:border-amber-800/60",
      glow: "hover:shadow-amber-900/20",
      title: "text-amber-300",
    },
    gold: {
      icon: "from-yellow-900 to-amber-800",
      border: "hover:border-yellow-800/60",
      glow: "hover:shadow-yellow-900/20",
      title: "text-yellow-300",
    },
  }
  const a = accentMap[accent]

  return (
    <div
      ref={cardRef}
      className={`group p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-sm ${a.border} transition-all duration-300 hover:shadow-lg ${a.glow} relative overflow-hidden`}
    >
      {/* Subtle corner mandala decoration */}
      <div className="absolute -top-6 -right-6 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
        <AyurvedicIllustration variant="hero" className="w-full h-full" />
      </div>

      <div className={`rounded-xl bg-gradient-to-br ${a.icon} p-3 w-12 h-12 flex items-center justify-center mb-4 shadow-md`}>
        {icon}
      </div>
      <h3 className={`text-lg font-semibold ${a.title} mb-2`}>{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </div>
  )
}

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger)
    }

    const ctx = gsap.context(() => {
      gsap.from(headingRef.current, {
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top bottom-=100",
          toggleActions: "play none none none",
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      })

      gsap.from(".gallery-panel", {
        scrollTrigger: {
          trigger: galleryRef.current,
          start: "top bottom-=80",
          toggleActions: "play none none none",
        },
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: "power3.out",
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const features = [
    {
      icon: <ScanSearch className="h-6 w-6 text-white" />,
      title: "Drug Documentation",
      description:
        "Catalog traditional medicinal plants with botanical descriptions, multiple names (Sanskrit, Vernacular), and source types.",
      accent: "emerald" as const,
    },
    {
      icon: <FileText className="h-6 w-6 text-white" />,
      title: "Disease & Usage Mapping",
      description:
        "Link herbs to diseases with detailed usage methods, preserving the traditional knowledge of folk healing practices.",
      accent: "amber" as const,
    },
    {
      icon: <Database className="h-6 w-6 text-white" />,
      title: "Contributor Records",
      description:
        "Document knowledge holders — their lineage, practice duration, and guru connections to trace the oral tradition.",
      accent: "emerald" as const,
    },
    {
      icon: <Search className="h-6 w-6 text-white" />,
      title: "Research & Articles",
      description:
        "Link published research and theses to herbs, bridging traditional knowledge with modern scientific validation.",
      accent: "gold" as const,
    },
    {
      icon: <Share2 className="h-6 w-6 text-white" />,
      title: "Collaborative Platform",
      description:
        "Work together with researchers and practitioners worldwide to verify and expand the folk medicine knowledge base.",
      accent: "amber" as const,
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-white" />,
      title: "Analytics & Insights",
      description:
        "Gain valuable insights into herb collections with comprehensive analytics, AI search, and visualization tools.",
      accent: "gold" as const,
    },
  ]

  const galleryPanels = [
    {
      variant: "botanical" as const,
      title: "Medicinal Botanicals",
      desc: "Sacred herbs of Ayurveda",
      accent: "text-emerald-400 border-emerald-900/50 bg-emerald-950/20",
    },
    {
      variant: "manuscript" as const,
      title: "Ancient Manuscripts",
      desc: "Palm-leaf healing texts",
      accent: "text-amber-400 border-amber-900/50 bg-amber-950/20",
    },
    {
      variant: "formulation" as const,
      title: "Herbal Formulations",
      desc: "Traditional preparation art",
      accent: "text-yellow-400 border-yellow-900/50 bg-yellow-950/20",
    },
  ]

  return (
    <section id="features" ref={sectionRef} className="py-20 relative">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
      {/* Warm ambient from bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-amber-950/10 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div ref={headingRef} className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase border border-amber-700/40 bg-amber-900/15 text-amber-400 mb-4">
            Platform Capabilities
          </span>
          <h2 className="text-3xl text-white md:text-4xl font-bold mb-4">
            Rooted in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">
              Tradition,
            </span>{" "}
            Powered by{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
              Technology
            </span>
          </h2>
          <p className="text-zinc-400 text-base leading-relaxed">
            Our platform unites ancient Ayurvedic wisdom with modern digital preservation tools,
            ensuring centuries of healing knowledge survive for future generations.
          </p>
        </div>

        {/* Illustrated gallery strip */}
        <div ref={galleryRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {galleryPanels.map((panel) => (
            <div
              key={panel.variant}
              className={`gallery-panel relative rounded-2xl border ${panel.accent} p-6 overflow-hidden group hover:scale-[1.02] transition-transform duration-300 cursor-pointer`}
            >
              <div className="h-48 flex items-center justify-center mb-4">
                <AyurvedicIllustration
                  variant={panel.variant}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center">
                <h3 className={`font-semibold text-sm ${panel.accent.split(" ")[0]}`}>
                  {panel.title}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">{panel.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
              accent={feature.accent}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
