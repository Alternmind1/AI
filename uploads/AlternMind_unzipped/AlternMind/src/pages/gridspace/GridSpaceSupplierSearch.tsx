import { Helmet } from '@dr.pogodin/react-helmet';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { Search, SlidersHorizontal, Zap, Factory, ArrowLeft, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Loader2, Star, Package, MapPin, Mail, DollarSign, BarChart3, AlertTriangle, Info } from 'lucide-react';
import { ProtectedRoute } from '@/lib/auth/auth-client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Facility {
  id: number;
  facilityName: string;
  city: string;
  country: string;
  productType: string;
  productionCapacityUnits: number;
  capacityPeriod: string;
  unitCost: string | null;
  currency: string;
  leadTimeDays: number | null;
}

interface SupplierResult {
  id: number;
  companyName: string;
  companyType: string;
  contactEmail: string;
  description: string | null;
  facilities: Facility[];
  warehouses: unknown[];
  transports: unknown[];
}

interface RankedSupplier {
  companyId: number;
  companyName: string;
  companyType: string;
  contactEmail: string;
  estimatedUnitCost: number | null;
  estimatedTotalCost: number | null;
  estimatedLeadDays: number | null;
  canMeetDeadline: boolean | null;
  currency: string;
  score: number;
  scoreBreakdown: { costScore: number; leadTimeScore: number; capacityScore: number };
  matchedAssets: Facility[];
  notes: string[];
}

interface OptimizeResult {
  requirement: Requirement;
  ranked: RankedSupplier[];
  total: number;
  note: string;
}

interface Requirement {
  productType: string;
  quantity: number;
  deliveryDeadline: string;
  destinationCity: string;
  destinationCountry: string;
  currency: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70 ? 'bg-green-100 text-green-800 border-green-200' :
    score >= 45 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  'bg-red-100 text-red-800 border-red-200';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      <Star className="w-3 h-3" />
      {score}/100
    </span>
  );
}

function DeadlineBadge({ canMeet }: { canMeet: boolean | null }) {
  if (canMeet === null) return <span className="text-xs text-muted-foreground">Lead time unknown</span>;
  return canMeet ? (
    <span className="inline-flex items-center gap-1 text-xs text-green-700">
      <CheckCircle className="w-3 h-3" /> Meets deadline
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs text-red-600">
      <XCircle className="w-3 h-3" /> Misses deadline
    </span>
  );
}

// ─── Ranked Result Card ───────────────────────────────────────────────────────

