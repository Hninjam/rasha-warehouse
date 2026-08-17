-- Basic schema (extend as needed)
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  personnel_code TEXT NOT NULL,
  full_name TEXT,
  password_hash TEXT NOT NULL,
  role TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS warehouses (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL,
  title TEXT
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id SERIAL PRIMARY KEY,
  warehouse_id INTEGER REFERENCES warehouses(id),
  product_code TEXT NOT NULL,
  title TEXT,
  spec TEXT,
  nature TEXT,
  unit TEXT,
  system_qty NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (warehouse_id, product_code)
);

CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  warehouse_id INTEGER REFERENCES warehouses(id),
  shelf TEXT,
  row TEXT,
  floor TEXT,
  full_location TEXT
);

CREATE TABLE IF NOT EXISTS stocktake_records (
  id SERIAL PRIMARY KEY,
  inventory_item_id INTEGER REFERENCES inventory_items(id),
  operator_id INTEGER REFERENCES users(id),
  physical_qty NUMERIC,
  discrepancy NUMERIC,
  location_id INTEGER REFERENCES locations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  synced BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  actor_id INTEGER,
  personnel_code TEXT,
  action TEXT,
  target_table TEXT,
  target_id INTEGER,
  prev JSONB,
  next JSONB,
  ip TEXT,
  device_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
