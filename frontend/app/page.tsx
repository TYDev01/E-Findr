import { ArrowUpRight, Clock, MapPin, ScanFace, Star } from "lucide-react";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";

function AvatarStack() {
  const colors = ["bg-zinc-300", "bg-zinc-400", "bg-stone-300"];
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {colors.map((c, i) => (
          <div key={i} className={`h-7 w-7 rounded-full border-2 border-white/30 ${c} ${i > 0 ? "-ml-2" : ""}`} />
        ))}
      </div>
      <span className="text-xs font-bold text-white/70">+847</span>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      <SiteHeader />

      {/* ── Hero ── */}
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-14 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">

          {/* Left */}
          <div>
            {/* Stars badge */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                <Star className="h-4 w-4 fill-gold text-gold" />
              </div>
              <span className="text-sm font-bold text-ink">5 Stars</span>
              <Link href="#" className="text-sm text-ink/50 underline underline-offset-2 hover:text-ink">
                Read Our Success Stories
              </Link>
            </div>

            <h1 className="mt-6 max-w-xl font-[family-name:var(--font-zen-dots)] text-[52px] font-normal leading-[1.1] tracking-[-0.01em] text-ink lg:text-[68px]">
              Host Lovely Events
            </h1>

            <p className="mt-5 max-w-md text-base leading-7 text-ink/55">
              Upload event galleries. Share one private link.
              Attendees find their photos with a single selfie.
            </p>

            <div className="mt-8 flex items-center gap-5">
              <Link
                href="/register"
                className="rounded-full bg-gold px-6 py-3 text-sm font-bold text-ink hover:bg-gold/90 transition-colors"
              >
                Get Started — It's Free
              </Link>
              <Link href="/#how-it-works" className="flex items-center gap-1 text-sm font-bold text-ink/70 hover:text-ink transition-colors">
                Watch Demo <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right — photo with overlaid cards */}
          <div className="relative h-[460px] sm:h-[520px]">
            {/* Animated particles */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <svg width="100%" height="100%" viewBox="0 0 600 520" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="ev-lens" cx="38%" cy="32%" r="70%">
                    <stop offset="0%" stopColor="#3a3a3a"/>
                    <stop offset="55%" stopColor="#1a1a1a"/>
                    <stop offset="100%" stopColor="#080808"/>
                  </radialGradient>
                  <radialGradient id="ev-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#F5C430" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#F5C430" stopOpacity="0"/>
                  </radialGradient>
                </defs>

                {/* Soft glow behind camera */}
                <ellipse cx="300" cy="270" rx="150" ry="130" fill="url(#ev-glow)">
                  <animate attributeName="rx" values="150;172;150" dur="5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
                  <animate attributeName="ry" values="130;148;130" dur="5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
                </ellipse>

                {/* ── CAMERA BODY ── */}
                <rect x="172" y="195" width="256" height="155" rx="20" fill="#111111"/>
                <rect x="172" y="195" width="256" height="26" rx="20" fill="white" fillOpacity="0.05"/>
                <rect x="247" y="177" width="68" height="21" rx="7" fill="#1c1c1c"/>
                <rect x="251" y="181" width="60" height="13" rx="4" fill="#222222"/>
                <rect x="181" y="178" width="34" height="16" rx="5" fill="#F5C430">
                  <animate attributeName="fillOpacity" values="1;0.2;1;1;1;0.2;1" dur="5s" repeatCount="indefinite"/>
                </rect>
                <circle cx="394" cy="207" r="14" fill="#F5C430"/>
                <circle cx="394" cy="207" r="10" fill="#e6b828"/>
                <circle cx="391" cy="204" r="3" fill="#F5C430" fillOpacity="0.7"/>
                <rect x="160" y="213" width="13" height="18" rx="4" fill="#1c1c1c"/>
                <rect x="427" y="213" width="13" height="18" rx="4" fill="#1c1c1c"/>

                {/* ── LENS ── */}
                <circle cx="300" cy="272" r="61" fill="none" stroke="#F5C430" strokeWidth="2" strokeDasharray="8 5" strokeOpacity="0.65">
                  <animateTransform attributeName="transform" type="rotate" from="0 300 272" to="360 300 272" dur="14s" repeatCount="indefinite"/>
                </circle>
                <circle cx="300" cy="272" r="56" fill="#1e1e1e" stroke="#282828" strokeWidth="3"/>
                <circle cx="300" cy="272" r="49" fill="url(#ev-lens)"/>
                <circle cx="300" cy="272" r="37" fill="none" stroke="#2a2a2a" strokeWidth="1.5"/>
                <circle cx="300" cy="272" r="36" fill="#090909"/>
                <ellipse cx="285" cy="256" rx="14" ry="10" fill="white" fillOpacity="0.13"/>
                <ellipse cx="280" cy="252" rx="5" ry="4" fill="white" fillOpacity="0.22"/>
                <circle cx="318" cy="288" r="4" fill="white" fillOpacity="0.05"/>
                <circle cx="300" cy="211" r="2.5" fill="#F5C430" fillOpacity="0.55"/>
                <circle cx="361" cy="272" r="2.5" fill="#F5C430" fillOpacity="0.55"/>
                <circle cx="300" cy="333" r="2.5" fill="#F5C430" fillOpacity="0.55"/>
                <circle cx="239" cy="272" r="2.5" fill="#F5C430" fillOpacity="0.55"/>
                <circle cx="300" cy="272" r="63" fill="none" stroke="#F5C430" strokeWidth="1.5" strokeOpacity="0.55">
                  <animate attributeName="r" values="63;83;63" dur="2.8s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
                  <animate attributeName="strokeOpacity" values="0.55;0;0.55" dur="2.8s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
                </circle>
                <circle cx="300" cy="272" r="63" fill="none" stroke="#F5C430" strokeWidth="1" strokeOpacity="0.3">
                  <animate attributeName="r" values="63;96;63" dur="2.8s" repeatCount="indefinite" begin="0.4s" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
                  <animate attributeName="strokeOpacity" values="0.3;0;0.3" dur="2.8s" repeatCount="indefinite" begin="0.4s" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
                </circle>

                {/* ── CONFETTI ── */}
                <rect x="70" y="88" width="18" height="8" rx="2" fill="#F5C430" transform="rotate(-28 79 92)">
                  <animate attributeName="y" values="88;77;88" dur="4.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
                </rect>
                <circle cx="148" cy="68" r="7" fill="#9cd7cb">
                  <animate attributeName="cy" values="68;56;68" dur="5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
                </circle>
                <rect x="208" y="52" width="14" height="6" rx="2" fill="#d86f45" transform="rotate(18 215 55)">
                  <animate attributeName="y" values="52;41;52" dur="3.8s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
                </rect>
                <rect x="348" y="44" width="16" height="7" rx="2" fill="#2f6b4f" transform="rotate(-12 356 48)">
                  <animate attributeName="y" values="44;32;44" dur="4.2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
                </rect>
                <rect x="455" y="108" width="18" height="7" rx="2" fill="#F5C430" transform="rotate(22 464 112)">
                  <animate attributeName="y" values="108;97;108" dur="4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
                </rect>
                <rect x="540" y="158" width="14" height="6" rx="2" fill="#9cd7cb" transform="rotate(-18 547 161)">
                  <animate attributeName="y" values="158;147;158" dur="5.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
                </rect>
                <circle cx="552" cy="255" r="7" fill="#d86f45">
                  <animate attributeName="cy" values="255;242;255" dur="4.8s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
                </circle>
                <rect x="548" y="358" width="16" height="7" rx="2" fill="#F5C430" transform="rotate(35 556 362)">
                  <animate attributeName="y" values="358;346;358" dur="4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
                </rect>
                <rect x="488" y="422" width="14" height="6" rx="2" fill="#9cd7cb" transform="rotate(-22 495 425)">
                  <animate attributeName="y" values="422;410;422" dur="5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
                </rect>
                <circle cx="345" cy="458" r="6" fill="#2f6b4f">
                  <animate attributeName="cy" values="458;446;458" dur="4.3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
                </circle>
                <rect x="278" y="474" width="16" height="7" rx="2" fill="#d86f45" transform="rotate(12 286 478)">
                  <animate attributeName="y" values="474;462;474" dur="3.7s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
                </rect>
                <rect x="55" y="312" width="14" height="6" rx="2" fill="#9cd7cb" transform="rotate(-20 62 315)">
                  <animate attributeName="y" values="312;300;312" dur="4.7s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
                </rect>
                <circle cx="230" cy="148" r="5" fill="#F5C430" fillOpacity="0.8">
                  <animate attributeName="cy" values="148;136;148" dur="4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
                </circle>
                <rect x="108" y="150" width="12" height="5" rx="2" fill="#2f6b4f" transform="rotate(25 114 153)">
                  <animate attributeName="y" values="150;139;150" dur="5.2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
                </rect>
                <circle cx="505" cy="188" r="5" fill="#d86f45">
                  <animate attributeName="cy" values="188;176;188" dur="4.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
                </circle>

                {/* ── SPARKLES (4-pointed stars) ── */}
                <g transform="translate(115,85)">
                  <path d="M0,-7 L1.5,-1.5 L7,0 L1.5,1.5 L0,7 L-1.5,1.5 L-7,0 L-1.5,-1.5 Z" fill="#F5C430">
                    <animate attributeName="opacity" values="0.9;0.15;0.9" dur="3s" repeatCount="indefinite"/>
                    <animateTransform attributeName="transform" type="scale" values="1;0.6;1" dur="3s" repeatCount="indefinite" additive="sum"/>
                  </path>
                </g>
                <g transform="translate(395,112)">
                  <path d="M0,-6 L1.2,-1.2 L6,0 L1.2,1.2 L0,6 L-1.2,1.2 L-6,0 L-1.2,-1.2 Z" fill="#9cd7cb">
                    <animate attributeName="opacity" values="0.8;0.1;0.8" dur="3.5s" repeatCount="indefinite" begin="1s"/>
                    <animateTransform attributeName="transform" type="scale" values="1;0.55;1" dur="3.5s" repeatCount="indefinite" begin="1s" additive="sum"/>
                  </path>
                </g>
                <g transform="translate(565,300)">
                  <path d="M0,-7 L1.5,-1.5 L7,0 L1.5,1.5 L0,7 L-1.5,1.5 L-7,0 L-1.5,-1.5 Z" fill="#F5C430">
                    <animate attributeName="opacity" values="0.85;0.1;0.85" dur="4s" repeatCount="indefinite" begin="2s"/>
                    <animateTransform attributeName="transform" type="scale" values="1;0.5;1" dur="4s" repeatCount="indefinite" begin="2s" additive="sum"/>
                  </path>
                </g>
                <g transform="translate(55,205)">
                  <path d="M0,-6 L1.2,-1.2 L6,0 L1.2,1.2 L0,6 L-1.2,1.2 L-6,0 L-1.2,-1.2 Z" fill="#d86f45">
                    <animate attributeName="opacity" values="0.75;0.1;0.75" dur="3.8s" repeatCount="indefinite" begin="0.5s"/>
                    <animateTransform attributeName="transform" type="scale" values="1;0.6;1" dur="3.8s" repeatCount="indefinite" begin="0.5s" additive="sum"/>
                  </path>
                </g>
                <g transform="translate(435,405)">
                  <path d="M0,-6 L1.2,-1.2 L6,0 L1.2,1.2 L0,6 L-1.2,1.2 L-6,0 L-1.2,-1.2 Z" fill="#2f6b4f">
                    <animate attributeName="opacity" values="0.7;0.1;0.7" dur="4.5s" repeatCount="indefinite" begin="1.5s"/>
                    <animateTransform attributeName="transform" type="scale" values="1;0.55;1" dur="4.5s" repeatCount="indefinite" begin="1.5s" additive="sum"/>
                  </path>
                </g>
              </svg>
            </div>

            {/* Event card 1 — bottom left */}
            <div className="absolute bottom-7 left-7 w-[220px] rounded-xl border border-ink/10 bg-ink/85 p-5 shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-white">
                  Online
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-white/60">
                  VIP
                </span>
              </div>
              <p className="mt-3 text-[17px] font-black leading-tight text-white">Team Party</p>
              <AvatarStack />
              <p className="mt-2 text-xs text-white/55">Invited Only · Private</p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-white/50">
                <Clock className="h-3 w-3" />
                <span>4:00 PM &nbsp;~&nbsp; 1 Hr 45 Mins</span>
              </div>
            </div>

            {/* Event card 2 — top right */}
            <div className="absolute right-7 top-7 min-w-[170px] rounded-xl bg-white px-4 py-3.5 shadow-xl">
              <div className="flex items-center gap-1.5 text-[11px] text-ink/45">
                <MapPin className="h-3 w-3" />
                <span>Las Vegas</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <p className="text-sm font-black text-ink">
                  Park Avenue{" "}
                  <span className="text-fern">✓</span>
                </p>
                <span className="flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[11px] font-bold text-ink">
                  ★ 5.0
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Get Updates Live — 3-column strip ── */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid gap-8 border-t border-black/[0.08] pt-12 lg:grid-cols-3">

          {/* Col 1 — headline */}
          <div>
            <h2 className="font-[family-name:var(--font-zen-dots)] text-[32px] font-normal leading-[1.2] text-ink">
              Get Updates<br />Live
            </h2>
          </div>

          {/* Col 2 */}
          <div className="border-t border-black/[0.08] pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="text-xs font-bold uppercase tracking-widest text-ink/35">Newsletter</p>
            <h3 className="mt-3 text-2xl font-black text-ink">Send Newsletters</h3>
            <p className="mt-2 text-sm leading-6 text-ink/55">
              Best Payment Gateway To Go Live Instantly.
            </p>
          </div>

          {/* Col 3 */}
          <div className="border-t border-black/[0.08] pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="text-xs font-bold uppercase tracking-widest text-ink/35">Feedback</p>
            <h3 className="mt-3 text-2xl font-black text-ink">Get Feedback</h3>
            <p className="mt-2 text-sm leading-6 text-ink/55">
              Best Payment Gateway To Go Live Instantly.
            </p>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="font-[family-name:var(--font-zen-dots)] text-3xl font-normal text-ink">
            Built for event scale.
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-ink/55">
            Wedding planners, conference hosts, photographers, and schools can handle large galleries without asking guests to scroll through thousands of files.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: <ScanFace className="h-5 w-5" />, title: "AI Face Indexing", body: "InsightFace extracts embeddings from every photo and stores them event-scoped in pgvector." },
            { icon: <span className="text-base font-black">QR</span>, title: "QR Share Links", body: "Generate a branded QR code per event and hand it to attendees at the door." },
            { icon: <span className="text-base font-black">🔒</span>, title: "Access Codes", body: "Protect private galleries with an optional entry code before selfie upload." },
            { icon: <span className="text-base font-black">⚡</span>, title: "Instant Results", body: "Face search returns signed image URLs ranked by cosine similarity in under a second." }
          ].map(({ icon, title, body }) => (
            <div key={title} className="rounded-xl border border-black/[0.07] bg-white p-6 shadow-panel">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 text-ink">
                {icon}
              </div>
              <h3 className="mt-5 text-lg font-black text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/55">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Privacy ── */}
      <section id="privacy" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-ink p-10 sm:p-14">
          <p className="text-xs font-bold uppercase tracking-widest text-white/35">Privacy-first design</p>
          <h2 className="mt-4 max-w-lg font-[family-name:var(--font-zen-dots)] text-3xl font-normal leading-snug text-white">
            Face search that stays inside the event boundary.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Selfies are used only for the search and deleted after processing.",
              "Embeddings are event-scoped — no cross-gallery lookups.",
              "Organizers can delete events and photos without contacting support.",
              "Signed asset URLs prevent raw storage keys from leaking publicly."
            ].map((text) => (
              <div key={text} className="rounded-xl border border-white/10 bg-white/6 p-5 text-sm leading-6 text-white/65">
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
