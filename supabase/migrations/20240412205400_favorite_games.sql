-- Utworzenie tabeli favorite_games
create table if not exists public.favorite_games (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null references public.profiles(id) on delete cascade,
    game_id uuid not null references public.board_games(id) on delete cascade,
    notes text,
    added_at timestamp with time zone default now() not null,
    
    -- Zapobieganie duplikatom (użytkownik nie może dodać tej samej gry dwa razy)
    constraint unique_user_game unique (user_id, game_id)
);

-- Dodanie indeksów dla poprawy wydajności
create index if not exists favorite_games_user_id_idx on public.favorite_games(user_id);
create index if not exists favorite_games_game_id_idx on public.favorite_games(game_id);

-- Dodanie polityk bezpieczeństwa RLS (Row Level Security)
alter table public.favorite_games enable row level security;

-- Polityka dla odczytu (użytkownik może widzieć tylko swoje ulubione gry)
create policy "Users can view their own favorites"
    on public.favorite_games for select
    using (auth.uid() = user_id);

-- Polityka dla wstawiania
create policy "Users can add their own favorites"
    on public.favorite_games for insert
    with check (auth.uid() = user_id);

-- Polityka dla usuwania
create policy "Users can delete their own favorites"
    on public.favorite_games for delete
    using (auth.uid() = user_id);

-- Dodanie uprawnień dla authenticated użytkowników
grant all on public.favorite_games to authenticated; 