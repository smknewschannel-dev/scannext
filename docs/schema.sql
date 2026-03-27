create extension if not exists "pgcrypto";

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  ip inet not null,
  hostname text,
  criticality int default 3,
  created_at timestamptz default now()
);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  asset_id uuid references assets(id),
  severity text not null,
  title text not null,
  status text not null default 'open',
  created_at timestamptz default now()
);
