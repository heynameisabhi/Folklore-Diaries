"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import AyurvedicIllustration from "@/components/AyurvedicIllustration"

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const illustrationRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger)
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline()

      tl.from(badgeRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
      })
        .from(
          headingRef.current,
          { y: 50, opacity: 0, duration: 1, ease: "power3.out" },
          "-=0.2",
        )
        .from(
          textRef.current,
          { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" },
          "-=0.4",
        )
        .from(
          ctaRef.current,
          { y: 20, opacity: 0, duration: 0.6, ease: "power3.out" },
          "-=0.2",
        )
        .from(
          illustrationRef.current,
          { scale: 0.8, opacity: 0, duration: 1.2, ease: "power3.out" },
          "-=1.0",
        )

      // Slow continuous rotation of the mandala illustration
      gsap.to(illustrationRef.current, {
        rotation: 360,
        duration: 90,
        repeat: -1,
        ease: "none",
        transformOrigin: "50% 50%",
      })

      // Floating animation for orbs
      gsap.to(".gradient-orb", {
        y: "random(-20, 20)",
        x: "random(-20, 20)",
        duration: "random(3, 6)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.2,
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="min-h-screen relative pt-24 pb-16 overflow-hidden">
      {/* Rich layered background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_60%_40%,#052e1640,transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_20%_70%,#78350f20,transparent)]" />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-20 w-[300px] h-[300px] rounded-full bg-gradient-to-r from-emerald-900/20 to-green-800/20 blur-3xl gradient-orb" />
      <div className="absolute bottom-1/4 -right-20 w-[250px] h-[250px] rounded-full bg-gradient-to-r from-amber-900/15 to-yellow-800/10 blur-3xl gradient-orb" />
      <div className="absolute top-3/4 left-1/3 w-[200px] h-[200px] rounded-full bg-gradient-to-r from-emerald-800/10 to-green-700/10 blur-3xl gradient-orb" />

      {/* Fine grid texture */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle, #16a34a18 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-96px)]">
          {/* Left — text content */}
          <div className="flex flex-col justify-center order-2 lg:order-1">
            {/* Heritage badge */}
            <div ref={badgeRef} className="inline-flex items-center gap-2 mb-6 self-start">
              <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase border border-amber-700/50 bg-amber-900/20 text-amber-400">
                🌿 Ayurvedic Heritage Archive
              </span>
            </div>

            <h1
              ref={headingRef}
              className="text-5xl tracking-wide text-white md:text-6xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-tight"
            >
              Preserving{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500">
                Ancient
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                Folk Wisdom
              </span>
            </h1>

            <p
              ref={textRef}
              className="text-base md:text-lg text-zinc-300 mb-8 max-w-lg leading-relaxed"
            >
              <span className="text-emerald-400 font-medium">Folklore Diaries</span> is a living
              digital sanctuary documenting centuries of traditional Ayurvedic and folk medicine
              knowledge — herbs, healing practices, oral traditions, and the practitioners who
              carry them forward.
            </p>

            {/* Stats strip */}
            <div className="flex gap-6 mb-8">
              {[
                { value: "500+", label: "Medicinal Herbs" },
                { value: "200+", label: "Contributors" },
                { value: "1000+", label: "Research Links" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-xl font-bold text-emerald-400">{value}</div>
                  <div className="text-xs text-zinc-500">{label}</div>
                </div>
              ))}
            </div>

            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/sign-in"
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-emerald-800 to-green-700 hover:from-emerald-700 hover:to-green-600 text-white font-semibold shadow-lg transition-all hover:shadow-emerald-900/40 hover:shadow-xl flex items-center justify-center gap-2 group"
              >
                Explore Archive
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 rounded-lg border border-amber-800/50 bg-amber-900/10 hover:bg-amber-900/25 text-amber-300 font-medium shadow-md transition-all flex items-center justify-center gap-2"
              >
                🪷 Learn More
              </Link>
            </div>
          </div>

          {/* Right — mandala illustration */}
          <div className="flex items-center justify-center order-1 lg:order-2">
            <div className="relative w-full max-w-[420px] aspect-square">
              {/* Outer glow rings */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-900/30 to-transparent blur-2xl" />
              <div className="absolute inset-6 rounded-full bg-gradient-to-br from-amber-900/20 to-transparent blur-xl" />

              {/* The mandala SVG — slow rotating */}
              <div ref={illustrationRef} className="relative w-full h-full">
                <AyurvedicIllustration variant="hero" className="w-full h-full" />
              </div>

              {/* Floating herb badges */}
              <div className="absolute -top-4 -right-4 bg-zinc-900/90 border border-emerald-800/50 rounded-xl px-3 py-2 text-xs text-emerald-400 font-medium shadow-lg backdrop-blur-sm">
                🌿 Tulsi · Neem · Ashwagandha
              </div>
              <div className="absolute -bottom-4 -left-4 bg-zinc-900/90 border border-amber-800/40 rounded-xl px-3 py-2 text-xs text-amber-400 font-medium shadow-lg backdrop-blur-sm">
                📜 Palm-leaf Manuscripts
              </div>
            </div>
          </div>
        </div>

        {/* Bottom scroll hint */}
        <div className="flex justify-center mt-4 opacity-50">
          <div className="flex flex-col items-center gap-1 text-zinc-500 text-xs">
            <span>Scroll to explore</span>
            <div className="w-px h-8 bg-gradient-to-b from-zinc-500 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  )
}
