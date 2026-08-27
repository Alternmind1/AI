import { Helmet } from '@dr.pogodin/react-helmet';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ProtectedRoute } from '@/lib/auth/auth-client';
import { ChevronRight, ChevronLeft, Factory, Warehouse, Truck, Plus, Trash2, Check, Upload, X } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

// ─── Types ───────────────────────────────────────────────────────────────────

// ─── Types ───────────────────────────────────────────────────────────────────

// ─── Types ───────────────────────────────────────────────────────────────────

// ─── Types ───────────────────────────────────────────────────────────────────

// ─── Types ───────────────────────────────────────────────────────────────────

// ─── Types ───────────────────────────────────────────────────────────────────

// ─── Types ───────────────────────────────────────────────────────────────────
type CompanyType = 'manufacturer' | 'warehouse' | 'transport';

interface CompanyForm {
  companyName: string;
  companyType: CompanyType | '';
  registrationNumber: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  description: string;
  imageUrl: string;
}

interface FacilityRow {
  facilityName: string;
  facilityCode: string;
  addressLine1: string;
  city: string;
  stateProvince: string;
  country: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  productType: string;
  productCategory: string;
  productionCapacityUnits: string;
  capacityPeriod: string;
  unitProductionTimeMinutes: string;
  unitCost: string;
  fixedCost: string;
  currency: string;
  hasStorage: boolean;
  storageCapacityUnits: string;
  minimumOrderQuantity: string;
  maximumOrderQuantity: string;
  leadTimeDays: string;
  operatingHoursStart: string;
  operatingHoursEnd: string;
  notes: string;
  imageUrl: string;
}

interface WarehouseRow {
  warehouseName: string;
  warehouseCode: string;
  addressLine1: string;
  city: string;
  stateProvince: string;
  country: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  totalCapacityCbm: string;
  availableCapacityCbm: string;
  costPerCbmPerDay: string;
  currency: string;
  handlingCapacityUnitsPerDay: string;
  notes: string;
  imageUrl: string;
}

interface TransportRow {
  routeName: string;
  routeCode: string;
  originCity: string;
  originCountry: string;
  destinationCity: string;
  destinationCountry: string;
  transportMode: string;
  vehicleType: string;
  capacityUnits: string;
  capacityWeightKg: string;
  capacityVolumeCbm: string;
  costPerUnit: string;
  costPerKg: string;
  currency: string;
  transitTimeDays: string;
  frequency: string;
  notes: string;
  imageUrl: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function emptyFacility(): FacilityRow {
  return { facilityName: '', facilityCode: '', addressLine1: '', city: '', stateProvince: '', country: '', postalCode: '', latitude: '', longitude: '', productType: '', productCategory: '', productionCapacityUnits: '', capacityPeriod: 'day', unitProductionTimeMinutes: '', unitCost: '', fixedCost: '', currency: 'USD', hasStorage: false, storageCapacityUnits: '', minimumOrderQuantity: '', maximumOrderQuantity: '', leadTimeDays: '', operatingHoursStart: '', operatingHoursEnd: '', notes: '', imageUrl: '' };
}
function emptyWarehouse(): WarehouseRow {
  return { warehouseName: '', warehouseCode: '', addressLine1: '', city: '', stateProvince: '', country: '', postalCode: '', latitude: '', longitude: '', totalCapacityCbm: '', availableCapacityCbm: '', costPerCbmPerDay: '', currency: 'USD', handlingCapacityUnitsPerDay: '', notes: '', imageUrl: '' };
}
function emptyTransport(): TransportRow {
  return { routeName: '', routeCode: '', originCity: '', originCountry: '', destinationCity: '', destinationCountry: '', transportMode: 'road', vehicleType: '', capacityUnits: '', capacityWeightKg: '', capacityVolumeCbm: '', costPerUnit: '', costPerKg: '', currency: 'USD', transitTimeDays: '', frequency: 'on-demand', notes: '', imageUrl: '' };
}

// ─── Field components ─────────────────────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors";
const selectCls = inputCls;

// ─── Image Upload Component ───────────────────────────────────────────────────
function ImageUpload({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file (JPEG, PNG, WebP, GIF).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be under 5 MB.');
      return;
    }
    setUploadError('');
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch('/api/gridspace/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, filename: file.name }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed');
      onChange(data.url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img src={value} alt="Uploaded" className="w-full h-36 object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center justify-center gap-2 h-36 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 hover:bg-primary/5 transition-colors disabled:opacity-60"
        >
          {uploading ? (
            <span className="text-xs text-muted-foreground">Uploading…</span>
          ) : (
            <>
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">Click to upload photo</span>
              <span className="text-xs text-muted-foreground/60">JPEG, PNG, WebP · max 5 MB</span>
            </>
          )}
        </button>
      )}
      {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
    </div>
  );
}

