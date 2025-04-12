-- Migration: Create recommendation_error_logs table
-- Description: Creates the recommendation_error_logs table with RLS policies
-- Author: AI Assistant
-- Date: 2025-04-12

-- Create the recommendation_error_logs table
create table public.recommendation_error_logs (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    description_hash varchar not null,
    description_length integer not null check (description_length between 1000 and 10000),
    error_code varchar(100) not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

-- Create index
create index recommendation_error_logs_user_id_idx on public.recommendation_error_logs(user_id);

-- Enable Row Level Security
alter table public.recommendation_error_logs enable row level security;

-- Create RLS policies for authenticated users
create policy "Users can view their own error logs"
    on public.recommendation_error_logs
    for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can create their own error logs"
    on public.recommendation_error_logs
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Note: Update and Delete policies are intentionally omitted as error logs should be immutable

-- Comments
comment on table public.recommendation_error_logs is 'Stores error logs from games recommendation attempts';
comment on column public.recommendation_error_logs.model is 'The AI model that encountered the error';
comment on column public.recommendation_error_logs.description_hash is 'Hash of the description that caused the error';
comment on column public.recommendation_error_logs.description_length is 'Length of the description in characters';
comment on column public.recommendation_error_logs.error_code is 'Error code for categorizing the error';
comment on column public.recommendation_error_logs.error_message is 'Detailed error message';