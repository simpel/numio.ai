-- Migrations will appear here as you chat with AI

create table profiles (
  id bigint primary key generated always as identity,
	created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  first_name text not null,
  last_name text not null,
	is_public boolean default false,
  avatar text
);

create table roles (
  id bigint primary key generated always as identity,
  name text not null
);

create table profile_roles (
  profile_id bigint references profiles (id),
  role_id bigint references roles (id),
  primary key (profile_id, role_id)
);

alter table roles
add column description text;

create table companies (
  id bigint primary key generated always as identity,
  name text not null,
  url text,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table projects (
  id bigint primary key generated always as identity,
  company_id bigint references companies (id),
  name text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table profile_companies (
  profile_id bigint references profiles (id),
  company_id bigint references companies (id),
  primary key (profile_id, company_id)
);

create table project_profiles (
  project_id bigint references projects (id),
  profile_id bigint references profiles (id),
  primary key (project_id, profile_id)
);