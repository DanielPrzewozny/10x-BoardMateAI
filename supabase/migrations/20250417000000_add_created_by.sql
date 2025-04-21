-- Dodanie kolumny created_by do tabeli board_games
alter table public.board_games
add column if not exists created_by uuid references auth.users(id) not null default auth.uid();

-- Dodanie kolumny created_by do tabeli favorite_games
alter table public.favorite_games
add column if not exists created_by uuid references auth.users(id) not null default auth.uid();

-- Aktualizacja polityk RLS dla tabeli board_games
drop policy if exists "Users can view all games" on public.board_games;
drop policy if exists "Users can add games" on public.board_games;

create policy "Users can view all games"
    on public.board_games for select
    using (true);

create policy "Users can add games"
    on public.board_games for insert
    with check (auth.uid() = created_by);

-- Aktualizacja polityk RLS dla tabeli favorite_games
drop policy if exists "Users can manage their favorites" on public.favorite_games;

create policy "Users can manage their favorites"
    on public.favorite_games for all
    using (auth.uid() = created_by)
    with check (auth.uid() = created_by);

-- Dodanie indeksów dla optymalizacji zapytań
create index if not exists board_games_created_by_idx on public.board_games(created_by);
create index if not exists favorite_games_created_by_idx on public.favorite_games(created_by); 
alter table public.board_games
add column if not exists created_by uuid references auth.users(id) not null default auth.uid();

-- Dodanie kolumny created_by do tabeli favorite_games
alter table public.favorite_games
add column if not exists created_by uuid references auth.users(id) not null default auth.uid();

-- Aktualizacja polityk RLS dla tabeli board_games
drop policy if exists "Users can view all games" on public.board_games;
drop policy if exists "Users can add games" on public.board_games;

create policy "Users can view all games"
    on public.board_games for select
    using (true);

create policy "Users can add games"
    on public.board_games for insert
    with check (auth.uid() = created_by);

create policy "Users can modify their own games"
    on public.board_games for update
    using (auth.uid() = created_by)
    with check (auth.uid() = created_by);

-- Aktualizacja polityk RLS dla tabeli favorite_games
drop policy if exists "Users can manage their favorites" on public.favorite_games;

create policy "Users can manage their favorites"
    on public.favorite_games for all
    using (auth.uid() = created_by)
    with check (auth.uid() = created_by);

-- Dodanie indeksów dla optymalizacji zapytań
create index if not exists board_games_created_by_idx on public.board_games(created_by);
create index if not exists favorite_games_created_by_idx on public.favorite_games(created_by);