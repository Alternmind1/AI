import { Helmet } from '@dr.pogodin/react-helmet';
import { useState, FormEvent } from 'react';
import { Navigate } from "react-router";
import { motion, AnimatePresence } from 'motion/react';
import { User, Lock, Users, AlertTriangle, LayoutGrid, Settings, LogOut, Eye, EyeOff, Check, Loader2, UserPlus, Shield, ChevronRight } from 'lucide-react';
import Dashboard from '@/layouts/Dashboard';
import { useSession, signOut } from '@/lib/auth/auth-client';
import { account } from 'virtual:content';
type Section = 'profile' | 'password' | 'team' | 'danger';
const SECTION_ICONS: Record<Section, React.ComponentType<{
  size?: number;
  className?: string;
}>> = {
  profile: User,
  password: Lock,
  team: Users,
  danger: AlertTriangle
};

// Fake team members for UI demo
const DEMO_MEMBERS = [{
  id: 'm1',
  name: 'Alex Rivera',
  email: 'alex@company.com',
  role: 'Admin',
  initials: 'AR'
}, {
  id: 'm2',
  name: 'Sam Chen',
  email: 'sam@company.com',
  role: 'Editor',
  initials: 'SC'
}, {
  id: 'm3',
  name: 'Jordan Lee',
  email: 'jordan@company.com',
  role: 'Viewer',
  initials: 'JL'
}];
export default function AccountPage() {
  const {
    user,
    isAuthenticated,
    isPending
  } = useSession();
  const [activeSection, setActiveSection] = useState<Section>('profile');

  // Profile form
  const [name, setName] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Password form
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdError, setPwdError] = useState('');

  // Team
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [members, setMembers] = useState(DEMO_MEMBERS);

  // Danger
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  if (isPending) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const displayName = name || user?.name || '';
  const userEmail = user?.email || '';
  const initials = (user?.name || userEmail).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  async function handleProfileSave(e: FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setProfileSaving(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  }
  function validatePassword(pwd: string): string | null {
    if (pwd.length < 8) return 'At least 8 characters required';
    if (!/[A-Z]/.test(pwd)) return 'Must include an uppercase letter';
    if (!/[0-9]/.test(pwd)) return 'Must include a number';
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/`~]/.test(pwd)) return 'Must include a special character';
    return null;
  }
  async function handlePasswordSave(e: FormEvent) {
    e.preventDefault();
    setPwdError('');
    if (newPwd !== confirmPwd) {
      setPwdError('Passwords do not match');
      return;
    }
    const err = validatePassword(newPwd);
    if (err) {
      setPwdError(err);
      return;
    }
    setPwdSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setPwdSaving(false);
    setPwdSaved(true);
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
    setTimeout(() => setPwdSaved(false), 2500);
  }
  async function handleInvite(e: FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    await new Promise(r => setTimeout(r, 800));
    const parts = inviteEmail.split('@')[0].split('.');
    const newMember = {
      id: `m${Date.now()}`,
      name: parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' '),
      email: inviteEmail,
      role: 'Viewer',
      initials: parts.map(p => p[0]?.toUpperCase() || '').join('').slice(0, 2)
    };
    setMembers(prev => [...prev, newMember]);
    setInviteEmail('');
    setInviting(false);
  }
  const sections: {
    id: Section;
    label: string;
  }[] = [{
    id: 'profile',
    label: account.nav[0].label
  }, {
    id: 'password',
    label: account.nav[1].label
  }, {
    id: 'team',
    label: account.nav[2].label
  }, {
    id: 'danger',
    label: account.nav[3].label
  }];
  return <>
      <Helmet>
        <title>Account Settings — AlternMind</title>
        <meta name="description" content="Manage your AlternMind profile, password, and team settings." />
        <link rel="canonical" href="https://alternmind.com/dashboard/account" />
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
            icon: LayoutGrid
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
          name: user?.name || '',
          email: userEmail,
          initials
        }
      },
      main: {
        maxWidth: 'full',
        padding: true
      }
    }}>
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          {/* Page title */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your profile, security, and team.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar nav */}
            <nav aria-label="Account settings navigation" className="md:w-52 shrink-0">
              <ul className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
                {sections.map(({
                id,
                label
              }) => {
                const Icon = SECTION_ICONS[id];
                const isActive = activeSection === id;
                return <li key={id}>
                      <button onClick={() => setActiveSection(id)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'} ${id === 'danger' ? 'md:mt-4' : ''}`}>
                        <Icon size={15} className={isActive ? 'text-primary' : ''} />
                        {label}
                        {isActive && <ChevronRight size={13} className="ml-auto hidden md:block" />}
                      </button>
                    </li>;
              })}
              </ul>
            </nav>

            {/* Section content */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                {/* ── PROFILE ── */}
                {activeSection === 'profile' && <motion.div key="profile" initial={{
                opacity: 0,
                y: 8
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: -8
              }} transition={{
                duration: 0.2
              }} className="rounded-xl border border-border/60 bg-card/60 p-6 flex flex-col gap-6">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">{account.profile.title}</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">{account.profile.subtitle}</p>
                    </div>

                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{displayName || userEmail}</p>
                        <p className="text-xs text-muted-foreground">{userEmail}</p>
                      </div>
                    </div>

                    <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="acc-name" className="text-sm font-medium text-foreground/80">
                          {account.profile.nameLabel}
                        </label>
                        <input id="acc-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder={user?.name || 'Your name'} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background/60 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all" />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="acc-email" className="text-sm font-medium text-foreground/80">
                          {account.profile.emailLabel}
                        </label>
                        <input id="acc-email" type="email" value={userEmail} disabled className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted/30 text-muted-foreground text-sm cursor-not-allowed" />
                        <p className="text-xs text-muted-foreground/60">{account.profile.emailNote}</p>
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <button type="submit" disabled={profileSaving} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-60">
                          {profileSaving ? <Loader2 size={14} className="animate-spin" /> : null}
                          {profileSaved ? account.profile.savedLabel : account.profile.saveLabel}
                        </button>
                        {profileSaved && <Check size={16} className="text-green-500" />}
                      </div>
                    </form>
                  </motion.div>}

                {/* ── PASSWORD ── */}
                {activeSection === 'password' && <motion.div key="password" initial={{
                opacity: 0,
                y: 8
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: -8
              }} transition={{
                duration: 0.2
              }} className="rounded-xl border border-border/60 bg-card/60 p-6 flex flex-col gap-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Shield size={18} className="text-primary" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-foreground">{account.password.title}</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">{account.password.subtitle}</p>
                      </div>
                    </div>

                    {pwdError && <div className="px-4 py-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm">
                        {pwdError}
                      </div>}

                    <form onSubmit={handlePasswordSave} className="flex flex-col gap-4">
                      {/* Current password */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="pwd-current" className="text-sm font-medium text-foreground/80">
                          {account.password.currentLabel}
                        </label>
                        <div className="relative">
                          <input id="pwd-current" type={showCurrent ? 'text' : 'password'} value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} required placeholder="••••••••" className="w-full px-4 py-2.5 pr-10 rounded-lg border border-border bg-background/60 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all" />
                          <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle visibility">
                            {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      {/* New password */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="pwd-new" className="text-sm font-medium text-foreground/80">
                          {account.password.newLabel}
                        </label>
                        <div className="relative">
                          <input id="pwd-new" type={showNew ? 'text' : 'password'} value={newPwd} onChange={e => setNewPwd(e.target.value)} required placeholder="Min 8 chars, A-Z, 0-9, special" className="w-full px-4 py-2.5 pr-10 rounded-lg border border-border bg-background/60 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all" />
                          <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle visibility">
                            {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="pwd-confirm" className="text-sm font-medium text-foreground/80">
                          {account.password.confirmLabel}
                        </label>
                        <input id="pwd-confirm" type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background/60 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all" />
                        <p className="text-xs text-muted-foreground/60">{account.password.hint}</p>
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <button type="submit" disabled={pwdSaving} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-60">
                          {pwdSaving ? <Loader2 size={14} className="animate-spin" /> : null}
                          {pwdSaved ? account.password.savedLabel : account.password.saveLabel}
                        </button>
                        {pwdSaved && <Check size={16} className="text-green-500" />}
                      </div>
                    </form>
                  </motion.div>}

                {/* ── TEAM ── */}
                {activeSection === 'team' && <motion.div key="team" initial={{
                opacity: 0,
                y: 8
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: -8
              }} transition={{
                duration: 0.2
              }} className="flex flex-col gap-4">
                    {/* Invite */}
                    <div className="rounded-xl border border-border/60 bg-card/60 p-6 flex flex-col gap-4">
                      <div>
                        <h2 className="text-base font-semibold text-foreground">{account.team.title}</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">{account.team.subtitle}</p>
                      </div>
                      <form onSubmit={handleInvite} className="flex gap-2">
                        <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder={account.team.invitePlaceholder} className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background/60 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all" />
                        <button type="submit" disabled={inviting || !inviteEmail.trim()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-60 shrink-0">
                          {inviting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                          {account.team.inviteButton}
                        </button>
                      </form>
                    </div>

                    {/* Members list */}
                    <div className="rounded-xl border border-border/60 bg-card/60 overflow-hidden">
                      <div className="px-6 py-4 border-b border-border/40">
                        <h3 className="text-sm font-semibold text-foreground">{account.team.membersHeading}</h3>
                      </div>
                      {members.length === 0 ? <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                          {account.team.emptyState}
                        </div> : <ul>
                          {members.map((member, i) => <li key={member.id} className={`flex items-center gap-3 px-6 py-3.5 ${i < members.length - 1 ? 'border-b border-border/30' : ''}`}>
                              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                {member.initials}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                              </div>
                              <select value={member.role} onChange={e => setMembers(prev => prev.map(m => m.id === member.id ? {
                        ...m,
                        role: e.target.value
                      } : m))} className="text-xs bg-muted/40 border border-border/40 rounded-lg px-2 py-1 text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all">
                                {account.team.roles.map(role => <option key={role} value={role}>{role}</option>)}
                              </select>
                            </li>)}
                        </ul>}
                    </div>
                  </motion.div>}

                {/* ── DANGER ZONE ── */}
                {activeSection === 'danger' && <motion.div key="danger" initial={{
                opacity: 0,
                y: 8
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: -8
              }} transition={{
                duration: 0.2
              }} className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 flex flex-col gap-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                        <AlertTriangle size={18} className="text-destructive" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-foreground">{account.danger.title}</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">{account.danger.deleteDescription}</p>
                      </div>
                    </div>

                    {!deleteConfirm ? <button onClick={() => setDeleteConfirm(true)} className="self-start inline-flex items-center gap-2 px-5 py-2 rounded-full border border-destructive/40 text-destructive text-sm font-semibold hover:bg-destructive/10 transition-all">
                        <AlertTriangle size={14} />
                        {account.danger.deleteLabel}
                      </button> : <div className="flex flex-col gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/10">
                        <p className="text-sm font-medium text-destructive">{account.danger.deleteConfirm}</p>
                        <div className="flex gap-2">
                          <button onClick={() => signOut()} className="px-4 py-2 rounded-full bg-destructive text-white text-sm font-semibold hover:bg-destructive/90 transition-all">
                            Yes, delete my account
                          </button>
                          <button onClick={() => setDeleteConfirm(false)} className="px-4 py-2 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-all">
                            Cancel
                          </button>
                        </div>
                      </div>}
                  </motion.div>}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Dashboard>
    </>;
}
