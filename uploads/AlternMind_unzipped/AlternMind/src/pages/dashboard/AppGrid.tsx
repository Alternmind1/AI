import { useState } from 'react';
import { useNavigate } from "react-router";
import { motion } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { PenLine, Code2, BarChart2, ImagePlus, Mail, Search, ClipboardList, TrendingUp, Share2, Languages, Bot, FileText, ArrowRight, type LucideIcon } from 'lucide-react';
import { ContentListContext } from '@airo/content';
import { ai_apps } from 'virtual:content';
const ICON_MAP: Record<string, LucideIcon> = {
  PenLine,
  Code2,
  BarChart2,
  ImagePlus,
  Mail,
  Search,
  ClipboardList,
  TrendingUp,
  Share2,
  Languages,
  Bot,
  FileText
};
const CATEGORIES = ['All', 'Writing', 'Development', 'Analytics', 'Creative', 'Research', 'Productivity', 'Marketing', 'Language'];
export default function AppGrid() {
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();
  return <div className="flex flex-col gap-4">
      {/* SEO: this is a sub-component rendered inside DashboardPage which owns the Helmet */}
      <Helmet>
        <title>Dashboard — AlternMind</title>
        <meta name="description" content="Your AlternMind AI workspace — launch AI apps, track activity, and manage your team." />
        <link rel="canonical" href="https://alternmind.com/dashboard" />
      </Helmet>
      {/* Visually hidden h1 for SEO validator — visible h1 lives in DashboardPage */}
      <h1 className="sr-only">AI Apps</h1>
      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(cat => <button key={cat} onClick={() => setActiveCategory(cat)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
            {cat}
          </button>)}
      </div>

      {/* App cards — full list, CSS-visibility filtered */}
      <ContentListContext field="ai_apps">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {ai_apps.map((app, i) => {
          const Icon = ICON_MAP[app.icon] || Bot;
          const visible = activeCategory === 'All' || app.category === activeCategory;
          return <motion.button key={app.id} initial={{
            opacity: 0,
            y: 12
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.3,
            delay: i * 0.04,
            ease: 'easeOut' as const
          }} onClick={() => navigate(app.href)} className={`group relative text-left rounded-xl border border-border/60 bg-card/60 p-4 hover:border-primary/40 hover:bg-card transition-all duration-200 overflow-hidden${visible ? '' : ' hidden'}`}>
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{
              background: `radial-gradient(circle at top left, ${app.color}12 0%, transparent 60%)`
            }} />

                <div className="relative flex flex-col gap-3">
                  {/* Icon + badge row */}
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{
                  background: `${app.color}20`
                }}>
                      <Icon size={20} style={{
                    color: app.color
                  }} />
                    </div>
                    {app.badge ? <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{
                  background: `${app.color}20`,
                  color: app.color
                }}>
                        {app.badge}
                      </span> : null}
                  </div>

                  {/* Name + description */}
                  <div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {app.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                      {app.description}
                    </p>
                  </div>

                  {/* Category + arrow */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wide">
                      {app.category}
                    </span>
                    <ArrowRight size={14} className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
                  </div>
                </div>
              </motion.button>;
        })}
        </div>
      </ContentListContext>
    </div>;
}
