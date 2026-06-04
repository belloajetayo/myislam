-- Enable PostGIS extension if not already enabled
create extension if not exists postgis;

-- Create mosques table
create table if not exists public.mosques (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    address text,
    geom geography(point, 4326) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create spatial GIST index on the geom column for performant queries
create index if not exists mosques_geom_gist on public.mosques using gist (geom);

-- Enable Row Level Security (RLS)
alter table public.mosques enable row level security;

-- Policies: public can SELECT, only authenticated users can INSERT
create policy "Allow public SELECT"
on public.mosques for select
to public
using (true);

create policy "Allow authenticated INSERT"
on public.mosques for insert
to authenticated
with check (true);

-- RPC Function: mosques_near(lat, lng, radius_m)
-- Uses ST_DWithin (utilizes index) + ST_Distance (for distance calculation)
-- Limited to 15 rows to maximize mobile rendering performance
create or replace function public.mosques_near(
    lat double precision,
    lng double precision,
    radius_m double precision
)
returns table (
    id uuid,
    name text,
    address text,
    lat double precision,
    lng double precision,
    distance double precision
) 
language plpgsql 
security definer
as $$
begin
    return query
    select
        m.id,
        m.name,
        m.address,
        st_y(m.geom::geometry) as lat,
        st_x(m.geom::geometry) as lng,
        st_distance(m.geom, st_setsrid(st_makepoint(lng, lat), 4326)::geography) as distance
    from
        public.mosques m
    where
        st_dwithin(m.geom, st_setsrid(st_makepoint(lng, lat), 4326)::geography, radius_m)
    order by
        distance asc
    limit 15;
end;
$$;
