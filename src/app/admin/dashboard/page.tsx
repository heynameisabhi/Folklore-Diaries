"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/useAuth";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

type UserActivity = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

type DashboardData = {
  users: UserActivity[];
  userActivityChart: {
    name: string;
    active: number;
    blocked: number;
  }[];
  totalDrugs?: number;
  totalDiseases?: number;
  totalContributors?: number;
  recentDrugs?: {
    id: string;
    primary_name: string | null;
    source_type: string | null;
    created_at: string | null;
  }[];
};

/* ── Inline SVG Symbols ── */
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
function LotusMandalaAdmin() {
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
      aria-label="Lotus mandala"
      style={{ width: "100%", maxWidth: 320, justifySelf: "center", color: "var(--accent)" }}
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
        <pattern id="pt-admin" width="24" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 6l6-5 6 5-6 5zM12 6l6-5 6 5-6 5z" fill="none" stroke="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="12" fill="url(#pt-admin)" />
    </svg>
  );
}

type QueueItem = {
  id: number;
  k: "draft" | "source";
  t: string;
  s: string;
  ic: string;
};

type FeedItem = {
  id: string;
  av: string;
  text: React.ReactNode;
  time: string;
};

export default function AdminDashboard() {
  useAuth(["admin"]);
  const router = useRouter();
  const { data: session, status } = useSession();

  const [queue, setQueue] = useState<QueueItem[]>([
    { id: 1, k: "draft", t: "Arjuna Kshirapaka", s: "अर्जुन क्षीरपाक", ic: "pot" },
    { id: 2, k: "draft", t: "Guduchi Satva", s: "गुडूची सत्त्व", ic: "leaf" },
    { id: 3, k: "source", t: "Brahmi Ghrita", s: "Add a citation", ic: "book" },
  ]);

  const [approvedCount, setApprovedCount] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [feed, setFeed] = useState<FeedItem[]>([
    { id: "1", av: "A", text: <>You added <b>Ashwagandha Taila</b></>, time: "Saturday, 11:20" },
    { id: "2", av: "R", text: <>Researcher saved <b>Triphala Churna</b></>, time: "Saturday, 09:05" },
    { id: "3", av: "N", text: <>New account registered</>, time: "Friday, 17:40" },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const handleQueueAction = (item: QueueItem) => {
    setQueue((prev) => prev.filter((q) => q.id !== item.id));
    if (item.k === "draft") {
      setApprovedCount((c) => c + 1);
      showToast(`Approved “${item.t}”`);
      setFeed((prev) => [
        {
          id: Date.now().toString(),
          av: "A",
          text: <>You approved <b>{item.t}</b></>,
          time: "Just now",
        },
        ...prev,
      ]);
    } else {
      showToast(`Source added to “${item.t}”`);
      setFeed((prev) => [
        {
          id: Date.now().toString(),
          av: "A",
          text: <>You updated <b>{item.t}</b></>,
          time: "Just now",
        },
        ...prev,
      ]);
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const response = await axios.get("/api/admin/dashboard");
      return response.data;
    },
    enabled: !!session,
    refetchOnWindowFocus: false,
  });

  const dashboardData: DashboardData = data || {
    users: [],
    userActivityChart: [],
  };

  const totalUsers = dashboardData.users.length || 4;
  const activeUsers = dashboardData.users.filter((user) => user.status === "ACTIVE").length || 4;
  const blockedUsers = dashboardData.users.filter((user) => user.status === "BLOCKED").length;

  const draftsCount = queue.filter((q) => q.k === "draft").length;
  const missingSourceCount = queue.filter((q) => q.k === "source").length;

  if (status === "loading" || isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "var(--muted)" }}>
        <div style={{ width: 36, height: 36, border: "2px solid var(--accent-soft)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: 16 }} />
        <p style={{ fontSize: 13, fontFamily: "var(--sans)", color: "var(--muted)" }}>Loading Curator Console…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: 24 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 32, maxWidth: 400, textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--serif)", color: "var(--warn)" }}>Failed to load metrics</h2>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8 }}>Could not fetch curator data. Please refresh.</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: 24 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 32, maxWidth: 400, textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--serif)", color: "var(--ink)" }}>Access Denied</h2>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8 }}>Administrator privileges required.</p>
        </div>
      </div>
    );
  }

  const username = session.user?.name || session.user?.email?.split("@")[0] || "admin";
  const initials = username.slice(0, 1).toUpperCase();

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
      {/* ── CSS Tokens matching Folklore Diaries – Curator panel.html exactly ── */}
      <style>{`
        :root {
          color-scheme: light;
          --accent: #8A5A00;
          --accent-ink: #fff;
          --accent-soft: #F3E3B8;
          --bg: #F3EEE0;
          --sunk: #EAE2CC;
          --line: #D9CFB3;
          --surface: #FDFBF4;
          --ink: #1B2A1F;
          --muted: #56655A;
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
        .cta { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 18px; }
        .go { background: var(--accent); color: var(--accent-ink); border: 0; border-radius: 10px; padding: 10px 18px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; font-family: inherit; font-size: 16px; }
        .go:hover { opacity: 0.9; }
        .ghost { background: none; border: 1px solid var(--line); border-radius: 10px; padding: 10px 16px; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-block; color: inherit; font-family: inherit; font-size: 16px; }
        .ghost:hover { border-color: var(--accent); }
        h2.sec { font-size: 22px; margin: 40px 0 4px; font-family: var(--serif); font-weight: 600; }
        .sub { color: var(--muted); margin: 0 0 14px; font-size: 15px; }
        .queue { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .task { background: var(--surface); border: 1px solid var(--line); border-left: 5px solid var(--warn); border-radius: 14px; padding: 14px 16px; text-align: left; }
        .task.ok { border-left-color: var(--plant); }
        .task strong { font: 600 28px/1 var(--serif); display: block; }
        .task span { color: var(--muted); font-size: 14px; }
        .card { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 18px; }
        .ql { margin-top: 12px; }
        .qrow { display: grid; grid-template-columns: 44px 1fr auto; gap: 12px; align-items: center; padding: 12px 0; border-top: 1px solid var(--line); }
        .qrow:first-child { border-top: 0; }
        .qrow .ib { width: 44px; height: 44px; border-radius: 12px; background: var(--warn-soft); color: var(--warn); display: grid; place-items: center; }
        .qrow small { display: block; color: var(--muted); }
        .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .kpi { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 14px 16px; text-decoration: none; color: inherit; display: block; transition: border-color .2s; }
        .kpi:hover { border-color: var(--accent); }
        .kpi b { font: 600 30px/1.1 var(--serif); display: block; }
        .kpi span { color: var(--muted); font-size: 14px; }
        .kpi em { font-style: normal; font-size: 13px; color: var(--plant); display: block; }
        .two { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 34px; }
        .cats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .cat { background: var(--accent-soft); border-radius: 14px; padding: 14px 8px; text-align: center; color: var(--accent); }
        .cat b { display: block; color: var(--ink); font: 600 20px var(--serif); margin-top: 4px; }
        .cat small { color: var(--muted); }
        .feed { list-style: none; margin: 0; padding: 0; }
        .feed li { display: grid; grid-template-columns: 30px 1fr; gap: 10px; padding: 10px 0; border-top: 1px solid var(--line); font-size: 15px; }
        .feed li:first-child { border-top: 0; }
        .feed .av { width: 30px; height: 30px; border-radius: 50%; background: var(--accent-soft); display: grid; place-items: center; font-size: 13px; font-weight: 600; font-family: var(--serif); }
        .feed small { color: var(--muted); display: block; font-size: 13px; }
        .empty { background: var(--sunk); border-radius: 12px; padding: 14px; color: var(--muted); font-size: 14.5px; }
        .empty b { color: var(--ink); display: block; }
        #toast { position: fixed; left: 50%; bottom: 20px; transform: translate(-50%, 30px); background: var(--ink); color: var(--bg); padding: 10px 18px; border-radius: 12px; opacity: 0; transition: .25s; z-index: 120; pointer-events: none; }
        #toast.on { opacity: 1; transform: translate(-50%, 0); }
        
        @media (max-width: 900px) {
          .hero, .two, .queue { grid-template-columns: 1fr; }
          .kpis, .cats { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      {/* ── Main Container ── */}
      <main style={{ padding: "22px clamp(18px,4vw,48px) 56px", maxWidth: 1180, width: "100%", margin: "0 auto" }}>
        
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <span className="pill">Curator panel</span>
          <div style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--muted)", fontSize: 14 }}>
            <span>{username}</span>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent-soft)", display: "grid", placeItems: "center", fontWeight: 600, fontFamily: "var(--serif)" }}>
              {initials}
            </div>
          </div>
        </div>

        {/* Decorative Diamond Band */}
        <DiamondBand />

        {/* ── HERO ── */}
        <section className="hero">
          <div>
            <div className="hello">Curator console</div>
            <h1 lang="sa">द्रव्यगुण व रसशास्त्र</h1>
            <p style={{ color: "var(--muted)", maxWidth: "50ch", margin: "10px 0 0" }}>
              Review what needs attention, then add new formulations to the archive.
            </p>
            <div className="cta">
              <Link href="/admin/dashboard/data/insert" className="go">
                + Ingest formulation
              </Link>
              <Link href="/admin/dashboard/data/insert" className="ghost">
                Bulk upload
              </Link>
              <Link href="/admin/dashboard/generate-report" className="ghost">
                Export report
              </Link>
            </div>
          </div>

          {/* Lotus Mandala */}
          <LotusMandalaAdmin />
        </section>

        {/* ── Needs your attention ── */}
        <h2 className="sec">Needs your attention</h2>
        <p className="sub">Clear these before the next archive review.</p>

        <div className="queue">
          <div className={`task ${draftsCount ? "" : "ok"}`}>
            <strong>{draftsCount}</strong>
            <b>Drafts to review</b>
            <br />
            <span>{draftsCount ? "Waiting for approval" : "All clear"}</span>
          </div>

          <div className={`task ${missingSourceCount ? "" : "ok"}`}>
            <strong>{missingSourceCount}</strong>
            <b>Missing a source</b>
            <br />
            <span>{missingSourceCount ? "Entries without a citation" : "All clear"}</span>
          </div>

          <div className={`task ${blockedUsers ? "" : "ok"}`}>
            <strong>{blockedUsers}</strong>
            <b>Blocked accounts</b>
            <br />
            <span>{blockedUsers ? `${blockedUsers} accounts blocked` : `All ${totalUsers} accounts are active`}</span>
          </div>
        </div>

        {/* Review Queue List */}
        <div className="card ql">
          {queue.length > 0 ? (
            queue.map((q) => (
              <div key={q.id} className="qrow">
                <div className="ib">
                  <Icon id={q.ic} size={22} />
                </div>
                <div>
                  <b>{q.t}</b>
                  <small>
                    {q.k === "draft" ? `${q.s} · Draft by contributor` : q.s}
                  </small>
                </div>
                <button
                  className="go"
                  style={{ padding: "8px 14px", fontSize: 14 }}
                  onClick={() => handleQueueAction(q)}
                >
                  {q.k === "draft" ? "Approve" : "Add source"}
                </button>
              </div>
            ))
          ) : (
            <div className="empty">
              <b>All clear</b>Nothing is waiting for review. New drafts will show up here.
            </div>
          )}
        </div>

        {/* ── Archive health ── */}
        <h2 className="sec">Archive health</h2>
        <div className="kpis" style={{ marginTop: 12 }}>
          <Link href="/admin/dashboard/data" className="kpi">
            <b>{(dashboardData.totalDrugs ?? 5) + approvedCount}</b>
            <span>Formulations</span>
            <em>{approvedCount ? `+${approvedCount} just now` : "+2 this week"}</em>
          </Link>

          <Link href="/admin/dashboard/data" className="kpi">
            <b>{dashboardData.totalDiseases ?? 6}</b>
            <span>Diseases mapped</span>
            <em>No change</em>
          </Link>

          <Link href="/admin/dashboard/data" className="kpi">
            <b>{dashboardData.totalContributors ?? 24}</b>
            <span>Lineage healers</span>
            <em>+3 this week</em>
          </Link>

          <Link href="/admin/dashboard/users/manage" className="kpi">
            <b>{totalUsers}</b>
            <span>System accounts</span>
            <em>{blockedUsers ? `${activeUsers} active` : "All active"}</em>
          </Link>
        </div>

        {/* ── Formulation forms & Recent activity ── */}
        <div className="two">
          <div className="card">
            <h3 style={{ margin: 0 }}>Formulation forms</h3>
            <p className="sub" style={{ marginTop: 4 }}>
              Classical preparation categories archived in the repository.
            </p>
            <div className="cats">
              <div className="cat">
                <Icon id="leaf" size={34} />
                <b lang="sa">कल्क</b>
                <small>Kalka, paste</small>
              </div>
              <div className="cat">
                <Icon id="mortar" size={34} />
                <b lang="sa">चूर्ण</b>
                <small>Churna, powder</small>
              </div>
              <div className="cat">
                <Icon id="bottle" size={34} />
                <b lang="sa">तैल</b>
                <small>Taila, oil</small>
              </div>
              <div className="cat">
                <Icon id="pot" size={34} />
                <b lang="sa">क्वाथ</b>
                <small>Kwatha, decoction</small>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ margin: 0, marginBottom: 12 }}>Recent activity</h3>
            <ul className="feed">
              {feed.map((f) => (
                <li key={f.id}>
                  <div className="av">{f.av}</div>
                  <div>
                    {f.text}
                    <small>{f.time}</small>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Curator Tools & Registered Users ── */}
        <div className="two" style={{ marginTop: 24 }}>
          {/* Curator tools */}
          <div className="card">
            <h3 style={{ margin: 0, marginBottom: 14 }}>Curator tools</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Single & Bulk Ingestion", sub: "Catalog folk medicines with merge rules", href: "/admin/dashboard/data/insert", icon: "doc" },
                { label: "Browse Full Database", sub: "Manage active drugs, diseases, and botanical records", href: "/admin/dashboard/data", icon: "book" },
                { label: "AI Search with Lineages", sub: "Query classical references with AI insights", href: "/admin/dashboard/ai-search", icon: "lotus" },
                { label: "User Access Control", sub: "Review permissions and account statuses", href: "/admin/dashboard/users/manage", icon: "users" },
              ].map((tool) => (
                <Link
                  key={tool.label}
                  href={tool.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--line)",
                    background: "var(--surface)",
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "var(--accent)" }}>
                      <Icon id={tool.icon} size={20} />
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{tool.label}</div>
                      <small style={{ color: "var(--muted)", fontSize: 12 }}>{tool.sub}</small>
                    </div>
                  </div>
                  <span style={{ color: "var(--muted)" }}>→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Registered Users */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0 }}>Registered User Accounts</h3>
              <Link
                href="/admin/dashboard/users/manage"
                style={{ fontSize: 13, color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}
              >
                Manage ({dashboardData.users.length}) →
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dashboardData.users.length > 0 ? (
                dashboardData.users.slice(0, 4).map((user) => (
                  <div
                    key={user.id}
                    onClick={() => router.push("/admin/dashboard/users/manage")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "1px solid var(--line)",
                      background: "var(--surface)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "var(--accent-soft)",
                          display: "grid",
                          placeItems: "center",
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        {(user.name || "U").slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name || "Anonymous User"}</div>
                        <small style={{ color: "var(--muted)", fontSize: 12 }}>{user.email} · {user.role}</small>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        padding: "2px 8px",
                        borderRadius: 99,
                        background: user.status === "ACTIVE" ? "var(--accent-soft)" : "var(--warn-soft)",
                        color: user.status === "ACTIVE" ? "var(--plant)" : "var(--warn)",
                        fontWeight: 600,
                      }}
                    >
                      {user.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty">
                  <b>No users registered yet</b>User registrations will show up here.
                </div>
              )}
            </div>
          </div>
        </div>

      </main>

      {/* ── Toast Element ── */}
      <div id="toast" className={toastMessage ? "on" : ""} role="status">
        {toastMessage}
      </div>
    </div>
  );
}