function RankedCard({
  supplier,
  rank,
  onSelect,
  selected,
}: {
  supplier: RankedSupplier;
  rank: number;
  onSelect: (id: number) => void;
  selected: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`rounded-xl border transition-all ${
        selected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'
      }`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
              rank === 1 ? 'bg-yellow-100 text-yellow-800' :
              rank === 2 ? 'bg-gray-100 text-gray-700' :
              rank === 3 ? 'bg-orange-100 text-orange-700' :
              'bg-muted text-muted-foreground'
            }`}>
              {rank}
            </div>
            <div>
              <p className="font-semibold text-sm">{supplier.companyName}</p>
              <p className="text-xs text-muted-foreground capitalize">{supplier.companyType}</p>
            </div>
          </div>
          <ScoreBadge score={supplier.score} />
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="rounded-lg bg-muted/50 p-2.5 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">Unit Cost</p>
            <p className="text-sm font-semibold">
              {supplier.estimatedUnitCost !== null
                ? `${supplier.currency} ${supplier.estimatedUnitCost.toFixed(2)}`
                : '—'}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2.5 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">Total Cost</p>
            <p className="text-sm font-semibold">
              {supplier.estimatedTotalCost !== null
                ? `${supplier.currency} ${supplier.estimatedTotalCost.toLocaleString()}`
                : '—'}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2.5 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">Lead Time</p>
            <p className="text-sm font-semibold">
              {supplier.estimatedLeadDays !== null ? `${supplier.estimatedLeadDays}d` : '—'}
            </p>
          </div>
        </div>

        {/* Score bar */}
        <div className="mb-3">
          <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-muted">
            <div
              className="bg-green-500 transition-all"
              style={{ width: `${(supplier.scoreBreakdown.costScore / 40) * 100}%` }}
              title={`Cost score: ${supplier.scoreBreakdown.costScore}/40`}
            />
            <div
              className="bg-primary transition-all"
              style={{ width: `${(supplier.scoreBreakdown.leadTimeScore / 40) * 100}%` }}
              title={`Lead time score: ${supplier.scoreBreakdown.leadTimeScore}/40`}
            />
            <div
              className="bg-purple-500 transition-all"
              style={{ width: `${(supplier.scoreBreakdown.capacityScore / 20) * 100}%` }}
              title={`Capacity score: ${supplier.scoreBreakdown.capacityScore}/20`}
            />
          </div>
          <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Cost</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" />Lead time</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />Capacity</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <DeadlineBadge canMeet={supplier.canMeetDeadline} />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? 'Less' : 'Details'}
            </button>
            <button
              onClick={() => onSelect(supplier.companyId)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-primary/10 hover:text-primary text-foreground'
              }`}
            >
              {selected ? 'Selected' : 'Select'}
            </button>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-border space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="w-3 h-3" />
              <span>{supplier.contactEmail}</span>
            </div>

            {supplier.notes.length > 0 && (
              <div className="space-y-1">
                {supplier.notes.map((note, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-yellow-700 bg-yellow-50 rounded-lg px-3 py-2">
                    <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            )}

            {supplier.matchedAssets.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2">Matching facilities</p>
                <div className="space-y-2">
                  {supplier.matchedAssets.map((f: Facility) => (
                    <div key={f.id} className="rounded-lg bg-muted/40 px-3 py-2 text-xs">
                      <p className="font-medium">{f.facilityName}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{f.city}, {f.country}</span>
                        <span className="flex items-center gap-1"><Package className="w-3 h-3" />{f.productType}</span>
                        {f.unitCost && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{f.currency} {parseFloat(f.unitCost).toFixed(2)}/unit</span>}
                        {f.leadTimeDays !== null && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{f.leadTimeDays}d lead</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Search Result Card ───────────────────────────────────────────────────────

function SearchResultCard({
  supplier,
  onSelect,
  selected,
}: {
  supplier: SupplierResult;
  onSelect: (id: number) => void;
  selected: boolean;
}) {
  const assetCount =
    supplier.facilities.length + supplier.warehouses.length + supplier.transports.length;

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        selected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <Link to={`/gridspace/company/${supplier.id}`} className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Factory className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{supplier.companyName}</p>
            <p className="text-xs text-muted-foreground capitalize">{supplier.companyType} · {assetCount} asset{assetCount !== 1 ? 's' : ''}</p>
          </div>
        </Link>
        <button
          onClick={() => onSelect(supplier.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
            selected
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-primary/10 hover:text-primary text-foreground'
          }`}
        >
          {selected ? 'Added' : 'Add'}
        </button>
      </div>

      {supplier.facilities.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {supplier.facilities.slice(0, 3).map((f) => (
            <span key={f.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
              <MapPin className="w-2.5 h-2.5" />{f.city}, {f.country}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function SupplierSearchContent() {
  // Search state
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('manufacturer');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterProductType, setFilterProductType] = useState('');
  const [filterMaxLead, setFilterMaxLead] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [searchResults, setSearchResults] = useState<SupplierResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchDone, setSearchDone] = useState(false);

  // Selection for manual optimize
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Optimize requirement form
  const [showOptimizeForm, setShowOptimizeForm] = useState(false);
  const [req, setReq] = useState<Requirement>({
    productType: '',
    quantity: 1,
    deliveryDeadline: '',
    destinationCity: '',
    destinationCountry: '',
    currency: 'USD',
  });
  const [optimizeMode, setOptimizeMode] = useState<'auto' | 'manual'>('manual');
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeResult, setOptimizeResult] = useState<OptimizeResult | null>(null);
  const [optimizeError, setOptimizeError] = useState('');

  const searchRef = useRef<HTMLInputElement>(null);

  // ── Search ──────────────────────────────────────────────────────────────────
  // Accept current values as params so the function always uses the latest state,
  // regardless of when it is called (mount, button click, Enter key).

  async function doSearch(
    q: string,
    type: string,
    country: string,
    city: string,
    productType: string,
    maxLead: string,
  ) {
    setSearching(true);
    setSearchDone(false);
    setOptimizeResult(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (type) params.set('type', type);
      if (country) params.set('country', country);
      if (city) params.set('city', city);
      if (productType) params.set('productType', productType);
      if (maxLead) params.set('maxLeadDays', maxLead);
      params.set('limit', '50');

      const res = await fetch(`/api/gridspace/suppliers?${params}`);
      const data = await res.json() as { results: SupplierResult[] };
      setSearchResults(Array.isArray(data.results) ? data.results : []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
      setSearchDone(true);
    }
  }

  // Convenience wrapper using current state values
  function runSearch() {
    return doSearch(query, filterType, filterCountry, filterCity, filterProductType, filterMaxLead);
  }

  // Auto-load all suppliers on mount
  useEffect(() => {
    doSearch('', 'manufacturer', '', '', '', '');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Optimize ────────────────────────────────────────────────────────────────

  const runOptimize = async () => {
    if (!req.productType || !req.quantity || !req.deliveryDeadline) {
      setOptimizeError('Product type, quantity, and delivery deadline are required.');
      return;
    }
    setOptimizeError('');
    setOptimizing(true);
    setOptimizeResult(null);
    try {
      const body = {
        requirement: req,
        supplierIds: optimizeMode === 'manual' ? Array.from(selectedIds) : [],
        mode: optimizeMode,
      };
      const res = await fetch('/api/gridspace/suppliers/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json() as OptimizeResult;
      setOptimizeResult(data);
      setShowOptimizeForm(false);
    } catch {
      setOptimizeError('Optimization request failed. Please try again.');
    } finally {
      setOptimizing(false);
    }
  };

  const prefillProductType = () => {
    if (filterProductType && !req.productType) {
      setReq((r) => ({ ...r, productType: filterProductType }));
    }
    if (query && !req.productType) {
      setReq((r) => ({ ...r, productType: query }));
    }
  };

  return (
    <>
      <Helmet>
        <title>Supplier Search | GridSpace | AlternMind</title>
        <meta name="description" content="Search the GridSpace network for suppliers and optimize costs and delivery schedules." />
        <link rel="canonical" href="https://alternmind.com/gridspace/suppliers" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground gs-light-theme">
        {/* Header */}
        <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/gridspace/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Search className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-none">Supplier Search</h1>
                <p className="text-xs text-muted-foreground">Find and optimize across the GridSpace network</p>
              </div>
            </div>
            <button
              onClick={() => {
                prefillProductType();
                setShowOptimizeForm(true);
                setOptimizeMode('auto');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Auto-Optimize
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Left: Search Panel ─────────────────────────────────────── */}
            <div className="lg:col-span-1 space-y-4">
              {/* Search box */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="font-semibold text-sm mb-3">Search Suppliers</h2>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                    placeholder="Company name, product type…"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>

                {/* Filters toggle */}
                <button
                  onClick={() => setShowFilters((v) => !v)}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  {showFilters ? 'Hide filters' : 'Show filters'}
                  {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {showFilters && (
                  <div className="space-y-3 mb-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Supplier type</label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="">All types</option>
                        <option value="manufacturer">Manufacturer</option>
                        <option value="warehouse">Warehouse</option>
                        <option value="transport">Transport</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Product type</label>
                      <input
                        type="text"
                        value={filterProductType}
                        onChange={(e) => setFilterProductType(e.target.value)}
                        placeholder="e.g. A12 tires"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Country</label>
                        <input
                          type="text"
                          value={filterCountry}
                          onChange={(e) => setFilterCountry(e.target.value)}
                          placeholder="e.g. Germany"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">City</label>
                        <input
                          type="text"
                          value={filterCity}
                          onChange={(e) => setFilterCity(e.target.value)}
                          placeholder="e.g. Munich"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Max lead time (days)</label>
                      <input
                        type="number"
                        value={filterMaxLead}
                        onChange={(e) => setFilterMaxLead(e.target.value)}
                        placeholder="e.g. 30"
                        min={1}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={runSearch}
                  disabled={searching}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
                >
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  {searching ? 'Searching…' : 'Search'}
                </button>
              </div>

              {/* Manual optimize panel */}
              {selectedIds.size > 0 && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold">{selectedIds.size} supplier{selectedIds.size !== 1 ? 's' : ''} selected</p>
                    <button
                      onClick={() => setSelectedIds(new Set())}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      prefillProductType();
                      setShowOptimizeForm(true);
                      setOptimizeMode('manual');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Optimize selected
                  </button>
                </div>
              )}
            </div>

            {/* ── Right: Results / Optimize Output ──────────────────────── */}
            <div className="lg:col-span-2 space-y-4">

              {/* Optimize form modal-style inline panel */}
              {showOptimizeForm && (
                <div className="rounded-xl border border-primary/40 bg-card p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">
                        {optimizeMode === 'auto' ? 'Auto-Optimize Across Network' : `Optimize ${selectedIds.size} Selected Supplier${selectedIds.size !== 1 ? 's' : ''}`}
                      </h3>
                    </div>
                    <button onClick={() => setShowOptimizeForm(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Product / item type <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={req.productType}
                        onChange={(e) => setReq((r) => ({ ...r, productType: e.target.value }))}
                        placeholder="e.g. A12 tires"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Quantity required <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        value={req.quantity}
                        onChange={(e) => setReq((r) => ({ ...r, quantity: parseInt(e.target.value, 10) || 1 }))}
                        min={1}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Delivery deadline <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        value={req.deliveryDeadline}
                        onChange={(e) => setReq((r) => ({ ...r, deliveryDeadline: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Currency</label>
                      <select
                        value={req.currency}
                        onChange={(e) => setReq((r) => ({ ...r, currency: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="JPY">JPY</option>
                        <option value="CNY">CNY</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Destination city</label>
                      <input
                        type="text"
                        value={req.destinationCity}
                        onChange={(e) => setReq((r) => ({ ...r, destinationCity: e.target.value }))}
                        placeholder="e.g. Detroit"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Destination country</label>
                      <input
                        type="text"
                        value={req.destinationCountry}
                        onChange={(e) => setReq((r) => ({ ...r, destinationCountry: e.target.value }))}
                        placeholder="e.g. USA"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>

                  {optimizeError && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      {optimizeError}
                    </div>
                  )}

                  <button
                    onClick={runOptimize}
                    disabled={optimizing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
                  >
                    {optimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    {optimizing ? 'Optimizing…' : 'Run Optimization'}
                  </button>
                </div>
              )}

              {/* Optimization results */}
              {optimizeResult && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-primary" />
                          Optimization Results
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {optimizeResult.total} supplier{optimizeResult.total !== 1 ? 's' : ''} ranked for{' '}
                          <strong>{optimizeResult.requirement.quantity}× {optimizeResult.requirement.productType}</strong>
                          {optimizeResult.requirement.deliveryDeadline && (
                            <> · deadline <strong>{new Date(optimizeResult.requirement.deliveryDeadline).toLocaleDateString()}</strong></>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => setOptimizeResult(null)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                      <Info className="w-3 h-3 mt-0.5 shrink-0" />
                      <span>{optimizeResult.note}</span>
                    </div>
                  </div>

                  {optimizeResult.ranked.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-10 text-center">
                      <Factory className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                      <p className="font-medium mb-1">No matching suppliers found</p>
                      <p className="text-sm text-muted-foreground">Try broadening your search or using Auto-Optimize to scan the full network.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {optimizeResult.ranked.map((s, i) => (
                        <RankedCard
                          key={s.companyId}
                          supplier={s}
                          rank={i + 1}
                          onSelect={toggleSelect}
                          selected={selectedIds.has(s.companyId)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Search results */}
              {!optimizeResult && searchDone && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {searchResults.length} supplier{searchResults.length !== 1 ? 's' : ''} found
                    </p>
                    {searchResults.length > 0 && selectedIds.size === 0 && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Info className="w-3 h-3" /> Select suppliers to optimize manually
                      </p>
                    )}
                  </div>

                  {searchResults.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-10 text-center">
                      <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                      <p className="font-medium mb-1">No suppliers found</p>
                      <p className="text-sm text-muted-foreground">Try different keywords or filters, or use Auto-Optimize to scan the full network.</p>
                    </div>
                  ) : (
                    searchResults.map((s) => (
                      <SearchResultCard
                        key={s.id}
                        supplier={s}
                        onSelect={toggleSelect}
                        selected={selectedIds.has(s.id)}
                      />
                    ))
                  )}
                </div>
              )}

              {/* Empty state before first search */}
              {!optimizeResult && !searchDone && !searching && (
                <div className="rounded-xl border border-dashed border-border p-16 text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-semibold mb-2">Find suppliers across the network</p>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                    Search by product type, location, or company name — then select suppliers to compare costs and schedules, or use Auto-Optimize to let the system rank the entire network for your requirement.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={runSearch}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Search className="w-4 h-4" /> Browse all suppliers
                    </button>
                    <button
                      onClick={() => { setShowOptimizeForm(true); setOptimizeMode('auto'); }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Zap className="w-4 h-4" /> Auto-Optimize
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function GridSpaceSupplierSearch() {
  return (
    <ProtectedRoute>
      <SupplierSearchContent />
    </ProtectedRoute>
  );
}
