-- Aktualizacja constraintu dla liczby graczy w tabeli board_games
alter table public.board_games
    drop constraint if exists board_games_max_players_check,
    add constraint board_games_max_players_check check (max_players >= min_players); 