"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/components/useAuth";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { drug } from "@prisma/client";
import Link from "next/link";
import { getWeeklyChartData } from "@/helpers/getWeeklyChartData";

type ChartDataPoint = {
  name: string;
  records: number;
};

/* ── Inline SVG Symbols Matching the HTML Wireframe ── */
function Icon({ id, size = 20, className = "" }: { id: string; size?: number; className?: string }) {
  const paths: Record<string, React.ReactNode> = {
    leaf: (
      <>
        <path d="M5 19C3 10 9 3 20 4c1 11-6 17-15 15z" />
        <path d="M5 19c4-6 8-9 12-11" />
      </>
    ),
    mortar: (
      <>
        <path d="M3 11h18a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8z" />
        <path d="M8 19v2h8v-2M16 3l-4.5 8" />
      </>
    ),
    bottle: (
      <>
        <path d="M9 3h6v3l2 3v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9l2-3z" />
        <path d="M7 13h10M12 15.5c1 1.3 1.4 2 1.4 2.6a1.4 1.4 0 0 1-2.8 0c0-.6.4-1.3 1.4-2.6z" />
      </>
    ),
    jar: (
      <>
        <path d="M8 4h8v3H8zM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM6 12h12" />
      </>
    ),
    pot: (
      <>
        <path d="M5 10h14v6a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5zM3 10h18M9 3c0 2 2 2 2 4M14 3c0 2 2 2 2 4" />
      </>
    ),
    lotus: (
      <>
        <path d="M12 20C8 17 7 12 12 5c5 7 4 12 0 15zM12 20C6 20 3 16 3 11c4 0 7 2 9 9zM12 20c6 0 9-4 9-9-4 0-7 2-9 9z" />
      </>
    ),
    flame: (
      <path d="M12 3c3 4 5 6 5 10a5 5 0 0 1-10 0c0-2 1-3 2-5 1 1 1 2 2 2 0-3 0-5 1-7z" />
    ),
    air: (
      <path d="M3 8h11a3 3 0 1 0-3-3M3 13h16a3 3 0 1 1-3 3M3 18h7" />
    ),
    drop: (
      <path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z" />
    ),
    gem: (
      <path d="M12 3l6 6-6 12-6-12zM6 9h12M12 3v18" />
    ),
    hex: (
      <>
        <path d="M12 3l7 4v10l-7 4-7-4V7z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    voice: <path d="M4 5h16v10H9l-5 4z" />,
    home: <path d="M4 11l8-7 8 7v9H4z" />,
    book: (
      <path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z" />
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    users: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M3 20c0-4 3-6 6-6s6 2 6 6M16 5a3.5 3.5 0 0 1 0 7M18 14c2 1 3 3 3 6" />
      </>
    ),
    doc: <path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6" />,
    check: <path d="M4 12l5 5 11-11" />,
    heart: (
      <path d="M12 20S4 15 4 9a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z" />
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={{ flex: "none" }}
    >
      {paths[id] || null}
    </svg>
  );
}

/* ── Lotus Mandala Drawing ── */
function LotusMandala() {
  const petalLarge = Array.from({ length: 16 }, (_, i) => (
    <path
      key={`lp${i}`}
      d="M0-98C-15-78-15-60 0-46 15-60 15-78 0-98z"
      transform={`rotate(${i * 22.5})`}
      fill="var(--accent-soft)"
      stroke="currentColor"
      strokeWidth="1.2"
    />
  ));
  const petalSmall = Array.from({ length: 8 }, (_, i) => (
    <path
      key={`sp${i}`}
      d="M0-62C-9-50-9-40 0-30 9-40 9-50 0-62z"
      transform={`rotate(${i * 45 + 22.5})`}
      fill="none"
      stroke="var(--organic)"
      strokeWidth="1.2"
    />
  ));
  const dots = Array.from({ length: 36 }, (_, i) => (
    <circle
      key={`d${i}`}
      cx="0"
      cy="-108"
      r="1.3"
      fill="currentColor"
      transform={`rotate(${i * 10})`}
    />
  ));
  const corners: [string, number, number][] = [
    ["leaf", 0, -118],
    ["drop", 118, 0],
    ["flame", 0, 118],
    ["mortar", -118, 0],
  ];

  return (
    <svg
      viewBox="-130 -130 260 260"
      role="img"
      aria-label="Lotus mandala with leaf, water, flame and mortar"
      style={{ width: "100%", maxWidth: 340, justifySelf: "center", color: "var(--accent)" }}
    >
      <circle r="112" fill="none" stroke="currentColor" strokeDasharray="2 5" opacity=".6" />
      {petalLarge}
      {petalSmall}
      {dots}
      <circle r="24" fill="var(--surface)" stroke="currentColor" />
      <svg x="-15" y="-15" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20C8 17 7 12 12 5c5 7 4 12 0 15zM12 20C6 20 3 16 3 11c4 0 7 2 9 9zM12 20c6 0 9-4 9-9-4 0-7 2-9 9z" />
      </svg>
      {corners.map(([iconId, cx, cy]) => (
        <g key={iconId}>
          <circle cx={cx} cy={cy} r="13" fill="var(--surface)" stroke="currentColor" />
          <svg x={cx - 8} y={cy - 8} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {iconId === "leaf" && (
              <>
                <path d="M5 19C3 10 9 3 20 4c1 11-6 17-15 15z" />
                <path d="M5 19c4-6 8-9 12-11" />
              </>
            )}
            {iconId === "drop" && <path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z" />}
            {iconId === "flame" && <path d="M12 3c3 4 5 6 5 10a5 5 0 0 1-10 0c0-2 1-3 2-5 1 1 1 2 2 2 0-3 0-5 1-7z" />}
            {iconId === "mortar" && (
              <>
                <path d="M3 11h18a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8z" />
                <path d="M8 19v2h8v-2M16 3l-4.5 8" />
              </>
            )}
          </svg>
        </g>
      ))}
    </svg>
  );
}

/* ── Diamond Pattern Band ── */
function DiamondBand() {
  return (
    <svg width="100%" height="12" aria-hidden="true" style={{ display: "block", color: "var(--accent)", opacity: 0.55, margin: "14px 0 26px" }}>
      <defs>
        <pattern id="pt-user" width="24" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 6l6-5 6 5-6 5zM12 6l6-5 6 5-6 5z" fill="none" stroke="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="12" fill="url(#pt-user)" />
    </svg>
  );
}

/* ── Doshas metadata matching HTML ── */
const DOSHAS: Record<string, { dev: string; el: string; ic: string; d: string; c: string }> = {
  Vata: { dev: "वात", el: "Air and space", ic: "air", d: "Movement, breath, nerves", c: "var(--mineral)" },
  Pitta: { dev: "पित्त", el: "Fire and water", ic: "flame", d: "Digestion, metabolism, heat", c: "var(--organic)" },
  Kapha: { dev: "कफ", el: "Water and earth", ic: "drop", d: "Structure, stability, moisture", c: "var(--plant)" },
};

/* ── Source metadata matching HTML ── */
const SOURCES: Record<string, [string, string, string]> = {
  plant: ["Plant", "leaf", "var(--plant)"],
  organic: ["Organic", "hex", "var(--organic)"],
  mineral: ["Mineral", "gem", "var(--mineral)"],
  oral: ["Oral tradition", "voice", "var(--oral)"],
};

/* ── Formulation type ── */
type Formulation = {
  id: string;
  n: string;
  s: string;
  src: "plant" | "organic" | "mineral" | "oral";
  form: string;
  d: string[];
  use: string;
  ing: string;
  ref: string;
  when: string;
};

export default function Dashboard() {
  useAuth(["user"]);

  const { data: session, status } = useSession();

  // Active filters and drawer state
  const [selectedDosha, setSelectedDosha] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [activeDrawerItem, setActiveDrawerItem] = useState<Formulation | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<"ai" | "filters">("ai");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["drugRecords"],
    queryFn: async () => {
      const response = await axios.get("/api/users/records/get");
      return response.data;
    },
    enabled: !!session,
    refetchOnWindowFocus: false,
  });

  const dbRecords: any[] = data?.recentDrugRecords || [];
  const recordCount = data?.recordCount || 0;

  // Map exclusively the records that the admin has added to the database
  const formulations: Formulation[] = useMemo(() => {
    if (!dbRecords || dbRecords.length === 0) return [];

    return dbRecords.map((r: any) => {
      const rawSrc = (r.source_type || "PLANT").toUpperCase();
      const validSrc: "plant" | "organic" | "mineral" | "oral" =
        rawSrc === "MINERAL"
          ? "mineral"
          : rawSrc === "ANIMAL"
          ? "organic"
          : "plant";

      const formIcon =
        validSrc === "mineral" ? "gem" : validSrc === "organic" ? "jar" : "leaf";

      const namesList: { name: string | null; type: string | null }[] = r.drug_names || [];
      const sanskrit = namesList.find((n) => n.type === "SANSKRIT")?.name;
      const botanical = namesList.find((n) => n.type === "BOTANICAL")?.name;
      const vernacular = namesList.find((n) => n.type === "VERNACULAR")?.name;

      const subtitle = sanskrit || botanical || vernacular || "आयुर्वेदिक योग";

      const diseaseSet = new Set<string>();
      if (Array.isArray(r.drug_disease)) {
        r.drug_disease.forEach((dd: any) => {
          if (dd.disease?.name) diseaseSet.add(dd.disease.name);
        });
      }
      if (Array.isArray(r.usage_method)) {
        r.usage_method.forEach((um: any) => {
          if (um.disease?.name) diseaseSet.add(um.disease.name);
        });
      }
      if (Array.isArray(r.diseases)) {
        r.diseases.forEach((dis: string) => diseaseSet.add(dis));
      }

      const diseaseNames = Array.from(diseaseSet);
      const useText =
        diseaseNames.length > 0
          ? diseaseNames.join(", ")
          : r.usage_method?.[0]?.method_description || "Traditional therapeutic formulation";

      const descParts = [botanical, r.botanical_description].filter(Boolean);
      const ingredientsText = descParts.length > 0 ? descParts.join(" · ") : "Medicinal herbal botanical";

      const refText =
        r.research?.[0]?.title || "Folklore Repository Cataloged Entry";

      const whenText = r.created_at
        ? new Date(r.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "Recently";

      const searchBlob = `${r.primary_name || ""} ${r.botanical_description || ""} ${useText}`.toLowerCase();
      const doshas: string[] = [];
      if (searchBlob.includes("vata") || searchBlob.includes("वात")) doshas.push("Vata");
      if (searchBlob.includes("pitta") || searchBlob.includes("पित्त")) doshas.push("Pitta");
      if (searchBlob.includes("kapha") || searchBlob.includes("कफ")) doshas.push("Kapha");
      if (doshas.length === 0) {
        doshas.push("Vata", "Pitta", "Kapha");
      }

      return {
        id: r.id || r.primary_name || Math.random().toString(),
        n: r.primary_name || "Botanical Formulation",
        s: subtitle,
        src: validSrc,
        form: formIcon,
        d: doshas,
        use: useText,
        ing: ingredientsText,
        ref: refText,
        when: whenText,
      };
    });
  }, [dbRecords]);

  // Filtered formulations
  const filteredFormulations = useMemo(() => {
    return formulations.filter((f) => {
      if (selectedDosha && !f.d.includes(selectedDosha)) return false;
      if (selectedSource && f.src !== selectedSource) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          f.n.toLowerCase().includes(q) ||
          f.s.toLowerCase().includes(q) ||
          f.use.toLowerCase().includes(q) ||
          f.ing.toLowerCase().includes(q) ||
          f.d.some((d) => d.toLowerCase().includes(q)) ||
          SOURCES[f.src][0].toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [formulations, selectedDosha, selectedSource, searchQuery]);

  // Search suggestion matches
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return formulations.filter((f) =>
      f.n.toLowerCase().includes(q) ||
      f.use.toLowerCase().includes(q) ||
      f.d.some((d) => d.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [formulations, searchQuery]);

  // Handle hotkey "/"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        document.getElementById("user-q")?.focus();
      }
      if (e.key === "Escape") {
        setActiveDrawerItem(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleSave = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        showToast(`Removed from saved`);
        return prev.filter((item) => item !== id);
      } else {
        const found = formulations.find((f) => f.id === id);
        showToast(`Saved “${found?.n || "formulation"}”`);
        return [...prev, id];
      }
    });
  };

  const popularChips = useMemo(() => {
    const set = new Set<string>();
    formulations.forEach((f) => {
      if (f.use && f.use !== "Traditional therapeutic formulation") {
        f.use.split(",").forEach((s) => {
          const trimmed = s.trim();
          if (trimmed && trimmed.length < 25) set.add(trimmed);
        });
      }
    });
    const arr = Array.from(set).slice(0, 4);
    return arr.length > 0 ? arr : ["Vata", "Pitta", "Kapha"];
  }, [formulations]);

  if (status === "loading" || isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "var(--muted)" }}>
        <div style={{ width: 36, height: 36, border: "2px solid var(--accent-soft)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: 16 }} />
        <p style={{ fontSize: 13, fontFamily: "var(--sans)", color: "var(--muted)" }}>Loading Researcher Panel…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: 24 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 32, maxWidth: 400, textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--serif)", color: "var(--warn)" }}>Failed to load repository</h2>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8 }}>Could not fetch records. Please refresh.</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: 24 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 32, maxWidth: 400, textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--serif)", color: "var(--ink)" }}>Access Denied</h2>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8 }}>Please sign in to access the archive.</p>
        </div>
      </div>
    );
  }

  const username = session.user?.name || session.user?.email?.split("@")[0] || "user";

  return (
    <div
      style={{
        background: "var(--bg)",
        color: "var(--ink)",
        font: "16px/1.55 var(--sans)",
        minHeight: "100vh",
        transition: "background .3s",
      }}
    >
      {/* ── CSS Tokens matching Folklore Diaries – Researcher panel.html exactly ── */}
      <style>{`
        :root {
          color-scheme: light;
          --bg: #EEF1E6;
          --surface: #FBFCF7;
          --sunk: #E3E8D8;
          --ink: #1B2A1F;
          --muted: #56655A;
          --line: #CFD7C3;
          --accent: #1F5A3D;
          --accent-ink: #fff;
          --accent-soft: #D5E6D3;
          --plant: #3F7A4B;
          --organic: #B0603A;
          --mineral: #5A6E8C;
          --oral: #9A7A1E;
          --warn: #B4531A;
          --warn-soft: #F6E2CF;
          --serif: "Fraunces", Georgia, serif;
          --sans: "Hind", system-ui, -apple-system, "Segoe UI", sans-serif;
        }
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Hind:wght@400;500;600&display=swap');
        
        .pill { display: inline-block; border-radius: 99px; padding: 1px 10px; font-size: 13px; font-weight: 500; background: var(--accent-soft); }
        .hero { display: grid; grid-template-columns: 1.15fr .85fr; gap: 24px; align-items: center; }
        .hero h1 { font-size: clamp(30px,4.2vw,46px); max-width: 16ch; font-family: var(--serif); font-weight: 600; margin: 0; line-height: 1.15; }
        .hello { color: var(--accent); font: 500 18px var(--serif); margin-bottom: 6px; }
        .sloka { margin: 16px 0 20px; padding: 2px 0 2px 14px; border-left: 3px solid var(--accent); max-width: 52ch; }
        .sloka q { display: block; font: 600 19px/1.5 var(--serif); quotes: none; }
        .sloka span { color: var(--muted); font-size: 14.5px; display: block; }
        .searchwrap { position: relative; }
        .search { display: flex; align-items: center; gap: 8px; background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 7px 7px 7px 14px; }
        .search:focus-within { border-color: var(--accent); }
        .search input { flex: 1; min-width: 0; border: 0; background: none; font: inherit; color: var(--ink); padding: 9px 0; outline: 0; }
        .search input::placeholder { color: var(--muted); }
        kbd { border: 1px solid var(--line); border-radius: 6px; padding: 0 6px; font: 13px var(--sans); color: var(--muted); }
        .seg { display: flex; background: var(--sunk); border-radius: 10px; padding: 3px; }
        .seg button { border: 0; background: none; padding: 6px 11px; border-radius: 8px; font-size: 14px; color: var(--muted); font-weight: 500; cursor: pointer; }
        .seg button[aria-pressed="true"] { background: var(--surface); color: var(--ink); }
        .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; font-size: 14px; color: var(--muted); align-items: center; }
        .chips button { border: 1px solid var(--line); background: none; border-radius: 99px; padding: 4px 12px; cursor: pointer; color: inherit; }
        .chips button:hover { border-color: var(--accent); }
        h2.sec { font-size: 22px; margin: 40px 0 4px; font-family: var(--serif); font-weight: 600; }
        .sub { color: var(--muted); margin: 0 0 14px; font-size: 15px; }
        .doshas { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .dosha { border: 1px solid var(--line); background: var(--surface); border-radius: 18px; padding: 16px; text-align: left; display: grid; grid-template-columns: auto 1fr; gap: 4px 14px; align-items: center; position: relative; transition: border-color .2s; cursor: pointer; }
        .dosha:hover, .dosha[aria-pressed="true"] { border-color: var(--c); }
        .dosha[aria-pressed="true"] { background: color-mix(in srgb, var(--c) 10%, var(--surface)); }
        .dosha .orb { grid-row: span 3; width: 58px; height: 58px; border-radius: 50%; background: color-mix(in srgb, var(--c) 16%, transparent); color: var(--c); display: grid; place-items: center; }
        .dosha .dev { font: 600 28px/1.1 var(--serif); color: var(--c); }
        .dosha b { font-weight: 600; }
        .dosha span.d { color: var(--muted); font-size: 14px; }
        .srcs { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
        .src { display: flex; align-items: center; gap: 8px; border: 1px solid var(--line); background: var(--surface); border-radius: 99px; padding: 7px 16px 7px 12px; color: var(--c); cursor: pointer; }
        .src span { color: var(--ink); font-weight: 500; }
        .src small { color: var(--muted); }
        .src[aria-pressed="true"] { background: var(--c); border-color: var(--c); }
        .src[aria-pressed="true"] span, .src[aria-pressed="true"] small { color: #fff; }
        .bar { display: flex; justify-content: space-between; align-items: end; gap: 10px; flex-wrap: wrap; margin-top: 38px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 14px; margin-top: 14px; }
        .fcard { background: var(--surface); border: 1px solid var(--line); border-radius: 18px; overflow: hidden; text-align: left; display: flex; flex-direction: column; padding: 0; transition: border-color .2s, transform .2s; position: relative; cursor: pointer; }
        .fcard:hover { border-color: var(--c); transform: translateY(-2px); }
        .fcard .pic { height: 96px; background: color-mix(in srgb, var(--c) 14%, var(--surface)); color: var(--c); display: grid; place-items: center; position: relative; }
        .fcard .pic svg.bgm { position: absolute; right: -20px; top: -20px; opacity: .22; }
        .fcard .bd { padding: 14px 16px 16px; }
        .fcard h3 { font-size: 18px; font-family: var(--serif); font-weight: 600; margin: 0; line-height: 1.15; }
        .fcard .sa { color: var(--muted); font-size: 15px; }
        .tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
        .tag { font-size: 13px; border-radius: 99px; padding: 1px 9px; background: var(--sunk); }
        .save { position: absolute; right: 10px; top: 10px; width: 34px; height: 34px; border-radius: 50%; border: 0; background: var(--surface); display: grid; place-items: center; color: var(--muted); cursor: pointer; z-index: 2; }
        .save[aria-pressed="true"] { color: var(--organic); }
        .save[aria-pressed="true"] svg { fill: currentColor; }
        .card { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 18px; }
        .card h3 { font-size: 18px; font-family: var(--serif); font-weight: 600; margin: 0 0 12px; }
        .empty { background: var(--sunk); border-radius: 12px; padding: 14px; color: var(--muted); font-size: 14.5px; }
        .empty b { color: var(--ink); display: block; }
        .cols { display: grid; grid-template-columns: 1.5fr 1fr; gap: 18px; margin-top: 20px; }
        .quote { display: flex; gap: 14px; align-items: center; }
        .quote .ic { color: var(--accent); }
        .go { background: var(--accent); color: var(--accent-ink); border: 0; border-radius: 10px; padding: 10px 18px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; font-family: inherit; }
        .ghost { background: none; border: 1px solid var(--line); border-radius: 10px; padding: 10px 16px; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-block; color: inherit; font-family: inherit; }
        .ghost:hover { border-color: var(--accent); }
        #sug { position: absolute; left: 0; right: 0; top: calc(100% + 6px); z-index: 10; background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 6px; box-shadow: 0 12px 30px rgba(0,0,0,.14); }
        #sug button { display: flex; gap: 10px; align-items: center; width: 100%; text-align: left; border: 0; background: none; padding: 9px 10px; border-radius: 9px; cursor: pointer; font-family: inherit; }
        #sug button:hover, #sug button:focus-visible { background: var(--accent-soft); }
        #sug small { color: var(--muted); }
        #sug p { margin: 6px 10px; color: var(--muted); font-size: 14.5px; }
        #scrim { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 99; }
        #dr { position: fixed; right: 0; top: 0; bottom: 0; width: min(420px,100%); background: var(--surface); z-index: 100; overflow: auto; border-left: 1px solid var(--line); }
        #dr .pic { height: 150px; display: grid; place-items: center; position: relative; overflow: hidden; color: var(--c); background: color-mix(in srgb,var(--c) 14%,var(--surface)); }
        #dr .bd { padding: 20px 22px 30px; }
        #dr h2 { font-size: 26px; font-family: var(--serif); font-weight: 600; margin: 0; }
        #dr dl { margin: 16px 0; display: grid; grid-template-columns: 110px 1fr; gap: 8px 12px; }
        #dr dt { color: var(--muted); }
        #dr dd { margin: 0; }
        #dr .x { position: absolute; right: 12px; top: 12px; width: 36px; height: 36px; border-radius: 50%; border: 0; background: var(--surface); font-size: 20px; cursor: pointer; display: grid; place-items: center; }
        #toast { position: fixed; left: 50%; bottom: 20px; transform: translate(-50%, 30px); background: var(--ink); color: var(--bg); padding: 10px 18px; border-radius: 12px; opacity: 0; transition: .25s; z-index: 120; pointer-events: none; }
        #toast.on { opacity: 1; transform: translate(-50%, 0); }
        
        @media (max-width: 900px) {
          .hero, .cols, .doshas { grid-template-columns: 1fr; }
          .search { flex-wrap: wrap; }
          .search input { flex-basis: 100%; order: -1; }
          kbd { display: none; }
        }
      `}</style>

      {/* ── Main Container ── */}
      <main style={{ padding: "22px clamp(18px,4vw,48px) 56px", maxWidth: 1180, width: "100%", margin: "0 auto" }}>
        {/* Decorative Diamond Band */}
        <DiamondBand />

        {/* ── HERO ── */}
        <section className="hero">
          <div>
            <div className="hello">नमस्ते, {username}</div>
            <h1>What are you looking for today?</h1>
            <div className="sloka">
              <q lang="sa">स्वस्थस्य स्वास्थ्यरक्षणम् आतुरस्य विकारप्रशमनं च</q>
              <span>To protect the health of the healthy, and to ease the illness of the sick. Charaka Samhita, Sutrasthana 30.26</span>
            </div>

            {/* Search Box */}
            <div className="searchwrap">
              <div className="search" role="search">
                <Icon id="search" size={20} />
                <input
                  id="user-q"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                  placeholder='Try “Ashwagandha”, “General Weakness” or “Vata”'
                  aria-label="Search formulations"
                />
                <kbd>/</kbd>
                <div className="seg" role="group" aria-label="Search mode">
                  <button
                    aria-pressed={searchMode === "ai"}
                    onClick={() => setSearchMode("ai")}
                  >
                    Ask AI
                  </button>
                  <button
                    aria-pressed={searchMode === "filters"}
                    onClick={() => setSearchMode("filters")}
                  >
                    Filters
                  </button>
                </div>
              </div>

              {/* Suggestions Dropdown */}
              {searchQuery.trim().length > 0 && (
                <div id="sug">
                  {suggestions.length > 0 ? (
                    suggestions.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveDrawerItem(item);
                          setSearchQuery("");
                        }}
                      >
                        <Icon id={item.form} size={22} />
                        <span>
                          <b>{item.n}</b> <small>{item.use} · {item.d.join(", ")}</small>
                        </span>
                      </button>
                    ))
                  ) : (
                    <p>No match for “{searchQuery}”. Try an ingredient, a use or a dosha.</p>
                  )}
                </div>
              )}
            </div>

            {/* Popular Search Chips */}
            <div className="chips">
              Popular:{" "}
              {popularChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setSearchQuery(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Lotus Mandala */}
          <LotusMandala />
        </section>

        {/* ── Browse by Dosha ── */}
        <h2 className="sec">Browse by dosha</h2>
        <p className="sub">The three humours of Ayurveda. Pick one to see formulations that balance it.</p>
        <div className="doshas">
          {Object.keys(DOSHAS).map((key) => {
            const d = DOSHAS[key];
            const count = formulations.filter((f) => f.d.includes(key)).length;
            const isSelected = selectedDosha === key;
            return (
              <button
                key={key}
                className="dosha"
                style={{ "--c": d.c } as any}
                aria-pressed={isSelected}
                onClick={() => setSelectedDosha(isSelected ? null : key)}
              >
                <span className="orb">
                  <Icon id={d.ic} size={28} />
                </span>
                <span className="dev" lang="sa">{d.dev}</span>
                <b>
                  {key} <small style={{ fontWeight: 400, color: "var(--muted)" }}>· {count}</small>
                </b>
                <span className="d">{d.el}. {d.d}</span>
              </button>
            );
          })}
        </div>

        {/* ── Filter by Source ── */}
        <div className="srcs" role="group" aria-label="Filter by source">
          <span style={{ alignSelf: "center", color: "var(--muted)", fontSize: "14.5px" }}>Source:</span>
          {Object.keys(SOURCES).map((key) => {
            const [label, icon, color] = SOURCES[key];
            const count = formulations.filter((f) => f.src === key).length;
            const isSelected = selectedSource === key;
            return (
              <button
                key={key}
                className="src"
                style={{ "--c": color } as any}
                aria-pressed={isSelected}
                onClick={() => setSelectedSource(isSelected ? null : key)}
              >
                <Icon id={icon} size={18} />
                <span>{label}</span>
                <small>{count}</small>
              </button>
            );
          })}
        </div>

        {/* ── Formulations Catalog ── */}
        <div className="bar">
          <div>
            <h2 id="catalog" style={{ fontSize: 22, fontFamily: "var(--serif)", fontWeight: 600, margin: 0 }}>
              Formulations
            </h2>
            <p className="sub" style={{ margin: "2px 0 0" }}>
              Showing {filteredFormulations.length} of {formulations.length}
              {(selectedDosha || selectedSource) && (
                <> · {[selectedDosha, selectedSource && SOURCES[selectedSource][0]].filter(Boolean).join(", ")}</>
              )}
            </p>
          </div>
          {(selectedDosha || selectedSource || searchQuery) && (
            <button
              className="ghost"
              onClick={() => {
                setSelectedDosha(null);
                setSelectedSource(null);
                setSearchQuery("");
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Formulation Grid */}
        <div className="grid">
          {filteredFormulations.length > 0 ? (
            filteredFormulations.map((f, i) => {
              const srcMeta = SOURCES[f.src] || SOURCES["plant"];
              const color = srcMeta[2];
              const isSaved = savedIds.includes(f.id);

              return (
                <div
                  key={f.id || i}
                  className="fcard"
                  style={{ "--c": color } as any}
                  onClick={() => setActiveDrawerItem(f)}
                >
                  <button
                    className="save"
                    aria-pressed={isSaved}
                    aria-label={`Save ${f.n}`}
                    onClick={(e) => toggleSave(f.id, e)}
                  >
                    <Icon id="heart" size={18} />
                  </button>

                  <div className="pic">
                    <Icon id={f.form} size={44} />
                    <svg className="ic bgm" width="130" height="130" viewBox="0 0 24 24">
                      {srcMeta[1] === "leaf" && <path d="M5 19C3 10 9 3 20 4c1 11-6 17-15 15zM5 19c4-6 8-9 12-11" fill="none" stroke="currentColor" strokeWidth="1.6" />}
                      {srcMeta[1] === "hex" && <path d="M12 3l7 4v10l-7 4-7-4V7z" fill="none" stroke="currentColor" strokeWidth="1.6" />}
                      {srcMeta[1] === "gem" && <path d="M12 3l6 6-6 12-6-12zM6 9h12M12 3v18" fill="none" stroke="currentColor" strokeWidth="1.6" />}
                      {srcMeta[1] === "voice" && <path d="M4 5h16v10H9l-5 4z" fill="none" stroke="currentColor" strokeWidth="1.6" />}
                    </svg>
                  </div>

                  <div className="bd">
                    <h3>{f.n}</h3>
                    <div className="sa" lang="sa">{f.s}</div>
                    <div className="tags">
                      <span className="tag">{srcMeta[0]}</span>
                      <span className="tag">{f.use}</span>
                      {f.d.map((dosha) => (
                        <span key={dosha} className="tag">{dosha}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty" style={{ gridColumn: "1/-1" }}>
              <b>{formulations.length === 0 ? "No records cataloged yet" : "No formulations match"}</b>
              {formulations.length === 0
                ? "The curator has not added any verified formulations to the archive yet."
                : "Try a different dosha or source, or clear the filters."}
            </div>
          )}
        </div>

        {/* ── Bottom Two Columns ── */}
        <div className="cols">
          <div className="card">
            <h3>Pick up where you left off</h3>
            <div className="empty" style={{ background: savedIds.length ? "none" : undefined, padding: savedIds.length ? 0 : undefined }}>
              {savedIds.length > 0 ? (
                <div>
                  {savedIds.map((id) => {
                    const item = formulations.find((f) => f.id === id);
                    if (!item) return null;
                    return (
                      <button
                        key={id}
                        className="ghost"
                        style={{ margin: "0 6px 6px 0", fontSize: 14 }}
                        onClick={() => setActiveDrawerItem(item)}
                      >
                        {item.n}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <>
                  <b>Nothing saved yet</b>Tap the heart on any formulation to keep it here.
                </>
              )}
            </div>
          </div>

          <div className="card quote">
            <Icon id="book" size={44} className="ic" />
            <div>
              <h3 style={{ marginBottom: 4 }}>Archive at a glance</h3>
              <span style={{ color: "var(--muted)" }}>
                {recordCount || formulations.length} verified formulation{formulations.length === 1 ? "" : "s"} cataloged in the traditional archive.
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* ── Detail Drawer Modal ── */}
      {activeDrawerItem && (
        <>
          <div id="scrim" onClick={() => setActiveDrawerItem(null)} />
          <aside
            id="dr"
            role="dialog"
            aria-modal="true"
            aria-label="Formulation details"
            style={{ "--c": SOURCES[activeDrawerItem.src][2] } as any}
          >
            <div className="pic">
              <Icon id={activeDrawerItem.form} size={64} />
              <button
                className="x"
                aria-label="Close"
                onClick={() => setActiveDrawerItem(null)}
              >
                ×
              </button>
            </div>
            <div className="bd">
              <h2>{activeDrawerItem.n}</h2>
              <div lang="sa" style={{ color: "var(--muted)", fontSize: 18 }}>
                {activeDrawerItem.s}
              </div>

              <dl>
                <dt>Source type</dt>
                <dd>{SOURCES[activeDrawerItem.src][0]}</dd>
                <dt>Used for</dt>
                <dd>{activeDrawerItem.use}</dd>
                <dt>Balances</dt>
                <dd>{activeDrawerItem.d.join(", ")}</dd>
                <dt>Ingredients</dt>
                <dd>{activeDrawerItem.ing}</dd>
                <dt>Reference</dt>
                <dd>{activeDrawerItem.ref}</dd>
                <dt>Added</dt>
                <dd>{activeDrawerItem.when}</dd>
              </dl>

              <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
                <button
                  className="go"
                  onClick={() => toggleSave(activeDrawerItem.id)}
                >
                  {savedIds.includes(activeDrawerItem.id)
                    ? "Saved"
                    : "Save formulation"}
                </button>
                <button
                  className="ghost"
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      `${activeDrawerItem.n} (${activeDrawerItem.s}). ${activeDrawerItem.ref}. Folklore Diaries Archive.`
                    );
                    showToast("Citation copied");
                  }}
                >
                  Copy citation
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* ── Toast Element ── */}
      <div id="toast" className={toastMessage ? "on" : ""} role="status">
        {toastMessage}
      </div>
    </div>
  );
}
