import { Helmet } from '@dr.pogodin/react-helmet';
import { useParams, useNavigate, Navigate } from "react-router";
import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, LayoutGrid, Settings, User, LogOut, Send, Sparkles, Copy, RotateCcw, Download, Lightbulb, PenLine, Code2, BarChart2, ImagePlus, Mail, Search, ClipboardList, TrendingUp, Share2, Languages, Bot, FileText, type LucideIcon } from 'lucide-react';
import Dashboard from '@/layouts/Dashboard';
import { useSession, signOut } from '@/lib/auth/auth-client';
import { ai_apps } from 'virtual:content';
import { app_launcher } from 'virtual:content';
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
export default function AppLauncherPage() {
  const {
    slug
  } = useParams<{
    slug: string;
  }>();
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isPending
  } = useSession();
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  if (isPending) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const app = ai_apps.find(a => a.href === `/dashboard/apps/${slug}`);
  if (!app) return <Navigate to="/dashboard" replace />;
  const Icon = ICON_MAP[app.icon] || Bot;
  const userName = user?.name || user?.email?.split('@')[0] || 'there';
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  function handleSamplePrompt(text: string) {
    setPrompt(text);
  }
  async function handleGenerate() {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setOutput('');
    setApiError(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), appSlug: slug }),
      });

      // Non-streaming error (e.g. 400, 503)
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setApiError(data.message || data.error || 'Something went wrong. Please try again.');
        setIsGenerating(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setApiError('No response stream received.');
        setIsGenerating(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const json = JSON.parse(trimmed.slice(6));
            if (json.error) {
              setApiError(json.error);
              break;
            }
            if (json.token) {
              accumulated += json.token;
              setOutput(accumulated);
            }
          } catch {
            // skip malformed chunk
          }
        }
      }
    } catch (err) {
      setApiError('Network error — please check your connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  }
  async function handleCopy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return <>
      <Helmet>
        <title>{app.name} — AlternMind</title>
        <meta name="description" content={app.description} />
        <link rel="canonical" href={`https://alternmind.com/dashboard/apps/${slug}`} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <Dashboard config={{
      sidebar: {
        logo: {
          image: '/airo-assets/images/logo/horizontal/dark',
          href: '/dashboard'
        },
        navigation: {
          main: [{
            title: 'AI Apps',
            href: '/dashboard',
            icon: LayoutGrid,
            active: false
          }],
          secondary: [{
            title: 'Account',
            href: '/dashboard/account',
            icon: User
          }, {
            title: 'Settings',
            href: '/dashboard/settings',
            icon: Settings
          }]
        },
        footer: <button onClick={() => signOut()} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
      },
      header: {
        search: {
          enabled: false
        },
        notifications: {
          enabled: false
        },
        user: {
          name: userName,
          email: user?.email || '',
          initials: userInitials
        }
      },
      main: {
        maxWidth: 'full',
        padding: true
      }
    }}>
        <div className="flex flex-col gap-6 max-w-5xl mx-auto">
          {/* Back + App header */}
          <div className="flex flex-col gap-4">
            <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
              <ArrowLeft size={14} />
              {app_launcher.backLabel}
            </button>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{
              background: `${app.color}20`
            }}>
                <Icon size={28} style={{
                color: app.color
              }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">{app.name}</h1>
                  {app.badge && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{
                  background: `${app.color}20`,
                  color: app.color
                }}>
                      {app.badge}
                    </span>}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{app.description}</p>
              </div>
            </div>
          </div>

          {/* Main workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Left: prompt + sample prompts */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Sample prompts */}
              <div className="rounded-xl border border-border/60 bg-card/60 p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Lightbulb size={14} className="text-primary" />
                  <span className="text-xs font-semibold text-foreground">{app_launcher.tryLabel}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {app_launcher.samplePrompts.map(sp => <button key={sp.id} onClick={() => handleSamplePrompt(sp.text)} className="text-left text-xs text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg border border-border/40 hover:border-primary/30 hover:bg-muted/30 transition-all">
                      {sp.text}
                    </button>)}
                </div>
              </div>

              {/* Pro tip */}
              <div className="rounded-xl border p-4 flex flex-col gap-1.5" style={{
              borderColor: `${app.color}30`,
              background: `${app.color}08`
            }}>
                <span className="text-xs font-semibold" style={{
                color: app.color
              }}>
                  {app_launcher.tipLabel}
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">{app_launcher.tipText}</p>
              </div>
            </div>

            {/* Right: prompt input + output */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              {/* Prompt input */}
              <div className="rounded-xl border border-border/60 bg-card/60 overflow-hidden">
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={app_launcher.inputPlaceholder} rows={5} className="w-full px-4 pt-4 pb-2 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none" onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
              }} />
                <div className="flex items-center justify-between px-4 pb-3 pt-1 border-t border-border/40">
                  <span className="text-xs text-muted-foreground/50">
                    {prompt.length > 0 ? `${prompt.length} chars` : 'Cmd+Enter to run'}
                  </span>
                  <button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {isGenerating ? <>
                        <div className="w-3 h-3 rounded-full border border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                        <span>Generating…</span>
                      </> : <>
                        <Send size={12} />
                        <span>{app_launcher.launchLabel}</span>
                      </>}
                  </button>
                </div>
              </div>

              {/* Output area */}
              <div className="rounded-xl border border-border/60 bg-card/60 flex flex-col min-h-[220px]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <Sparkles size={13} className="text-primary" />
                    <span className="text-xs font-semibold text-foreground">Output</span>
                  </div>
                  {output && <div className="flex items-center gap-2">
                      <button onClick={handleCopy} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <Copy size={12} />
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                      <button onClick={() => {
                    setOutput('');
                    setPrompt('');
                  }} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <RotateCcw size={12} />
                        Reset
                      </button>
                      <button onClick={() => {
                    const blob = new Blob([output], {
                      type: 'text/plain'
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${app!.name.toLowerCase().replace(/\s+/g, '-')}-output.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <Download size={12} />
                        Save
                      </button>
                    </div>}
                </div>

                <div className="flex-1 p-4">
                  {isGenerating && !output ? <motion.div className="flex flex-col gap-2" initial={{
                  opacity: 0
                }} animate={{
                  opacity: 1
                }}>
                      {[80, 95, 70, 60].map((w, i) => <div key={i} className="h-3 rounded-full bg-muted/60 animate-pulse" style={{
                    width: `${w}%`,
                    animationDelay: `${i * 0.1}s`
                  }} />)}
                    </motion.div> : apiError ? <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
                      <p className="text-sm font-semibold text-destructive">Generation failed</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{apiError}</p>
                    </motion.div> : output ? <motion.pre initial={{
                  opacity: 0,
                  y: 6
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  duration: 0.3
                }} className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                      {output}
                      {isGenerating && <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />}
                    </motion.pre> : <p className="text-sm text-muted-foreground/40 italic">
                      {app_launcher.outputPlaceholder}
                    </p>}
                </div>
              </div>
            </div>
          </div>

        </div>
      </Dashboard>
    </>;
}
