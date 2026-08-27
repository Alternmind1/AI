import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import {
  Factory, Warehouse, Truck, Zap, ArrowRight, Network,
  Globe, BarChart3, ShieldCheck, RefreshCw, Plug, ChevronDown, Check,
} from 'lucide-react';
import { useSession } from '@/lib/auth/auth-client';
import { gridspace } from 'virtual:content';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe, Zap, BarChart3, ShieldCheck, RefreshCw, Plug, Factory, Warehouse, Truck, Network,
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
} as const;

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
} as const;

export default function GridSpaceLanding() {
  const { isAuthenticated, isPending } = useSession();
  const navigate = useNavigate();

  // Logged-in users go straight to the dashboard — it handles both
  // the empty "register your company" state and the populated company list.
  useEffect(() => {
    if (!isPending && isAuthenticated) {
      navigate('/gridspace/dashboard', { replace: true });
    }
  }, [isAuthenticated, isPending, navigate]);

  return (
    <>
      <Helmet>
        <title>GridSpace — Production Schedule Coordination Optimisation | AlternMind</title>
        <meta name="description" content="GridSpace connects manufacturers, warehouse providers, and transport companies into a shared network, then uses quantum-powered optimisation to coordinate production schedules across the entire chain." />
        <link rel="canonical" href="https://gridspace.alternmind.com/" />
        <meta property="og:title" content="GridSpace — Production Schedule Coordination Optimisation" />
        <meta property="og:description" content="Coordinate production schedules across manufacturers, warehouses, and carriers with hybrid quantum-classical optimisation. Cut costs, lead times, and idle capacity." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://gridspace.alternmind.com/" />
        <meta property="og:image" content="https://gridspace.alternmind.com/airo-assets/images/pages/gridspace/hero" />
        <meta property="og:image:width" content="1600" />
        <meta property="og:image:height" content="900" />
        <meta property="og:site_name" content="GridSpace by AlternMind" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="GridSpace — Production Schedule Coordination Optimisation" />
        <meta name="twitter:description" content="Coordinate production schedules across manufacturers, warehouses, and carriers with hybrid quantum-classical optimisation." />
        <meta name="twitter:image" content="https://gridspace.alternmind.com/airo-assets/images/pages/gridspace/hero" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'GridSpace',
          url: 'https://gridspace.alternmind.com/',
          description: 'Production schedule coordination and quantum-powered optimisation platform connecting manufacturers, warehouse providers, and transport companies.',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          isPartOf: { '@id': 'https://alternmind.com/#organization' },
        })}</script>
      </Helmet>

      <main className="bg-background text-foreground overflow-x-hidden">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
          <img
            src="/airo-assets/images/pages/gridspace/hero"
            alt=""
            aria-hidden="true"
            width={1600}
            height={900}
            // @ts-expect-error fetchpriority is valid HTML but not yet in React types
            fetchpriority="high"
            loading="eager"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/55 to-background pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40 pointer-events-none" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-primary/10 blur-[140px] pointer-events-none" />

          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-28 pb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' as const }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-semibold tracking-wide mb-8"
            >
              <Network className="w-3.5 h-3.5" />
              <span>{gridspace.hero.badge}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' as const }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-6"
            >
              <span className="text-foreground">{gridspace.hero.headline.split(' ').slice(0, 3).join(' ')}</span>
              <br />
              <span className="text-primary">{gridspace.hero.headline.split(' ').slice(3).join(' ')}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.25, ease: 'easeOut' as const }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              {gridspace.hero.subheadline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.38, ease: 'easeOut' as const }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Link
                to={isAuthenticated ? '/gridspace/dashboard' : '/login?redirect=/gridspace/dashboard'}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:bg-primary/90 transition-all"
              >
                {isAuthenticated ? 'Open Dashboard' : gridspace.hero.ctaPrimary}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-8 py-4 border border-border rounded-xl font-semibold text-base hover:bg-muted/50 hover:border-primary/40 transition-all"
              >
                {gridspace.hero.ctaSecondary}
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' as const }}
              className="grid grid-cols-3 gap-6 max-w-lg mx-auto"
            >
              {[
                { value: gridspace.hero.stat1Value, label: gridspace.hero.stat1Label },
                { value: gridspace.hero.stat2Value, label: gridspace.hero.stat2Label },
                { value: gridspace.hero.stat3Value, label: gridspace.hero.stat3Label },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl md:text-4xl font-black text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-tight">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground"
            aria-hidden="true"
          >
            <span className="text-xs tracking-widest uppercase">Scroll</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' as const }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </section>

        {/* ── VALUE PROP ───────────────────────────────────────────────────── */}
        <section className="py-24 border-t border-border">
          <div className="max-w-5xl mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div>
                <motion.p variants={fadeUp} className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
                  {gridspace.valueProp.eyebrow}
                </motion.p>
                <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-black tracking-tight mb-5 leading-tight">
                  {gridspace.valueProp.headline}
                </motion.h2>
                <motion.p variants={fadeUp} className="text-muted-foreground leading-relaxed mb-8">
                  {gridspace.valueProp.body}
                </motion.p>
                <motion.div variants={stagger} className="flex flex-col gap-4">
                  {gridspace.valueProp.points.map((pt) => (
                    <motion.div key={pt.id} variants={fadeUp} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-0.5">{pt.title}</p>
                        <p className="text-muted-foreground text-sm leading-relaxed">{pt.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Animated diagram */}
              <motion.div variants={fadeUp} className="relative">
                <div className="rounded-2xl border border-border bg-card p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                  <div className="relative flex flex-col gap-3">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { icon: Factory, label: 'Manufacturer' },
                        { icon: Warehouse, label: 'Warehouse' },
                        { icon: Truck, label: 'Transport' },
                      ].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-background/60">
                          <Icon className="w-5 h-5 text-primary" />
                          <span className="text-xs font-medium text-center leading-tight">{label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-px h-4 bg-border" />
                        <div className="w-px h-4 bg-primary/60" />
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/40 bg-primary/5">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Quantum Optimiser</p>
                        <p className="text-xs text-muted-foreground">Evaluating 2.4M combinations…</p>
                      </div>
                      <div className="ml-auto flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-primary"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2, ease: 'easeInOut' as const }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-px h-4 bg-primary/60" />
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div className="w-px h-4 bg-border" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background/60">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Optimal Schedule</p>
                        <p className="text-xs text-muted-foreground">Cost ↓ 38% · Lead time ↓ 2 days</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section id="how-it-works" className="relative py-24 border-t border-border bg-muted/20">
          <div className="max-w-5xl mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.p variants={fadeUp} className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
                {gridspace.howItWorks.eyebrow}
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-black tracking-tight">
                {gridspace.howItWorks.headline}
              </motion.h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
            >
              <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-primary/20 via-primary/60 to-primary/20 pointer-events-none" />
              {gridspace.howItWorks.steps.map((step) => (
                <motion.div key={step.id} variants={fadeUp} className="relative flex flex-col items-center text-center">
                  <div className="relative w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-6">
                    <span className="text-2xl font-black text-primary">{step.number}</span>
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── PARTICIPANTS ─────────────────────────────────────────────────── */}
        <section className="py-24 border-t border-border">
          <div className="max-w-5xl mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-6"
            >
              <motion.p variants={fadeUp} className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
                {gridspace.participants.eyebrow}
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-black tracking-tight mb-4">
                {gridspace.participants.headline}
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground max-w-xl mx-auto">
                {gridspace.participants.intro}
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
            >
              {gridspace.participants.items.map((p) => (
                <motion.div
                  key={p.id}
                  variants={fadeUp}
                  className="group relative rounded-2xl border border-border bg-card p-7 hover:border-primary/50 transition-all overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                    {p.type === 'manufacturer' && <Factory className="w-6 h-6 text-primary" />}
                    {p.type === 'warehouse' && <Warehouse className="w-6 h-6 text-primary" />}
                    {p.type === 'transport' && <Truck className="w-6 h-6 text-primary" />}
                  </div>
                  <h3 className="text-xl font-bold mb-1">{p.label}</h3>
                  <p className="text-primary text-sm font-semibold mb-3">{p.tagline}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{p.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── FEATURES GRID ────────────────────────────────────────────────── */}
        <section className="py-24 border-t border-border bg-muted/20">
          <div className="max-w-5xl mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.p variants={fadeUp} className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
                {gridspace.features.eyebrow}
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-black tracking-tight">
                {gridspace.features.headline}
              </motion.h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {gridspace.features.items.map((f) => {
                const Icon = iconMap[f.icon] || Zap;
                return (
                  <motion.div
                    key={f.id}
                    variants={fadeUp}
                    className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1.5">{f.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
        <section className="relative py-32 border-t border-border overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="relative max-w-3xl mx-auto px-6 text-center"
          >
            <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-black tracking-tight mb-5 leading-tight">
              {gridspace.cta.headline}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground mb-10 leading-relaxed">
              {gridspace.cta.subheadline}
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={isAuthenticated ? '/gridspace/dashboard' : '/login?redirect=/gridspace/dashboard'}
                className="group inline-flex items-center gap-2 px-10 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:bg-primary/90 transition-all"
              >
                {isAuthenticated ? gridspace.cta.ctaSecondary : gridspace.cta.ctaPrimary}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-10 py-4 border border-border rounded-xl font-semibold text-base hover:bg-muted/50 hover:border-primary/40 transition-all"
                >
                  Sign in
                </Link>
              )}
            </motion.div>
          </motion.div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer className="border-t border-border py-8">
          <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Network className="w-4 h-4 text-primary" />
              <span>Grid<span className="text-primary">Space</span></span>
              <span className="font-normal text-muted-foreground ml-1">by AlternMind</span>
            </div>
            <nav aria-label="GridSpace footer links" className="flex items-center gap-6">
              <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
              <Link to="/register" className="hover:text-foreground transition-colors">Join free</Link>
              <Link to="/login" className="hover:text-foreground transition-colors">Sign in</Link>
            </nav>
          </div>
        </footer>

      </main>
    </>
  );
}
