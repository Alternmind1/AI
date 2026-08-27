import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from "react-router";
import { motion } from 'motion/react';
import { home } from 'virtual:content';

// ─── Neural Network SVG Component ────────────────────────────────────────────

// ─── Fade-in scroll variant ───────────────────────────────────────────────────
const fadeUp = {
  hidden: {
    opacity: 0,
    y: 28
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: 'easeOut' as const
    }
  }
} as const;
const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15
    }
  }
} as const;

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const site = 'https://alternmind.com';
  const ogImage = `${site}/airo-assets/images/pages/home/hero-neural`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [{
      '@type': 'WebSite',
      '@id': `${site}/#website`,
      name: 'AlternMind',
      url: `${site}/`
    }, {
      '@type': 'Organization',
      '@id': `${site}/#organization`,
      name: 'AlternMind',
      url: `${site}/`,
      description: 'AI-powered platform giving business professionals and teams instant access to powerful AI tools from a single intelligent dashboard.',
      logo: `${site}/airo-assets/images/logo/horizontal/dark`
    }, {
      '@type': 'SoftwareApplication',
      '@id': `${site}/#app`,
      name: 'AlternMind',
      url: `${site}/`,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      isPartOf: { '@id': `${site}/#website` },
      about: { '@id': `${site}/#organization` }
    }, {
      '@type': 'WebPage',
      '@id': `${site}/#webpage`,
      url: `${site}/`,
      name: 'AlternMind — AI Platform for Business Teams',
      isPartOf: { '@id': `${site}/#website` },
      about: { '@id': `${site}/#organization` },
      datePublished: '2026-08-14',
      dateModified: '2026-08-18'
    }]
  };
  return <>
      <Helmet>
        <title>AlternMind — AI Platform for Business Teams</title>
        <meta name="description" content="AlternMind gives your team instant access to powerful AI tools in one intelligent platform. Launch AI apps instantly, collaborate across your team, and transform how you work." />
        <link rel="canonical" href={`${site}/`} />
        <meta property="og:title" content="AlternMind — AI Platform for Business Teams" />
        <meta property="og:description" content="Launch AI tools instantly. Built for teams. One intelligent dashboard for every AI workflow." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${site}/`} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1536" />
        <meta property="og:image:height" content="900" />
        <meta property="og:site_name" content="AlternMind" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AlternMind — AI Platform for Business Teams" />
        <meta name="twitter:description" content="Launch AI tools instantly. Built for teams. One intelligent dashboard for every AI workflow." />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <main>
        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background pt-20">
          {/* Full-bleed background image */}
          <div className="absolute inset-0 pointer-events-none">
            <img src="/airo-assets/images/pages/home/hero-neural" alt="" className="w-full h-full object-cover object-center" loading="eager" fetchPriority="high" width={1536} height={900} />
            {/* Minimal overlay — image stays bright and vivid like alternmind.com */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />
          </div>

          {/* Center copy */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto gap-7 py-24">
            <motion.span initial={{
            opacity: 0,
            y: 16
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5
          }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>{home.hero.eyebrow}</span>
            </motion.span>

            <motion.h1 initial={{
            opacity: 0,
            y: 22
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.1
          }} className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-foreground">
              {home.hero.headline}
            </motion.h1>

            <motion.p initial={{
            opacity: 0,
            y: 18
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.2
          }} className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              {home.hero.subheadline}
            </motion.p>

            <motion.div initial={{
            opacity: 0,
            y: 14
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: 0.32
          }} className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link to="/register" className="inline-flex items-center px-8 py-3.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:-translate-y-0.5 ring-1 ring-primary/40 shadow-lg shadow-primary/20">
                {home.hero.ctaPrimary}
              </Link>
              <Link to="/login" className="inline-flex items-center px-8 py-3.5 rounded-full text-sm font-semibold border border-border/60 text-foreground hover:border-primary/60 hover:text-primary transition-all duration-200 backdrop-blur-sm bg-background/20">
                {home.hero.ctaSecondary}
              </Link>
            </motion.div>
          </div>

          {/* ── Marquee ticker (matches alternmind.com) ── */}
          <div className="relative z-10 w-full border-t border-border/30 bg-background/40 backdrop-blur-sm overflow-hidden py-4">
            <motion.div className="flex gap-12 whitespace-nowrap" animate={{
            x: ['0%', '-50%']
          }} transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'linear' as const
          }}>
              {Array.from({
              length: 10
            }).map((_, i) => <span key={i} className="text-sm font-semibold tracking-widest text-muted-foreground/50 uppercase select-none">
                  AlternMind
                  <span className="mx-6 text-primary/40">·</span>
                  Smart Solutions, Smarter Decisions
                  <span className="mx-6 text-primary/40">·</span>
                </span>)}
            </motion.div>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </section>

        {/* ── TRUST BAR ────────────────────────────────────────────────── */}
        <section className="bg-background border-y border-border/30 py-10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-8">
              {home.trustBar.headline}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-14">
              {home.trustBar.companies.map(co => <span key={co.id} className="text-sm font-semibold text-foreground/30 tracking-wide hover:text-foreground/50 transition-colors">
                  {co.name}
                </span>)}
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────────── */}
        <section id="features" className="bg-background py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{
            once: true,
            margin: '-80px'
          }} variants={stagger} className="mb-16">
              <motion.p variants={fadeUp} className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                {home.features.sectionLabel}
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-foreground max-w-xl leading-tight">
                {home.features.headline}
              </motion.h2>
            </motion.div>

            <div className="flex flex-col gap-16">
              {home.features.items.map((item, i) => <motion.div key={item.id} initial="hidden" whileInView="visible" viewport={{
              once: true,
              margin: '-60px'
            }} variants={fadeUp} className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  {/* Stat side */}
                  <div className={`flex flex-col gap-2 ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <div className="flex items-baseline gap-3">
                      <span className="text-6xl lg:text-7xl font-bold text-primary leading-none">
                        {item.stat}
                      </span>
                      <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        {item.statLabel}
                      </span>
                    </div>
                    <div className="h-px w-16 bg-primary/40 mt-2" />
                  </div>

                  {/* Text side */}
                  <div className={`flex flex-col gap-3 ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>)}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
        <section id="how-it-works" className="bg-card/40 border-y border-border/30 py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{
            once: true,
            margin: '-80px'
          }} variants={stagger} className="mb-16 text-center">
              <motion.p variants={fadeUp} className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                {home.howItWorks.sectionLabel}
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-foreground">
                {home.howItWorks.headline}
              </motion.h2>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{
            once: true,
            margin: '-60px'
          }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
              {/* Connecting line (desktop) */}
              <div className="hidden md:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-border/50" />

              {home.howItWorks.steps.map((step, i) => <motion.div key={step.id} variants={fadeUp} className="relative flex flex-col items-center text-center px-6 py-8">
                  {/* Step number circle */}
                  <div className="relative z-10 w-16 h-16 rounded-full border border-primary/40 bg-background flex items-center justify-center mb-6 ring-4 ring-background">
                    <span className="text-lg font-bold text-primary">{step.number}</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </motion.div>)}
            </motion.div>
          </div>
        </section>

        {/* ── CTA BAND ─────────────────────────────────────────────────── */}
        <section className="bg-background py-24 lg:py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="relative rounded-2xl border border-primary/20 bg-card/60 overflow-hidden">
              {/* Background glow */}
              <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(ellipse 60% 80% at 80% 50%, hsl(var(--primary) / 0.08) 0%, transparent 70%)'
            }} />
              {/* Dot grid */}
              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }} />

              <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center p-10 lg:p-16">
                <div className="flex flex-col gap-4">
                  <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
                    {home.cta.headline}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {home.cta.subheadline}
                  </p>
                </div>
                <div className="flex flex-col gap-4 lg:items-end">
                  <Link to="/register" className="inline-flex items-center px-8 py-3.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:-translate-y-0.5 ring-1 ring-primary/40 w-fit">
                    {home.cta.buttonLabel}
                  </Link>
                  <p className="text-xs text-muted-foreground">{home.cta.note}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>;
}
