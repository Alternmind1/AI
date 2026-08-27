import { Helmet } from '@dr.pogodin/react-helmet';
import { useLocation, Navigate } from "react-router";
import { LayoutGrid, Settings, User, LogOut, Zap, Clock, CheckCircle2, Users, ChevronRight, Bell, Network } from 'lucide-react';
import Dashboard from '@/layouts/Dashboard';
import { useSession, signOut } from '@/lib/auth/auth-client';
import AppGrid from './AppGrid';
import { dashboard } from 'virtual:content';
export default function DashboardPage() {
  const {
    user,
    isAuthenticated,
    isPending
  } = useSession();
  const {
    pathname
  } = useLocation();
  if (isPending) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  const userName = user?.name || user?.email?.split('@')[0] || 'there';
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const statIcons = [Zap, CheckCircle2, Clock, Users];
  return <>
      <Helmet>
        <title>Dashboard — AlternMind</title>
        <meta name="description" content="Your AlternMind AI workspace — launch AI apps, track activity, and manage your team." />
        <link rel="canonical" href="https://alternmind.com/dashboard" />
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
            active: pathname === '/dashboard'
          }, {
            title: 'GridSpace',
            href: '/gridspace/dashboard',
            icon: Network,
            active: pathname.startsWith('/gridspace')
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
          enabled: true,
          placeholder: 'Search AI apps…'
        },
        notifications: {
          enabled: true,
          count: 2
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
        <div className="flex flex-col gap-8">
          {/* Page header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {timeGreeting}, {userName.split(' ')[0]}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">{dashboard.subtitle}</p>
            </div>
            <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
              <Bell size={14} />
              <span>2 updates</span>
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboard.stats.map((stat, i) => {
            const Icon = statIcons[i % statIcons.length];
            return <div key={stat.id} className="rounded-xl border border-border/60 bg-card/60 p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {stat.label}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon size={15} className="text-primary" />
                    </div>
                  </div>
                  <div>
                    <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.change}</p>
                  </div>
                </div>;
          })}
          </div>

          {/* Main content: app grid + activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI App Grid — takes 2/3 */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">Your AI Apps</h2>
                <span className="text-xs text-muted-foreground">12 apps</span>
              </div>
              <AppGrid />
            </div>

            {/* Recent Activity — takes 1/3 */}
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-foreground">Recent Activity</h2>
              <div className="rounded-xl border border-border/60 bg-card/60 divide-y divide-border/40 overflow-hidden">
                {dashboard.recentActivity.map(item => <div key={item.id} className="flex items-start gap-3 p-4 hover:bg-muted/20 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.app}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.action}</p>
                    </div>
                    <span className="text-xs text-muted-foreground/60 shrink-0 mt-0.5">{item.time}</span>
                  </div>)}
                <div className="p-3 flex justify-center">
                  <button className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                    View all activity <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Dashboard>
    </>;
}
