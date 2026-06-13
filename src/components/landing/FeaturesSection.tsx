"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { ScanSearch, FileText, Database, Share2, Search, BarChart3 } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  index: number
}

function FeatureCard({ icon, title, description, index }: FeatureCardProps) {
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

  return (
    <div
      ref={cardRef}
      className="p-8 rounded-xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm hover:border-emerald-900/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-900/10"
    >
      <div className="rounded-lg bg-gradient-to-br from-emerald-800 to-green-700 p-3 w-12 h-12 flex items-center justify-center mb-4 shadow-md">
        {icon}
      </div>
      <h3 className="text-2xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-[18px] text-zinc-400">{description}</p>
    </div>
  )
}

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)

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
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const features = [
    {
      icon: <ScanSearch className="h-6 w-6 text-white" />,
      title: "Drug Documentation",
      description:
        "Catalog traditional medicinal drugs with botanical descriptions, multiple names (Sanskrit, Vernacular), and source types.",
    },
    {
      icon: <FileText className="h-6 w-6 text-white" />,
      title: "Disease & Usage Mapping",
      description:
        "Link drugs to diseases with detailed usage methods, preserving the traditional knowledge of folk healing practices.",
    },
    {
      icon: <Database className="h-6 w-6 text-white" />,
      title: "Contributor Records",
      description:
        "Document knowledge contributors — their lineage, practice duration, and guru connections to trace the oral tradition.",
    },
    {
      icon: <Search className="h-6 w-6 text-white" />,
      title: "Research & Articles",
      description:
        "Link published research articles and theses to drugs, bridging traditional knowledge with modern scientific validation.",
    },
    {
      icon: <Share2 className="h-6 w-6 text-white" />,
      title: "Collaborative Platform",
      description:
        "Work together with researchers and practitioners worldwide to verify and expand the folk medicine knowledge base.",
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-white" />,
      title: "Analytics & Insights",
      description:
        "Gain valuable insights into drug collections with comprehensive analytics and visualization tools.",
    },
  ]

  return (
    <section id="features" ref={sectionRef} className="py-20 relative">
      {/* Gradient background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div ref={headingRef} className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl text-white md:text-4xl font-bold mb-4">
            Powerful{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-400">
              Features
            </span>
          </h2>
          <p className="text-zinc-400 text-lg">
            Our platform combines technology with traditional knowledge to document and preserve
            folk medicine practices for future generations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

