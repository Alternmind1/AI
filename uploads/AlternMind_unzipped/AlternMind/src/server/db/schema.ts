import { mysqlTable, varchar, boolean, text, timestamp, int, decimal } from 'drizzle-orm/mysql-core';

export const user = mysqlTable('user', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  image: text('image'),
  isAdmin: boolean('is_admin').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const session = mysqlTable('session', {
  id: varchar('id', { length: 36 }).primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const account = mysqlTable('account', {
  id: varchar('id', { length: 36 }).primaryKey(),
  accountId: varchar('account_id', { length: 255 }).notNull(),
  providerId: varchar('provider_id', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: varchar('password', { length: 255 }),
  issuer: varchar('issuer', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const verification = mysqlTable('verification', {
  id: varchar('id', { length: 36 }).primaryKey(),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  value: varchar('value', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ─── GridSpace Tables ────────────────────────────────────────────────────────

// Registered companies (manufacturers, warehouse providers, transport companies)
export const gsCompany = mysqlTable('gs_company', {
  id: int('id').primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  companyType: varchar('company_type', { length: 50 }).notNull(), // 'manufacturer' | 'warehouse' | 'transport'
  registrationNumber: varchar('registration_number', { length: 100 }),
  contactEmail: varchar('contact_email', { length: 255 }).notNull(),
  contactPhone: varchar('contact_phone', { length: 50 }),
  website: varchar('website', { length: 255 }),
  description: text('description'),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Production facilities (for manufacturers)
export const gsFacility = mysqlTable('gs_facility', {
  id: int('id').primaryKey().autoincrement(),
  companyId: int('company_id').notNull().references(() => gsCompany.id, { onDelete: 'cascade' }),
  facilityName: varchar('facility_name', { length: 255 }).notNull(),
  facilityCode: varchar('facility_code', { length: 50 }),
  imageUrl: text('image_url'),
  // Geographic location
  addressLine1: varchar('address_line1', { length: 255 }).notNull(),
  addressLine2: varchar('address_line2', { length: 255 }),
  city: varchar('city', { length: 100 }).notNull(),
  stateProvince: varchar('state_province', { length: 100 }),
  country: varchar('country', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  // Production details
  productType: varchar('product_type', { length: 255 }).notNull(),
  productCategory: varchar('product_category', { length: 100 }),
  productionCapacityUnits: int('production_capacity_units').notNull(), // units per period
  capacityPeriod: varchar('capacity_period', { length: 20 }).notNull().default('day'), // 'hour'|'day'|'week'|'month'
  unitProductionTimeMinutes: decimal('unit_production_time_minutes', { precision: 10, scale: 2 }).notNull(),
  unitCost: decimal('unit_cost', { precision: 12, scale: 4 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('USD'),
  // Storage
  hasStorage: boolean('has_storage').default(false),
  storageCapacityUnits: int('storage_capacity_units'),
  storageCapacityVolumeCbm: decimal('storage_capacity_volume_cbm', { precision: 12, scale: 2 }),
  // Constraints / notes
  minimumOrderQuantity: int('minimum_order_quantity'),
  maximumOrderQuantity: int('maximum_order_quantity'),
  leadTimeDays: int('lead_time_days'),
  operatingHoursStart: varchar('operating_hours_start', { length: 10 }),
  operatingHoursEnd: varchar('operating_hours_end', { length: 10 }),
  certifications: text('certifications'), // JSON array stored as text
  notes: text('notes'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Warehouse providers
export const gsWarehouse = mysqlTable('gs_warehouse', {
  id: int('id').primaryKey().autoincrement(),
  companyId: int('company_id').notNull().references(() => gsCompany.id, { onDelete: 'cascade' }),
  warehouseName: varchar('warehouse_name', { length: 255 }).notNull(),
  warehouseCode: varchar('warehouse_code', { length: 50 }),
  imageUrl: text('image_url'),
  addressLine1: varchar('address_line1', { length: 255 }).notNull(),
  addressLine2: varchar('address_line2', { length: 255 }),
  city: varchar('city', { length: 100 }).notNull(),
  stateProvince: varchar('state_province', { length: 100 }),
  country: varchar('country', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  totalCapacityCbm: decimal('total_capacity_cbm', { precision: 12, scale: 2 }).notNull(),
  availableCapacityCbm: decimal('available_capacity_cbm', { precision: 12, scale: 2 }),
  storageTypes: text('storage_types'), // JSON: ['ambient','cold','hazmat',...]
  costPerCbmPerDay: decimal('cost_per_cbm_per_day', { precision: 10, scale: 4 }),
  currency: varchar('currency', { length: 10 }).notNull().default('USD'),
  handlingCapacityUnitsPerDay: int('handling_capacity_units_per_day'),
  certifications: text('certifications'),
  notes: text('notes'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Transportation providers
export const gsTransport = mysqlTable('gs_transport', {
  id: int('id').primaryKey().autoincrement(),
  companyId: int('company_id').notNull().references(() => gsCompany.id, { onDelete: 'cascade' }),
  routeName: varchar('route_name', { length: 255 }).notNull(),
  routeCode: varchar('route_code', { length: 50 }),
  imageUrl: text('image_url'),
  originCity: varchar('origin_city', { length: 100 }).notNull(),
  originCountry: varchar('origin_country', { length: 100 }).notNull(),
  destinationCity: varchar('destination_city', { length: 100 }).notNull(),
  destinationCountry: varchar('destination_country', { length: 100 }).notNull(),
  transportMode: varchar('transport_mode', { length: 50 }).notNull(), // 'road'|'rail'|'sea'|'air'|'multimodal'
  vehicleType: varchar('vehicle_type', { length: 100 }),
  capacityUnits: int('capacity_units'),
  capacityWeightKg: decimal('capacity_weight_kg', { precision: 12, scale: 2 }),
  capacityVolumeCbm: decimal('capacity_volume_cbm', { precision: 12, scale: 2 }),
  costPerUnit: decimal('cost_per_unit', { precision: 12, scale: 4 }),
  costPerKg: decimal('cost_per_kg', { precision: 10, scale: 4 }),
  currency: varchar('currency', { length: 10 }).notNull().default('USD'),
  transitTimeDays: decimal('transit_time_days', { precision: 6, scale: 1 }).notNull(),
  frequency: varchar('frequency', { length: 50 }), // 'daily'|'weekly'|'on-demand'
  certifications: text('certifications'),
  notes: text('notes'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Optimization jobs
export const gsOptimizationJob = mysqlTable('gs_optimization_job', {
  id: int('id').primaryKey().autoincrement(),
  companyId: int('company_id').notNull().references(() => gsCompany.id, { onDelete: 'cascade' }),
  jobName: varchar('job_name', { length: 255 }).notNull(),
  status: varchar('status', { length: 30 }).notNull().default('pending'), // 'pending'|'running'|'completed'|'failed'
  objectiveFunction: varchar('objective_function', { length: 50 }).notNull().default('minimize_cost'), // 'minimize_cost'|'minimize_time'|'balance'
  constraints: text('constraints'), // JSON
  inputPayload: text('input_payload'), // JSON sent to optimizer
  resultPayload: text('result_payload'), // JSON returned from optimizer
  errorMessage: text('error_message'),
  submittedAt: timestamp('submitted_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
