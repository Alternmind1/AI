import { Helmet } from '@dr.pogodin/react-helmet';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import {
  ArrowLeft, Factory, Warehouse, Truck, Zap, MapPin, Mail, Phone,
  Globe, Package, DollarSign, Clock, BarChart3, Building2,
  Loader2, AlertCircle, Image as ImageIcon,
} from 'lucide-react';
import { ProtectedRoute } from '@/lib/auth/auth-client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Facility {
  id: number;
  facilityName: string;
  facilityCode: string | null;
  addressLine1: string;
  city: string;
  stateProvince: string | null;
  country: string;
  postalCode: string | null;
  productType: string;
  productCategory: string | null;
  productionCapacityUnits: number;
  capacityPeriod: string;
  unitCost: string | null;
  currency: string;
  leadTimeDays: number | null;
  minimumOrderQuantity: number | null;
  maximumOrderQuantity: number | null;
  hasStorage: boolean;
  notes: string | null;
  imageUrl: string | null;
}

interface Warehouse {
  id: number;
  warehouseName: string;
  warehouseCode: string | null;
  addressLine1: string;
  city: string;
  country: string;
  totalCapacityCbm: string;
  availableCapacityCbm: string | null;
  costPerCbmPerDay: string | null;
  currency: string;
  notes: string | null;
  imageUrl: string | null;
}

interface Transport {
  id: number;
  routeName: string;
  routeCode: string | null;
  originCity: string;
  originCountry: string;
  destinationCity: string;
  destinationCountry: string;
  transportMode: string;
  vehicleType: string | null;
  capacityUnits: number | null;
  costPerUnit: string | null;
  costPerKg: string | null;
  currency: string;
  transitTimeDays: string;
  frequency: string | null;
  notes: string | null;
  imageUrl: string | null;
}

