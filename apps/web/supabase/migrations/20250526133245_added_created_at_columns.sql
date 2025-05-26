alter table profile_roles
add column created_at timestamp with time zone default now(),
add column updated_at timestamp with time zone default now();

alter table profile_companies
add column created_at timestamp with time zone default now(),
add column updated_at timestamp with time zone default now();

alter table project_profiles
add column created_at timestamp with time zone default now(),
add column updated_at timestamp with time zone default now();

alter table roles
add column created_at timestamp with time zone default now(),
add column updated_at timestamp with time zone default now();


