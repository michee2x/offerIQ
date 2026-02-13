-- DANGER: This script resets your public schema for the MVP.
-- It drops existing tables to ensure the new structure (with password) is applied.

drop table if exists public.funnel_pages cascade;
drop table if exists public.funnels cascade;
drop table if exists public.offers cascade;
drop table if exists public.workspaces cascade;
drop table if exists public.users cascade;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users: Store locally
create table public.users (
  id uuid default gen_random_uuid() primary key,
  name text,
  email text unique not null,
  password text not null, -- Hashed password
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.users enable row level security;

-- Workspaces
create table public.workspaces (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.workspaces enable row level security;

-- Offers
create table public.offers (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  status text default 'draft',
  input_type text,
  input_value text,
  analysis jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Funnels
create table public.funnels (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  offer_id uuid references public.offers on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  status text default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Funnel Pages
create table public.funnel_pages (
  id uuid default gen_random_uuid() primary key,
  funnel_id uuid references public.funnels on delete cascade not null,
  name text not null,
  slug text not null,
  type text not null,
  order_index integer default 0,
  blocks jsonb,
  copy_data jsonb,
  seo jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
