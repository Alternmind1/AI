import { Helmet } from '@dr.pogodin/react-helmet';
import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Plus, Factory, Warehouse, Truck, Zap, Building2, ChevronRight, Clock, CheckCircle, AlertCircle, Loader2, Search } from 'lucide-react';
import { useSession } from '@/lib/auth/auth-client';
import { ProtectedRoute } from '@/lib/auth/auth-client';

interface Company {
  id: number;
  companyName: string;
  companyType: string;
  contactEmail: string;
  isActive: boolean;
  facilities: unknown[];
  warehouses: unknown[];
  transports: unknown[];
}

interface OptJob {
  id: number;
  jobName: string;
  status: string;
  objectiveFunction: string;
  createdAt: string;
}

function statusIcon(status: string) {
  if (status === 'completed') return <CheckCircle className="w-4 h-4 text-green-500" />;
  if (status === 'running') return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
  if (status === 'failed') return <AlertCircle className="w-4 h-4 text-destructive" />;
  return <Clock className="w-4 h-4 text-muted-foreground" />;
}

function typeIcon(type: string) {
  if (type === 'manufacturer') return <Factory className="w-5 h-5 text-primary" />;
  if (type === 'warehouse') return <Warehouse className="w-5 h-5 text-primary" />;
  return <Truck className="w-5 h-5 text-primary" />;
}

function DashboardContent() {
  const { user } = useSession();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<OptJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/gridspace/companies').then((r) => r.json()),
      fetch('/api/gridspace/optimize').then((r) => r.json()),
    ]).then(([c, j]) => {
      setCompanies(Array.isArray(c) ? c : []);
      setJobs(Array.isArray(j) ? j : []);
    }).finally(() => setLoading(false));
  }, []);

  const totalFacilities = companies.reduce((s, c) => s + (c.facilities?.length || 0), 0);
  const totalWarehouses = companies.reduce((s, c) => s + (c.warehouses?.length || 0), 0);
  const totalTransports = companies.reduce((s, c) => s + (c.transports?.length || 0), 0);

  return (
    <>
      <Helmet>
        <title>GridSpace Dashboard | AlternMind</title>
        <meta name="description" content="Manage your GridSpace companies, production facilities, warehouses, and transport routes. Submit and track schedule optimization jobs." />
        <link rel="canonical" href="https://gridsspace.alternmind.com/gridspace/dashboard" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground gs-light-theme">
        {/* Header */}
        <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-none">GridSpace</h1>
                <p className="text-xs text-muted-foreground">Supply Chain Optimizer</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:block">{user?.name || user?.email}</span>
              <Link to="/gridspace/suppliers" className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-card hover:bg-muted text-foreground rounded-lg text-sm font-medium transition-colors">
                <Search className="w-4 h-4" />
                <span>Find Suppliers</span>
              </Link>
              <Link to="/gridspace/register" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" />
                <span>Register Company</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Companies', value: companies.length, icon: Building2 },
                  { label: 'Facilities', value: totalFacilities, icon: Factory },
                  { label: 'Warehouses', value: totalWarehouses, icon: Warehouse },
                  { label: 'Transport Routes', value: totalTransports, icon: Truck },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{stat.label}</span>
                      <stat.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Companies */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Your Companies</h2>
                  <Link to="/gridspace/register" className="text-sm text-primary hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add company
                  </Link>
                </div>

                {companies.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-12 text-center">
                    <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium mb-1">No companies registered yet</p>
                    <p className="text-sm text-muted-foreground mb-4">Register your first company to start contributing to the network.</p>
                    <Link to="/gridspace/register" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                      <Plus className="w-4 h-4" /> Register Company
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {companies.map((company) => (
                      <Link key={company.id} to={`/gridspace/company/${company.id}`} className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                              {typeIcon(company.companyType)}
                            </div>
                            <div>
                              <p className="font-semibold">{company.companyName}</p>
                              <p className="text-xs text-muted-foreground capitalize">{company.companyType}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          {company.companyType === 'manufacturer' && (
                            <span>{company.facilities?.length || 0} facilities</span>
                          )}
                          {company.companyType === 'warehouse' && (
                            <span>{company.warehouses?.length || 0} warehouses</span>
                          )}
                          {company.companyType === 'transport' && (
                            <span>{company.transports?.length || 0} routes</span>
                          )}
                          <span>{company.contactEmail}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Optimization Jobs */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Optimization Jobs</h2>
                  {companies.length > 0 && (
                    <Link to="/gridspace/optimize" className="text-sm text-primary hover:underline flex items-center gap-1">
                      <Zap className="w-3 h-3" /> New job
                    </Link>
                  )}
                </div>

                {jobs.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-10 text-center">
                    <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium mb-1">No optimization jobs yet</p>
                    <p className="text-sm text-muted-foreground">Submit a schedule optimization job once you have registered your facilities.</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Job Name</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Objective</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map((job, i) => (
                          <tr key={job.id} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                            <td className="px-4 py-3 font-medium">{job.jobName}</td>
                            <td className="px-4 py-3 text-muted-foreground capitalize">{job.objectiveFunction.replace(/_/g, ' ')}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1.5 capitalize">
                                {statusIcon(job.status)}
                                {job.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {new Date(job.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function GridSpaceDashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