interface Company {
  id: number;
  companyName: string;
  companyType: string;
  registrationNumber: string | null;
  contactEmail: string;
  contactPhone: string | null;
  website: string | null;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  facilities: Facility[];
  warehouses: Warehouse[];
  transports: Transport[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function typeIcon(type: string, size = 'w-5 h-5') {
  if (type === 'manufacturer') return <Factory className={`${size} text-primary`} />;
  if (type === 'warehouse') return <Warehouse className={`${size} text-primary`} />;
  return <Truck className={`${size} text-primary`} />;
}

function AssetImage({ url, alt }: { url: string | null; alt: string }) {
  if (!url) return (
    <div className="w-full h-40 rounded-lg bg-muted flex items-center justify-center">
      <ImageIcon className="w-8 h-8 text-muted-foreground" />
    </div>
  );
  return (
    <img
      src={url}
      alt={alt}
      className="w-full h-40 object-cover rounded-lg"
      loading="lazy"
    />
  );
}

// ─── Detail Content ───────────────────────────────────────────────────────────

function CompanyDetailContent() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'assets'>('overview');

  useEffect(() => {
    fetch(`/api/gridspace/companies/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json() as Promise<Company>;
      })
      .then(setCompany)
      .catch((e) => setError(e.message === '404' ? 'Company not found.' : 'Failed to load company.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center gs-light-theme">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (error || !company) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 gs-light-theme">
      <AlertCircle className="w-10 h-10 text-destructive" />
      <p className="font-medium">{error || 'Company not found.'}</p>
      <Link to="/gridspace/suppliers" className="text-sm text-primary hover:underline">Back to supplier search</Link>
    </div>
  );

  const assetCount = company.facilities.length + company.warehouses.length + company.transports.length;

  return (
    <>
      <Helmet>
        <title>{company.companyName} | GridSpace | AlternMind</title>
        <meta name="description" content={company.description || `${company.companyName} — ${company.companyType} on the GridSpace network.`} />
        <link rel="canonical" href={`https://alternmind.com/gridspace/company/${company.id}`} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground gs-light-theme">
        {/* Header */}
        <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/gridspace/suppliers" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold text-lg">GridSpace</span>
            </div>
            <Link
              to={`/gridspace/suppliers?selected=${company.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Optimize with this supplier
            </Link>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Hero card */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden mb-8">
            {company.imageUrl ? (
              <img
                src={company.imageUrl}
                alt={company.companyName}
                className="w-full h-56 object-cover"
                loading="eager"
              />
            ) : (
              <div className="w-full h-40 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                {typeIcon(company.companyType, 'w-12 h-12')}
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      {typeIcon(company.companyType)}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">{company.companyName}</h1>
                      <p className="text-sm text-muted-foreground capitalize">{company.companyType}</p>
                    </div>
                  </div>
                  {company.description && (
                    <p className="text-sm text-muted-foreground max-w-xl">{company.description}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${company.isActive ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}>
                    {company.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                    {company.companyType}
                  </span>
                </div>
              </div>

              {/* Contact row */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 pt-5 border-t border-border text-sm text-muted-foreground">
                <a href={`mailto:${company.contactEmail}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                  <Mail className="w-3.5 h-3.5" />{company.contactEmail}
                </a>
                {company.contactPhone && (
                  <a href={`tel:${company.contactPhone}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                    <Phone className="w-3.5 h-3.5" />{company.contactPhone}
                  </a>
                )}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                    <Globe className="w-3.5 h-3.5" />{company.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {company.registrationNumber && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />Reg: {company.registrationNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total assets', value: assetCount, icon: Building2 },
              { label: 'Facilities', value: company.facilities.length, icon: Factory },
              { label: 'Warehouses', value: company.warehouses.length, icon: Warehouse },
              { label: 'Transport routes', value: company.transports.length, icon: Truck },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <s.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-border">
            {(['overview', 'assets'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Facilities summary */}
              {company.facilities.length > 0 && (
                <div>
                  <h2 className="font-semibold mb-3 flex items-center gap-2">
                    <Factory className="w-4 h-4 text-primary" /> Production Facilities
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {company.facilities.map((f) => (
                      <div key={f.id} className="rounded-xl border border-border bg-card overflow-hidden">
                        <AssetImage url={f.imageUrl} alt={f.facilityName} />
                        <div className="p-4">
                          <p className="font-semibold text-sm mb-1">{f.facilityName}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{f.city}, {f.country}</span>
                            <span className="flex items-center gap-1"><Package className="w-3 h-3" />{f.productType}</span>
                            {f.unitCost && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{f.currency} {parseFloat(f.unitCost).toFixed(2)}/unit</span>}
                            {f.leadTimeDays !== null && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{f.leadTimeDays}d lead</span>}
                          </div>
                          {f.minimumOrderQuantity && (
                            <p className="text-xs text-muted-foreground mt-1">MOQ: {f.minimumOrderQuantity.toLocaleString()} units</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warehouses summary */}
              {company.warehouses.length > 0 && (
                <div>
                  <h2 className="font-semibold mb-3 flex items-center gap-2">
                    <Warehouse className="w-4 h-4 text-primary" /> Warehouses
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {company.warehouses.map((w) => (
                      <div key={w.id} className="rounded-xl border border-border bg-card overflow-hidden">
                        <AssetImage url={w.imageUrl} alt={w.warehouseName} />
                        <div className="p-4">
                          <p className="font-semibold text-sm mb-1">{w.warehouseName}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{w.city}, {w.country}</span>
                            <span>{parseFloat(w.totalCapacityCbm).toLocaleString()} m³ total</span>
                            {w.costPerCbmPerDay && <span>{w.currency} {parseFloat(w.costPerCbmPerDay).toFixed(4)}/m³/day</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transport routes summary */}
              {company.transports.length > 0 && (
                <div>
                  <h2 className="font-semibold mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-primary" /> Transport Routes
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {company.transports.map((t) => (
                      <div key={t.id} className="rounded-xl border border-border bg-card overflow-hidden">
                        <AssetImage url={t.imageUrl} alt={t.routeName} />
                        <div className="p-4">
                          <p className="font-semibold text-sm mb-1">{t.routeName}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span>{t.originCity}, {t.originCountry} → {t.destinationCity}, {t.destinationCountry}</span>
                            <span className="capitalize">{t.transportMode}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t.transitTimeDays}d transit</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {assetCount === 0 && (
                <div className="rounded-xl border border-dashed border-border p-10 text-center">
                  <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No assets registered yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Assets tab — detailed table view */}
          {activeTab === 'assets' && (
            <div className="space-y-6">
              {company.facilities.length > 0 && (
                <div>
                  <h2 className="font-semibold mb-3">Production Facilities</h2>
                  <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Facility</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Location</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Unit Cost</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Lead</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Capacity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {company.facilities.map((f, i) => (
                          <tr key={f.id} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                            <td className="px-4 py-3 font-medium">{f.facilityName}</td>
                            <td className="px-4 py-3 text-muted-foreground">{f.city}, {f.country}</td>
                            <td className="px-4 py-3 text-muted-foreground">{f.productType}</td>
                            <td className="px-4 py-3">{f.unitCost ? `${f.currency} ${parseFloat(f.unitCost).toFixed(2)}` : '—'}</td>
                            <td className="px-4 py-3">{f.leadTimeDays !== null ? `${f.leadTimeDays}d` : '—'}</td>
                            <td className="px-4 py-3">{f.productionCapacityUnits.toLocaleString()}/{f.capacityPeriod}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {company.warehouses.length > 0 && (
                <div>
                  <h2 className="font-semibold mb-3">Warehouses</h2>
                  <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Warehouse</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Location</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Capacity (m³)</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cost/m³/day</th>
                        </tr>
                      </thead>
                      <tbody>
                        {company.warehouses.map((w, i) => (
                          <tr key={w.id} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                            <td className="px-4 py-3 font-medium">{w.warehouseName}</td>
                            <td className="px-4 py-3 text-muted-foreground">{w.city}, {w.country}</td>
                            <td className="px-4 py-3">{parseFloat(w.totalCapacityCbm).toLocaleString()}</td>
                            <td className="px-4 py-3">{w.costPerCbmPerDay ? `${w.currency} ${parseFloat(w.costPerCbmPerDay).toFixed(4)}` : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {company.transports.length > 0 && (
                <div>
                  <h2 className="font-semibold mb-3">Transport Routes</h2>
                  <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Route</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Origin → Destination</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Mode</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Transit</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cost/unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {company.transports.map((t, i) => (
                          <tr key={t.id} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                            <td className="px-4 py-3 font-medium">{t.routeName}</td>
                            <td className="px-4 py-3 text-muted-foreground">{t.originCity} → {t.destinationCity}</td>
                            <td className="px-4 py-3 capitalize">{t.transportMode}</td>
                            <td className="px-4 py-3">{t.transitTimeDays}d</td>
                            <td className="px-4 py-3">{t.costPerUnit ? `${t.currency} ${parseFloat(t.costPerUnit).toFixed(2)}` : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function GridSpaceCompanyDetail() {
  return (
    <ProtectedRoute>
      <CompanyDetailContent />
    </ProtectedRoute>
  );
}
