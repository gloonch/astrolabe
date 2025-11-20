import React from 'react';

const Hero = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-[#05050a] via-[#0a0a0f] to-[#0f0f15] text-slate-50 overflow-hidden"
    >
      {/* vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#0f172a_0,#020617_55%,#000_100%)] opacity-70" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 w-full">
        <div className="grid md:grid-cols-[1.4fr,1fr] gap-10 md:gap-16 items-center">
          {/* Lamp scene */}
          <div className="relative h-[420px] sm:h-[480px]">
            {/* floor / tatami hint */}
            <div className="absolute inset-x-0 bottom-0 h-40">
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0b0b0f] via-[#111117] to-transparent" />
              <div className="absolute inset-x-0 bottom-10 h-px bg-white/15" />
              <div className="absolute inset-x-0 bottom-4 h-px bg-white/10" />
            </div>

            {/* light cone */}
            <div className="pointer-events-none absolute left-20 sm:left-28 bottom-28 w-64 h-64 rounded-[100%] bg-[radial-gradient(circle_at_top,#f8f8f8_0,#cfcfcf_18%,rgba(5,5,10,0)_70%)] opacity-60 blur-[1px]" />

            {/* glassmorphism panel in light */}
            <div className="absolute left-16 sm:left-24 bottom-16 w-[260px] sm:w-[300px]">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl px-5 py-4 shadow-[0_0_80px_rgba(255,255,255,0.25)]">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-200/80 mb-1 font-pixel">
                  Bamboo Design
                </p>
                <p className="text-lg sm:text-xl font-semibold text-slate-50 mb-1">
                  Quiet brands. Deep stories.
                </p>
                <p className="text-xs sm:text-sm text-slate-200/80">
                  A small design studio for small & growing businesses.
                </p>
              </div>
            </div>

            {/* lamp base */}
            <div className="absolute left-24 sm:left-32 bottom-10">
              <div className="w-24 h-3 rounded-full bg-slate-800 shadow-[0_8px_18px_rgba(0,0,0,0.7)]" />
            </div>

            {/* lamp pole + arm + head */}
            <div className="absolute left-32 sm:left-40 bottom-12">
              <div className="w-[4px] h-32 bg-white/70 rounded-full translate-x-6" />
              <div className="w-24 h-[3px] bg-white/70 rounded-full origin-left rotate-[-20deg] translate-x-7 -translate-y-24" />
              <div className="w-14 h-10 bg-gradient-to-br from-white/90 via-white/70 to-white/30 rounded-b-full rounded-t-[28px] origin-left -rotate-12 translate-x-28 -translate-y-32 shadow-[0_10px_20px_rgba(0,0,0,0.6)]">
                <div className="w-full h-full bg-[radial-gradient(circle_at_top,#ffffff_0,#e5e5e5_40%,transparent_70%)] opacity-80 rounded-b-full rounded-t-[28px]" />
              </div>
            </div>
          </div>

          {/* Right side text */}
          <div className="space-y-5 max-w-md">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-300/80 font-pixel">
              Design studio
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-50">
              A night room. <br />
              One lamp. One story.
            </h1>
            <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed">
              Bamboo Design helps small and growing businesses build calm, minimal visual worlds with one clear story in
              the middle — through brand identity, web design, and video.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-white text-slate-900 text-sm font-medium hover:bg-slate-200 transition"
              >
                Start a project
              </a>
              <a
                href="#services"
                className="text-sm text-slate-200/90 underline underline-offset-4 hover:text-slate-50"
              >
                See services
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
