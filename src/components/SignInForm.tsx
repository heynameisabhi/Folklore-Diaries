"use client";

import React, { useState } from "react";
import Link from "next/link";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/* ── Inline SVG Symbols Matching Folklore Diaries – Sign in.html ── */
function Icon({
  id,
  size = 20,
  className = "",
  style,
}: {
  id: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const paths: Record<string, React.ReactNode> = {
    lotus: (
      <>
        <path d="M12 20C8 17 7 12 12 5c5 7 4 12 0 15zM12 20C6 20 3 16 3 11c4 0 7 2 9 9zM12 20c6 0 9-4 9-9-4 0-7 2-9 9z" />
      </>
    ),
    leaf: (
      <>
        <path d="M5 19C3 10 9 3 20 4c1 11-6 17-15 15z" />
        <path d="M5 19c4-6 8-9 12-11" />
      </>
    ),
    drop: (
      <path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z" />
    ),
    flame: (
      <path d="M12 3c3 4 5 6 5 10a5 5 0 0 1-10 0c0-2 1-3 2-5 1 1 1 2 2 2 0-3 0-5 1-7z" />
    ),
    mortar: (
      <>
        <path d="M3 11h18a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8z" />
        <path d="M8 19v2h8v-2M16 3l-4.5 8" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    eyeoff: (
      <>
        <path d="M3 3l18 18M10.5 6.2A9 9 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.8M6.3 6.8A17 17 0 0 0 2 12s4 7 10 7c1.6 0 3-.4 4.2-1M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 3 3 5-6" />
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
      className={`ic ${className}`}
      style={style}
      aria-hidden="true"
    >
      {paths[id] || null}
    </svg>
  );
}

/* ── Lotus Mandala Artwork Drawing ── */
function LotusMandalaSignIn() {
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
      className="art"
      viewBox="-130 -130 260 260"
      role="img"
      aria-label="Lotus mandala with leaf, water, flame and mortar"
    >
      <circle
        r="112"
        fill="none"
        stroke="currentColor"
        strokeDasharray="2 5"
        opacity=".6"
      />
      {petalLarge}
      {petalSmall}
      {dots}
      <circle r="24" fill="var(--surface)" stroke="currentColor" />
      <svg
        x="-15"
        y="-15"
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20C8 17 7 12 12 5c5 7 4 12 0 15zM12 20C6 20 3 16 3 11c4 0 7 2 9 9zM12 20c6 0 9-4 9-9-4 0-7 2-9 9z" />
      </svg>
      {corners.map(([iconId, cx, cy]) => (
        <g key={iconId}>
          <circle cx={cx} cy={cy} r="13" fill="var(--surface)" stroke="currentColor" />
          <svg
            x={cx - 8}
            y={cy - 8}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {iconId === "leaf" && (
              <>
                <path d="M5 19C3 10 9 3 20 4c1 11-6 17-15 15z" />
                <path d="M5 19c4-6 8-9 12-11" />
              </>
            )}
            {iconId === "drop" && (
              <path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z" />
            )}
            {iconId === "flame" && (
              <path d="M12 3c3 4 5 6 5 10a5 5 0 0 1-10 0c0-2 1-3 2-5 1 1 1 2 2 2 0-3 0-5 1-7z" />
            )}
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

export function SignInForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { username: "", email: "", password: "" };
    let hasError = false;

    // Check username or email
    if (!user.username.trim() && !user.email.trim()) {
      newErrors.username = "Enter your username or email.";
      hasError = true;
    }

    if (
      user.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email.trim())
    ) {
      newErrors.email = "Enter a valid email, like name@example.com.";
      hasError = true;
    }

    if (!user.password || user.password.length < 8) {
      newErrors.password = "Your password needs at least 8 characters.";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      if (newErrors.username) document.getElementById("u")?.focus();
      else if (newErrors.email) document.getElementById("e")?.focus();
      else if (newErrors.password) document.getElementById("p")?.focus();
      return;
    }

    setErrors({ username: "", email: "", password: "" });
    setIsLoading(true);

    try {
      const response = await signIn("credentials", {
        username: user.username.trim(),
        email: user.email.trim(),
        password: user.password,
        redirect: false,
      });

      if (response?.error) {
        setIsLoading(false);
        toast.error("Login failed: " + response.error);
        setErrors((prev) => ({
          ...prev,
          password:
            response.error?.includes("password") ||
            response.error?.includes("credentials")
              ? "Invalid credentials. Please verify your details."
              : response.error || "Login failed.",
        }));
      } else {
        const currentSession = await getSession();
        setIsSuccess(true);
        setIsLoading(false);

        const isAdmin = currentSession?.user?.role?.toUpperCase() === "ADMIN";
        toast.success(
          isAdmin ? "Login successful! Welcome Admin." : "Login successful!"
        );

        setTimeout(() => {
          if (isAdmin) {
            router.push("/admin/dashboard");
          } else {
            router.push("/dashboard");
          }
        }, 900);
      }
    } catch (err: any) {
      setIsLoading(false);
      toast.error(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="signin-root">
      {/* ── Direct CSS Styles from Folklore Diaries – Sign in.html ── */}
      <style jsx global>{`
        :root {
          color-scheme: light;
          --bg: #EEF1E6;
          --surface: #FBFCF7;
          --sunk: #E3E8D8;
          --ink: #1B2A1F;
          --muted: #56655A;
          --line: #C3CCB6;
          --accent: #1F5A3D;
          --accent-ink: #fff;
          --accent-soft: #D5E6D3;
          --err: #B3261E;
          --err-soft: #F8DEDA;
          --serif: "Fraunces", Georgia, serif;
          --sans: "Hind", system-ui, -apple-system, "Segoe UI", sans-serif;
        }

        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) {
            color-scheme: dark;
            --bg: #121A15;
            --surface: #1A241D;
            --sunk: #0F1612;
            --ink: #E7EDE0;
            --muted: #A3B1A5;
            --line: #34443A;
            --accent: #7CC79A;
            --accent-ink: #0F1A13;
            --accent-soft: #234331;
            --err: #F2928A;
            --err-soft: #3C1E1B;
          }
        }

        @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Hind:wght@400;500;600&display=swap");

        .signin-root {
          min-height: 100vh;
          background: var(--bg);
          color: var(--ink);
          font: 16px/1.55 var(--sans);
        }

        .signin-root h1,
        .signin-root h2 {
          font-family: var(--serif);
          font-weight: 600;
          margin: 0;
          line-height: 1.15;
        }

        .signin-root .ic {
          fill: none;
          stroke: currentColor;
          stroke-width: 1.6;
          stroke-linecap: round;
          stroke-linejoin: round;
          flex: none;
        }

        .signin-root .wrap {
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          min-height: 100vh;
        }

        .signin-root .left {
          --surface: #16382A;
          --accent-soft: rgba(255, 255, 255, 0.07);
          --organic: #E8B84A;
          background: radial-gradient(
            120% 90% at 20% 10%,
            #2A6B4A 0%,
            #173D2B 55%,
            #0F2A1E 100%
          );
          color: #E7F1E4;
          padding: 36px clamp(24px, 5vw, 64px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 20px;
        }

        .signin-root .brand {
          display: flex;
          gap: 10px;
          align-items: center;
          font: 600 21px var(--serif);
        }

        .signin-root .brand .ic {
          color: #A9DDB9;
        }

        .signin-root .art {
          width: min(420px, 78%);
          align-self: center;
          color: #BFE3C9;
        }

        .signin-root .sloka q {
          display: block;
          font: 600 22px/1.45 var(--serif);
          quotes: none;
          max-width: 24ch;
        }

        .signin-root .sloka span {
          display: block;
          margin-top: 8px;
          color: #B7CDBB;
          font-size: 14.5px;
          max-width: 46ch;
        }

        .signin-root .right {
          display: grid;
          place-items: center;
          padding: 32px 20px;
          position: relative;
        }

        .signin-root .card {
          width: 100%;
          max-width: 420px;
        }

        .signin-root .card h1 {
          font-size: 34px;
        }

        .signin-root .card .lead {
          color: var(--muted);
          margin: 8px 0 26px;
        }

        .signin-root .field {
          margin-bottom: 16px;
        }

        .signin-root .field label {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
          font-size: 15px;
        }

        .signin-root .box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--surface);
          border: 1.5px solid var(--line);
          border-radius: 12px;
          padding: 0 12px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .signin-root .box:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }

        .signin-root .box .ic {
          color: var(--muted);
        }

        .signin-root .box input {
          flex: 1;
          min-width: 0;
          border: 0;
          background: none;
          padding: 13px 0;
          outline: 0;
          color: var(--ink);
          font: inherit;
        }

        .signin-root .box input::placeholder {
          color: var(--muted);
          opacity: 0.8;
        }

        .signin-root .field.bad .box {
          border-color: var(--err);
          box-shadow: 0 0 0 3px var(--err-soft);
        }

        .signin-root .msg {
          color: var(--err);
          font-size: 14px;
          margin: 6px 2px 0;
          min-height: 0;
        }

        .signin-root .eye {
          border: 0;
          background: none;
          padding: 6px;
          border-radius: 8px;
          color: var(--muted);
          display: grid;
          cursor: pointer;
        }

        .signin-root .eye:hover {
          color: var(--ink);
        }

        .signin-root .rowx {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 2px 0 20px;
          font-size: 15px;
          gap: 10px;
          flex-wrap: wrap;
        }

        .signin-root .rowx label {
          display: flex;
          gap: 8px;
          align-items: center;
          cursor: pointer;
        }

        .signin-root .rowx input {
          accent-color: var(--accent);
          width: 17px;
          height: 17px;
        }

        .signin-root a {
          color: var(--accent);
          font-weight: 500;
          text-decoration: none;
        }

        .signin-root a:hover {
          text-decoration: underline;
        }

        .signin-root .go {
          width: 100%;
          border: 0;
          border-radius: 12px;
          background: var(--accent);
          color: var(--accent-ink);
          font-weight: 600;
          padding: 14px;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          transition: filter 0.15s;
          font-size: 16px;
        }

        .signin-root .go:hover {
          filter: brightness(1.08);
        }

        .signin-root .go[disabled] {
          opacity: 0.75;
          cursor: progress;
        }

        .signin-root .spin {
          width: 16px;
          height: 16px;
          border: 2px solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: r 0.7s linear infinite;
          display: inline-block;
        }

        @keyframes r {
          to {
            transform: rotate(360deg);
          }
        }

        .signin-root .note {
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid var(--line);
          color: var(--muted);
          font-size: 14px;
          text-align: center;
        }

        .signin-root .ok {
          display: none;
          text-align: center;
        }

        .signin-root .ok .ic {
          color: var(--accent);
        }

        .signin-root .ok h2 {
          font-size: 28px;
          margin: 10px 0 6px;
        }

        .signin-root .ok p {
          color: var(--muted);
          margin: 0 0 18px;
        }

        .signin-root .done form {
          display: none;
        }

        .signin-root .done .ok {
          display: block;
        }

        .signin-root .done .hd {
          display: none;
        }

        .signin-root .mini {
          position: absolute;
          top: 18px;
          right: 20px;
          color: var(--muted);
          font-size: 14px;
        }

        @media (max-width: 860px) {
          .signin-root .wrap {
            grid-template-columns: 1fr;
          }
          .signin-root .left {
            padding: 20px 24px;
            flex-direction: row;
            align-items: center;
          }
          .signin-root .art,
          .signin-root .sloka {
            display: none;
          }
          .signin-root .right {
            align-items: start;
            padding-top: 28px;
          }
          .signin-root .mini {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .signin-root * {
            transition: none !important;
            animation-duration: 2s !important;
          }
        }
      `}</style>

      <div className="wrap">
        {/* ── Left Pane: About Folklore Diaries & Lotus Mandala ── */}
        <section className="left" aria-label="About Folklore Diaries">
          <div className="brand">
            <Icon id="lotus" size={34} style={{ color: "#A9DDB9" }} />
            <span>Folklore Diaries</span>
          </div>

          <LotusMandalaSignIn />

          <div className="sloka">
            <q lang="sa">स्वस्थस्य स्वास्थ्यरक्षणम् आतुरस्य विकारप्रशमनं च</q>
            <span>
              A living archive of Ayurvedic formulations and the lineages that
              carried them. Charaka Samhita, Sutrasthana 30.26
            </span>
          </div>
        </section>

        {/* ── Right Pane: Sign in Card ── */}
        <section className={`right ${isSuccess ? "done" : ""}`} id="right">
          <span className="mini">
            Need help?{" "}
            <a href="mailto:support@folklorediaries.com">Contact the curator</a>
          </span>

          <div className="card">
            <div className="hd">
              <h1>Welcome back</h1>
              <p className="lead">
                Sign in to continue to the Folklore Diaries archive.
              </p>
            </div>

            <form id="f" onSubmit={handleSubmit} noValidate>
              {/* Username field */}
              <div
                className={`field ${errors.username ? "bad" : ""}`}
                id="fu"
              >
                <label htmlFor="u">Username</label>
                <div className="box">
                  <Icon id="user" size={20} className="ic" />
                  <input
                    id="u"
                    name="username"
                    autoComplete="username"
                    placeholder="Your username"
                    value={user.username}
                    onChange={(e) => {
                      setUser({ ...user, username: e.target.value });
                      if (errors.username)
                        setErrors({ ...errors, username: "" });
                    }}
                    disabled={isLoading}
                    aria-describedby="eu"
                  />
                </div>
                <div className="msg" id="eu" role="alert">
                  {errors.username}
                </div>
              </div>

              {/* Email field */}
              <div className={`field ${errors.email ? "bad" : ""}`} id="fe">
                <label htmlFor="e">Email</label>
                <div className="box">
                  <Icon id="mail" size={20} className="ic" />
                  <input
                    id="e"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={user.email}
                    onChange={(e) => {
                      setUser({ ...user, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    disabled={isLoading}
                    aria-describedby="ee"
                  />
                </div>
                <div className="msg" id="ee" role="alert">
                  {errors.email}
                </div>
              </div>

              {/* Password field */}
              <div
                className={`field ${errors.password ? "bad" : ""}`}
                id="fp"
              >
                <label htmlFor="p">Password</label>
                <div className="box">
                  <Icon id="lock" size={20} className="ic" />
                  <input
                    id="p"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    placeholder="At least 8 characters"
                    value={user.password}
                    onChange={(e) => {
                      setUser({ ...user, password: e.target.value });
                      if (errors.password)
                        setErrors({ ...errors, password: "" });
                    }}
                    disabled={isLoading}
                    aria-describedby="ep"
                  />
                  <button
                    type="button"
                    className="eye"
                    id="t"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Icon
                      id={showPassword ? "eyeoff" : "eye"}
                      size={20}
                      className="ic"
                    />
                  </button>
                </div>
                <div className="msg" id="ep" role="alert">
                  {errors.password}
                </div>
              </div>

              {/* Row with Keep me signed in & Forgot Password */}
              <div className="rowx">
                <label>
                  <input
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                  />{" "}
                  Keep me signed in
                </label>
                <Link href="/forgot-password">Forgot password?</Link>
              </div>

              {/* Submit button */}
              <button
                className="go"
                id="b"
                type="submit"
                disabled={isLoading}
              >
                {isLoading && <i className="spin" />}
                <span id="bl">
                  {isLoading ? "Signing in…" : "Sign in"}
                </span>
              </button>
            </form>

            {/* Success state */}
            <div className="ok" id="ok" role="status">
              <Icon id="check" size={54} className="ic" />
              <h2>
                Namaste,{" "}
                <span id="nm">
                  {user.username || user.email?.split("@")[0] || "user"}
                </span>
              </h2>
              <p>Signed in. Taking you to your panel…</p>
            </div>

            <p className="note">
              By signing in, you agree to our{" "}
              <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
