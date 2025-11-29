-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store product embeddings
create table if not exists product_embeddings (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  content text, -- Text representation of the product (name + description)
  embedding vector(768), -- Gemini embedding dimension is 768
  created_at timestamptz default now()
);

-- Create a function to search for products by embedding similarity
create or replace function match_products (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  product_id uuid,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    product_embeddings.id,
    product_embeddings.product_id,
    product_embeddings.content,
    1 - (product_embeddings.embedding <=> query_embedding) as similarity
  from product_embeddings
  where 1 - (product_embeddings.embedding <=> query_embedding) > match_threshold
  order by product_embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Create the storage bucket for product images (if it doesn't exist)
insert into storage.buckets (id, name, public)
values ('productImage', 'productImage', true)
on conflict (id) do nothing;

-- Allow public access to the bucket
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'productImage' );

create policy "Public Upload"
  on storage.objects for insert
  with check ( bucket_id = 'productImage' );