// ─── Step 1: Company Info ─────────────────────────────────────────────────────
function StepCompany({ form, onChange }: { form: CompanyForm; onChange: (f: CompanyForm) => void }) {
  const set = (k: keyof CompanyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    onChange({ ...form, [k]: e.target.value });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Company Information</h2>
        <p className="text-sm text-muted-foreground">Tell us about your organisation and what role it plays in the supply chain.</p>
      </div>

      {/* Type selector */}
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">
          Company Type <span className="text-destructive">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {([
            { value: 'manufacturer', label: 'Manufacturer', icon: Factory, desc: 'Production facilities' },
            { value: 'warehouse', label: 'Warehouse Provider', icon: Warehouse, desc: 'Storage & handling' },
            { value: 'transport', label: 'Transport Company', icon: Truck, desc: 'Freight & logistics' },
          ] as const).map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ ...form, companyType: value })}
              className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left ${form.companyType === value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
            >
              <Icon className={`w-5 h-5 ${form.companyType === value ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Company Name" required>
          <input className={inputCls} value={form.companyName} onChange={set('companyName')} placeholder="Acme Manufacturing Ltd." />
        </Field>
        <Field label="Registration Number">
          <input className={inputCls} value={form.registrationNumber} onChange={set('registrationNumber')} placeholder="e.g. 12345678" />
        </Field>
        <Field label="Contact Email" required>
          <input className={inputCls} type="email" value={form.contactEmail} onChange={set('contactEmail')} placeholder="ops@company.com" />
        </Field>
        <Field label="Contact Phone">
          <input className={inputCls} value={form.contactPhone} onChange={set('contactPhone')} placeholder="+1 555 000 0000" />
        </Field>
        <Field label="Website">
          <input className={inputCls} value={form.website} onChange={set('website')} placeholder="https://company.com" />
        </Field>
      </div>
      <Field label="Description">
        <textarea className={inputCls + ' resize-none'} rows={3} value={form.description} onChange={set('description')} placeholder="Brief description of your company and operations..." />
      </Field>
      <ImageUpload
        label="Company photo / logo"
        value={form.imageUrl}
        onChange={(url) => onChange({ ...form, imageUrl: url })}
      />
    </div>
  );
}

// ─── Step 2: Facilities table ─────────────────────────────────────────────────
function StepFacilities({ rows, onChange }: { rows: FacilityRow[]; onChange: (r: FacilityRow[]) => void }) {
  const set = (i: number, k: keyof FacilityRow) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const next = [...rows];
    next[i] = { ...next[i], [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value };
    onChange(next);
  };
  const add = () => onChange([...rows, emptyFacility()]);
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold mb-1">Production Facilities</h2>
          <p className="text-sm text-muted-foreground">Add one row per facility. All fields marked * are required.</p>
        </div>
        <button type="button" onClick={add} className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shrink-0">
          <Plus className="w-4 h-4" /> Add Row
        </button>
      </div>

      {rows.map((row, i) => (
        <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border">
            <span className="text-sm font-semibold">Facility {i + 1}</span>
            {rows.length > 1 && (
              <button type="button" onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Facility Name" required><input className={inputCls} value={row.facilityName} onChange={set(i, 'facilityName')} placeholder="Plant A" /></Field>
            <Field label="Facility Code"><input className={inputCls} value={row.facilityCode} onChange={set(i, 'facilityCode')} placeholder="PLT-A" /></Field>
            <Field label="Product Type" required><input className={inputCls} value={row.productType} onChange={set(i, 'productType')} placeholder="e.g. Electronic Components" /></Field>
            <Field label="Product Category"><input className={inputCls} value={row.productCategory} onChange={set(i, 'productCategory')} placeholder="e.g. Semiconductors" /></Field>
            <Field label="Address Line 1" required><input className={inputCls} value={row.addressLine1} onChange={set(i, 'addressLine1')} placeholder="123 Industrial Ave" /></Field>
            <Field label="City" required><input className={inputCls} value={row.city} onChange={set(i, 'city')} placeholder="Detroit" /></Field>
            <Field label="State / Province"><input className={inputCls} value={row.stateProvince} onChange={set(i, 'stateProvince')} placeholder="MI" /></Field>
            <Field label="Country" required><input className={inputCls} value={row.country} onChange={set(i, 'country')} placeholder="USA" /></Field>
            <Field label="Postal Code"><input className={inputCls} value={row.postalCode} onChange={set(i, 'postalCode')} placeholder="48201" /></Field>
            <Field label="Latitude"><input className={inputCls} value={row.latitude} onChange={set(i, 'latitude')} placeholder="42.3314" /></Field>
            <Field label="Longitude"><input className={inputCls} value={row.longitude} onChange={set(i, 'longitude')} placeholder="-83.0458" /></Field>
            <Field label="Capacity (units)" required><input className={inputCls} type="number" value={row.productionCapacityUnits} onChange={set(i, 'productionCapacityUnits')} placeholder="1000" /></Field>
            <Field label="Capacity Period" required>
              <select className={selectCls} value={row.capacityPeriod} onChange={set(i, 'capacityPeriod')}>
                <option value="hour">Per Hour</option>
                <option value="day">Per Day</option>
                <option value="week">Per Week</option>
                <option value="month">Per Month</option>
              </select>
            </Field>
            <Field label="Unit Production Time (min)" required><input className={inputCls} type="number" value={row.unitProductionTimeMinutes} onChange={set(i, 'unitProductionTimeMinutes')} placeholder="5.5" /></Field>
            <Field label="Unit Cost" required><input className={inputCls} type="number" value={row.unitCost} onChange={set(i, 'unitCost')} placeholder="12.50" /></Field>
            <Field label="Fixed Cost (per period)"><input className={inputCls} type="number" value={row.fixedCost} onChange={set(i, 'fixedCost')} placeholder="5000.00" /></Field>
            <Field label="Currency">
              <select className={selectCls} value={row.currency} onChange={set(i, 'currency')}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
                <option value="CNY">CNY</option>
              </select>
            </Field>
            <Field label="Min Order Qty"><input className={inputCls} type="number" value={row.minimumOrderQuantity} onChange={set(i, 'minimumOrderQuantity')} placeholder="100" /></Field>
            <Field label="Max Order Qty"><input className={inputCls} type="number" value={row.maximumOrderQuantity} onChange={set(i, 'maximumOrderQuantity')} placeholder="10000" /></Field>
            <Field label="Lead Time (days)"><input className={inputCls} type="number" value={row.leadTimeDays} onChange={set(i, 'leadTimeDays')} placeholder="3" /></Field>
            <Field label="Operating Hours Start"><input className={inputCls} type="time" value={row.operatingHoursStart} onChange={set(i, 'operatingHoursStart')} /></Field>
            <Field label="Operating Hours End"><input className={inputCls} type="time" value={row.operatingHoursEnd} onChange={set(i, 'operatingHoursEnd')} /></Field>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id={`storage-${i}`} checked={row.hasStorage} onChange={set(i, 'hasStorage')} className="w-4 h-4 accent-primary" />
              <label htmlFor={`storage-${i}`} className="text-sm">Has on-site storage</label>
            </div>
            {row.hasStorage && (
              <Field label="Storage Capacity (units)"><input className={inputCls} type="number" value={row.storageCapacityUnits} onChange={set(i, 'storageCapacityUnits')} placeholder="500" /></Field>
            )}
            <div className="sm:col-span-2 md:col-span-3">
              <Field label="Notes"><textarea className={inputCls + ' resize-none'} rows={2} value={row.notes} onChange={set(i, 'notes')} placeholder="Additional constraints, certifications, or notes..." /></Field>
            </div>
            <div className="sm:col-span-2 md:col-span-3">
              <ImageUpload
                label="Facility photo"
                value={row.imageUrl}
                onChange={(url) => { const next = [...rows]; next[i] = { ...next[i], imageUrl: url }; onChange(next); }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Step 2W: Warehouses table ────────────────────────────────────────────────
function StepWarehouses({ rows, onChange }: { rows: WarehouseRow[]; onChange: (r: WarehouseRow[]) => void }) {
  const set = (i: number, k: keyof WarehouseRow) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const next = [...rows];
    next[i] = { ...next[i], [k]: e.target.value };
    onChange(next);
  };
  const add = () => onChange([...rows, emptyWarehouse()]);
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold mb-1">Warehouse Locations</h2>
          <p className="text-sm text-muted-foreground">Add one row per warehouse or storage site.</p>
        </div>
        <button type="button" onClick={add} className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shrink-0">
          <Plus className="w-4 h-4" /> Add Row
        </button>
      </div>

      {rows.map((row, i) => (
        <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border">
            <span className="text-sm font-semibold">Warehouse {i + 1}</span>
            {rows.length > 1 && (
              <button type="button" onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Warehouse Name" required><input className={inputCls} value={row.warehouseName} onChange={set(i, 'warehouseName')} placeholder="Central DC" /></Field>
            <Field label="Warehouse Code"><input className={inputCls} value={row.warehouseCode} onChange={set(i, 'warehouseCode')} placeholder="WH-01" /></Field>
            <Field label="Address Line 1" required><input className={inputCls} value={row.addressLine1} onChange={set(i, 'addressLine1')} placeholder="456 Logistics Park" /></Field>
            <Field label="City" required><input className={inputCls} value={row.city} onChange={set(i, 'city')} placeholder="Chicago" /></Field>
            <Field label="State / Province"><input className={inputCls} value={row.stateProvince} onChange={set(i, 'stateProvince')} placeholder="IL" /></Field>
            <Field label="Country" required><input className={inputCls} value={row.country} onChange={set(i, 'country')} placeholder="USA" /></Field>
            <Field label="Postal Code"><input className={inputCls} value={row.postalCode} onChange={set(i, 'postalCode')} placeholder="60601" /></Field>
            <Field label="Latitude"><input className={inputCls} value={row.latitude} onChange={set(i, 'latitude')} placeholder="41.8781" /></Field>
            <Field label="Longitude"><input className={inputCls} value={row.longitude} onChange={set(i, 'longitude')} placeholder="-87.6298" /></Field>
            <Field label="Total Capacity (CBM)" required><input className={inputCls} type="number" value={row.totalCapacityCbm} onChange={set(i, 'totalCapacityCbm')} placeholder="5000" /></Field>
            <Field label="Available Capacity (CBM)"><input className={inputCls} type="number" value={row.availableCapacityCbm} onChange={set(i, 'availableCapacityCbm')} placeholder="3200" /></Field>
            <Field label="Cost / CBM / Day"><input className={inputCls} type="number" value={row.costPerCbmPerDay} onChange={set(i, 'costPerCbmPerDay')} placeholder="0.85" /></Field>
            <Field label="Currency">
              <select className={selectCls} value={row.currency} onChange={set(i, 'currency')}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
                <option value="CNY">CNY</option>
              </select>
            </Field>
            <Field label="Handling Capacity (units/day)"><input className={inputCls} type="number" value={row.handlingCapacityUnitsPerDay} onChange={set(i, 'handlingCapacityUnitsPerDay')} placeholder="2000" /></Field>
            <div className="sm:col-span-2 md:col-span-3">
              <Field label="Notes"><textarea className={inputCls + ' resize-none'} rows={2} value={row.notes} onChange={set(i, 'notes')} placeholder="Storage types, certifications, special conditions..." /></Field>
            </div>
            <div className="sm:col-span-2 md:col-span-3">
              <ImageUpload
                label="Warehouse photo"
                value={row.imageUrl}
                onChange={(url) => { const next = [...rows]; next[i] = { ...next[i], imageUrl: url }; onChange(next); }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Step 2T: Transport table ─────────────────────────────────────────────────
function StepTransport({ rows, onChange }: { rows: TransportRow[]; onChange: (r: TransportRow[]) => void }) {
  const set = (i: number, k: keyof TransportRow) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const next = [...rows];
    next[i] = { ...next[i], [k]: e.target.value };
    onChange(next);
  };
  const add = () => onChange([...rows, emptyTransport()]);
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold mb-1">Transport Routes</h2>
          <p className="text-sm text-muted-foreground">Add one row per origin-destination lane you operate.</p>
        </div>
        <button type="button" onClick={add} className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shrink-0">
          <Plus className="w-4 h-4" /> Add Row
        </button>
      </div>

      {rows.map((row, i) => (
        <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border">
            <span className="text-sm font-semibold">Route {i + 1}</span>
            {rows.length > 1 && (
              <button type="button" onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Route Name" required><input className={inputCls} value={row.routeName} onChange={set(i, 'routeName')} placeholder="Detroit → Chicago" /></Field>
            <Field label="Route Code"><input className={inputCls} value={row.routeCode} onChange={set(i, 'routeCode')} placeholder="RT-001" /></Field>
            <Field label="Transport Mode" required>
              <select className={selectCls} value={row.transportMode} onChange={set(i, 'transportMode')}>
                <option value="road">Road</option>
                <option value="rail">Rail</option>
                <option value="sea">Sea</option>
                <option value="air">Air</option>
                <option value="multimodal">Multimodal</option>
              </select>
            </Field>
            <Field label="Origin City" required><input className={inputCls} value={row.originCity} onChange={set(i, 'originCity')} placeholder="Detroit" /></Field>
            <Field label="Origin Country" required><input className={inputCls} value={row.originCountry} onChange={set(i, 'originCountry')} placeholder="USA" /></Field>
            <Field label="Destination City" required><input className={inputCls} value={row.destinationCity} onChange={set(i, 'destinationCity')} placeholder="Chicago" /></Field>
            <Field label="Destination Country" required><input className={inputCls} value={row.destinationCountry} onChange={set(i, 'destinationCountry')} placeholder="USA" /></Field>
            <Field label="Vehicle Type"><input className={inputCls} value={row.vehicleType} onChange={set(i, 'vehicleType')} placeholder="40ft Container" /></Field>
            <Field label="Transit Time (days)" required><input className={inputCls} type="number" value={row.transitTimeDays} onChange={set(i, 'transitTimeDays')} placeholder="1.5" /></Field>
            <Field label="Capacity (units)"><input className={inputCls} type="number" value={row.capacityUnits} onChange={set(i, 'capacityUnits')} placeholder="500" /></Field>
            <Field label="Capacity Weight (kg)"><input className={inputCls} type="number" value={row.capacityWeightKg} onChange={set(i, 'capacityWeightKg')} placeholder="20000" /></Field>
            <Field label="Capacity Volume (CBM)"><input className={inputCls} type="number" value={row.capacityVolumeCbm} onChange={set(i, 'capacityVolumeCbm')} placeholder="67.5" /></Field>
            <Field label="Cost / Unit"><input className={inputCls} type="number" value={row.costPerUnit} onChange={set(i, 'costPerUnit')} placeholder="2.50" /></Field>
            <Field label="Cost / kg"><input className={inputCls} type="number" value={row.costPerKg} onChange={set(i, 'costPerKg')} placeholder="0.12" /></Field>
            <Field label="Currency">
              <select className={selectCls} value={row.currency} onChange={set(i, 'currency')}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
                <option value="CNY">CNY</option>
              </select>
            </Field>
            <Field label="Frequency">
              <select className={selectCls} value={row.frequency} onChange={set(i, 'frequency')}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="on-demand">On-demand</option>
              </select>
            </Field>
            <div className="sm:col-span-2 md:col-span-3">
              <Field label="Notes"><textarea className={inputCls + ' resize-none'} rows={2} value={row.notes} onChange={set(i, 'notes')} placeholder="Special cargo types, restrictions, certifications..." /></Field>
            </div>
            <div className="sm:col-span-2 md:col-span-3">
              <ImageUpload
                label="Vehicle / route photo"
                value={row.imageUrl}
                onChange={(url) => { const next = [...rows]; next[i] = { ...next[i], imageUrl: url }; onChange(next); }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main wizard ──────────────────────────────────────────────────────────────
function RegisterContent() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const [company, setCompany] = useState<CompanyForm>({
    companyName: '', companyType: '', registrationNumber: '', contactEmail: '', contactPhone: '', website: '', description: '', imageUrl: '',
  });
  const [facilities, setFacilities] = useState<FacilityRow[]>([emptyFacility()]);
  const [warehouses, setWarehouses] = useState<WarehouseRow[]>([emptyWarehouse()]);
  const [transports, setTransports] = useState<TransportRow[]>([emptyTransport()]);

  const totalSteps = 2;

  function canNext() {
    if (step === 0) return !!company.companyName && !!company.companyType && !!company.contactEmail;
    return true;
  }

  // Skip asset rows that are missing any required field — don't send partial rows to the API
  function isFacilityReady(f: FacilityRow) {
    return !!(f.facilityName && f.addressLine1 && f.city && f.country &&
      f.productType && f.productionCapacityUnits && f.unitProductionTimeMinutes && f.unitCost);
  }
  function isWarehouseReady(w: WarehouseRow) {
    return !!(w.warehouseName && w.addressLine1 && w.city && w.country && w.totalCapacityCbm);
  }
  function isTransportReady(t: TransportRow) {
    return !!(t.routeName && t.originCity && t.originCountry &&
      t.destinationCity && t.destinationCountry && t.transitTimeDays);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      // 1. Create company
      const companyRes = await fetch('/api/gridspace/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company),
      });
      const companyData = await companyRes.json();
      if (!companyRes.ok) {
        throw new Error(companyData.message || companyData.error || 'Failed to create company');
      }
      // Raw SQL returns snake_case; id column name is the same
      const createdCompanyId = companyData.id ?? companyData.insertId;

      // 2. Create asset records — only rows where all required fields are filled
      if (company.companyType === 'manufacturer') {
        for (const f of facilities.filter(isFacilityReady)) {
          const r = await fetch('/api/gridspace/facilities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...f, companyId: createdCompanyId }),
          });
          if (!r.ok) {
            const errData = await r.json().catch(() => ({}));
            throw new Error(errData.message || errData.error || 'Failed to create facility');
          }
        }
      }
      if (company.companyType === 'warehouse') {
        for (const w of warehouses.filter(isWarehouseReady)) {
          const r = await fetch('/api/gridspace/warehouses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...w, companyId: createdCompanyId }),
          });
          if (!r.ok) {
            const errData = await r.json().catch(() => ({}));
            throw new Error(errData.message || errData.error || 'Failed to create warehouse');
          }
        }
      }
      if (company.companyType === 'transport') {
        for (const t of transports.filter(isTransportReady)) {
          const r = await fetch('/api/gridspace/transport', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...t, companyId: createdCompanyId }),
          });
          if (!r.ok) {
            const errData = await r.json().catch(() => ({}));
            throw new Error(errData.message || errData.error || 'Failed to create transport route');
          }
        }
      }

      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Registration Complete</h2>
          <p className="text-muted-foreground mb-8">Your company and all associated records have been saved to the GridSpace network.</p>
          <button onClick={() => navigate('/gridspace/dashboard')} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Go to Dashboard <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Register Company — GridSpace | AlternMind</title>
        <meta name="description" content="Register your company on GridSpace. Add production facilities, warehouses, or transport routes to the supply chain optimization network." />
        <link rel="canonical" href="https://gridsspace.alternmind.com/gridspace/register" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground gs-light-theme">
        {/* Header */}
        <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <button onClick={() => navigate('/gridspace/dashboard')} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Dashboard
            </button>
            <div className="flex items-center gap-2">
              {[0, 1].map((s) => (
                <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? 'w-8 bg-primary' : s < step ? 'w-4 bg-primary/50' : 'w-4 bg-border'}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">Step {step + 1} of {totalSteps + 1}</span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10">
          <h1 className="sr-only">Register Company on GridSpace</h1>
          {step === 0 && <StepCompany form={company} onChange={setCompany} />}
          {step === 1 && company.companyType === 'manufacturer' && <StepFacilities rows={facilities} onChange={setFacilities} />}
          {step === 1 && company.companyType === 'warehouse' && <StepWarehouses rows={warehouses} onChange={setWarehouses} />}
          {step === 1 && company.companyType === 'transport' && <StepTransport rows={transports} onChange={setTransports} />}

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">{error}</div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < totalSteps ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Complete Registration'}
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function GridSpaceRegister() {
  return (
    <ProtectedRoute>
      <RegisterContent />
    </ProtectedRoute>
  );
}
