-- Migration file: supabase/migrations/20240321143000_initial_schema.sql

-- Description: Initial database schema setup for BoardMate AI
-- Creates tables for user profiles, account status, board games, game types, reviews, ratings,
-- game history, and game mechanics with appropriate relationships and RLS policies.

-- enable uuid extension
create extension if not exists "uuid-ossp";

-- create account status enum
create type account_status as enum ('active', 'suspended', 'deleted');

-- create profiles table
create table profiles (
    id uuid references auth.users(id) primary key,
    first_name varchar(50) not null,
    last_name varchar(50) not null,
    preferred_types text[],
    created_at timestamp with time zone default now(),
    last_login timestamp with time zone,
    account_status account_status default 'active',
    updated_at timestamp with time zone default now()
);

-- enable rls on profiles
alter table profiles enable row level security;

-- create profiles policies
create policy "Public profiles are viewable by everyone"
    on profiles for select
    to anon, authenticated
    using (true);

create policy "Users can insert their own profile"
    on profiles for insert
    to authenticated
    with check (auth.uid() = id);

create policy "Users can update their own profile"
    on profiles for update
    to authenticated
    using (auth.uid() = id)
    with check (auth.uid() = id);

-- create board_games table
create table board_games (
    id uuid primary key default uuid_generate_v4(),
    title varchar(100) not null,
    complexity integer check (complexity between 1 and 5),
    min_players integer check (min_players > 0),
    max_players integer check (max_players > min_players),
    duration integer not null,
    description text,
    is_archived boolean default false,
    created_at timestamp with time zone default now()
);

-- enable rls
alter table board_games enable row level security;

-- create game_types table
create table game_types (
    id uuid primary key default uuid_generate_v4(),
    type varchar(50) not null unique
);

insert into game_types (type) values
    ('strategy'),          -- Games that emphasize strategic planning and decision making
    ('cooperative'),       -- Games where players work together against the game
    ('party'),            -- Light, social games designed for larger groups
    ('competitive'),       -- Games where players directly compete against each other
    ('family'),           -- Games suitable for all ages and family play
    ('abstract'),         -- Games with minimal theme, focusing on mechanics
    ('card_game'),        -- Games primarily using cards as the main component
    ('educational'),      -- Games designed to teach while entertaining
    ('puzzle'),           -- Games focusing on problem-solving
    ('adventure'),        -- Games with strong narrative elements
    ('economic'),         -- Games focusing on resource and money management
    ('war_game'),         -- Games simulating military conflicts
    ('dice_game'),        -- Games primarily using dice as the main component
    ('miniature'),        -- Games using miniature figures
    ('role_playing'),     -- Games where players take on specific character roles
    ('trivia'),          -- Knowledge-based question and answer games
    ('dexterity'),       -- Games requiring physical skill
    ('word_game');       -- Games focusing on word creation or manipulation

-- enable rls
alter table game_types enable row level security;

-- create board_game_types junction table
create table board_game_types (
    game_id uuid references board_games(id) on delete cascade,
    type_id uuid references game_types(id) on delete cascade,
    primary key (game_id, type_id)
);

-- enable rls
alter table board_game_types enable row level security;

-- create reviews table
create table reviews (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade,
    game_id uuid references board_games(id) on delete cascade,
    review_text text not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    helpful_votes integer default 0,
    unique(user_id, game_id)
);

-- enable rls
alter table reviews enable row level security;

-- create ratings table
create table ratings (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade,
    game_id uuid references board_games(id) on delete cascade,
    rating_value integer check (rating_value between 1 and 5),
    unique(user_id, game_id)
);

-- enable rls
alter table ratings enable row level security;

-- create interaction_type enum
create type interaction_type as enum ('played', 'abandoned', 'recommended');

-- create game_history table
create table game_history (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade,
    game_id uuid references board_games(id) on delete cascade,
    played_at timestamp with time zone default now(),
    duration_played integer not null,
    interaction_type interaction_type not null,
    session_duration integer not null,
    score integer,
    notes text
);

-- enable rls
alter table game_history enable row level security;

-- create game_mechanics table
create table game_mechanics (
    id uuid primary key default uuid_generate_v4(),
    mechanic varchar(50) not null unique,
    description text
);

-- enable rls
alter table game_mechanics enable row level security;

insert into game_mechanics (mechanic, description) values
    ('Deck-building', 'Players start with a basic deck of cards and acquire more powerful cards throughout the game to create more effective combinations and strategies.'),
    ('Worker placement', 'Players allocate a limited number of worker pieces to various action spaces on the board to perform specific actions or gather resources.'),
    ('Area control', 'Players compete to dominate specific regions or territories on the game board by placing pieces or exerting influence.'),
    ('Drafting', 'Players select cards or components from a shared pool, passing the remaining options to other players, requiring strategic choice and timing.'),
    ('Push-your-luck', 'Players repeatedly press their luck by taking actions that offer greater rewards but also increasing risk of failure.'),
    ('Tile placement', 'Players strategically place tiles on the board to create patterns, territories, or pathways to score points.'),
    ('Auction', 'Players bid resources or points to acquire cards, tiles, or other game elements, requiring value assessment and resource management.'),
    ('Resource management', 'Players must efficiently collect, spend, and convert various resources to achieve victory conditions.'),
    ('Hand management', 'Players must make strategic decisions about which cards to play, hold, or discard from their hand.'),
    ('Set collection', 'Players gather specific combinations of cards or components to complete sets and score points.'),
    ('Dice rolling', 'Players roll dice to determine actions, movement, or resource collection, often with ways to mitigate luck.'),
    ('Cooperative play', 'Players work together against the game itself, requiring coordination and shared strategy to win.'),
    ('Action selection', 'Players choose from a set of available actions each turn, often with limitations or increasing costs.'),
    ('Grid movement', 'Players move pieces on a grid-based board, often with specific movement patterns or restrictions.');

-- create policy for read-only access to game mechanics
create policy "Game mechanics are read-only for all users"
    on game_mechanics for select
    to anon, authenticated
    using (true); 

-- create indexes
create index idx_board_games_title on board_games(title);
create index idx_reviews_user_id on reviews(user_id);
create index idx_ratings_user_id on ratings(user_id);
create index idx_game_history_user_id on game_history(user_id);
create index idx_game_history_game_id on game_history(game_id);

-- create rls policies

-- board_games policies
create policy "Board games are viewable by everyone"
    on board_games for select
    to anon, authenticated
    using (true);

-- game_types policies
create policy "Game types are viewable by everyone"
    on game_types for select
    to anon, authenticated
    using (true);

-- reviews policies
create policy "Users can view all reviews"
    on reviews for select
    to anon, authenticated
    using (true);

create policy "Users can create their own reviews"
    on reviews for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own reviews"
    on reviews for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own reviews"
    on reviews for delete
    to authenticated
    using (auth.uid() = user_id);

-- ratings policies
create policy "Users can view all ratings"
    on ratings for select
    to anon, authenticated
    using (true);

create policy "Users can create their own ratings"
    on ratings for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own ratings"
    on ratings for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own ratings"
    on ratings for delete
    to authenticated
    using (auth.uid() = user_id);

-- game_history policies
create policy "Users can view their own game history"
    on game_history for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can create their own game history"
    on game_history for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own game history"
    on game_history for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- game_mechanics policies
create policy "Game mechanics are viewable by everyone"
    on game_mechanics for select
    to anon, authenticated
    using (true); 