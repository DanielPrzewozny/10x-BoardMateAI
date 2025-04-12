```markdown
# Database Schema for BoardMate AI

## 1. Tables

### Users
This table is managed by Supabase Auth.
- **id**: UUID (Primary Key)
- **firstName**: VARCHAR(50) NOT NULL
- **lastName**: VARCHAR(50) NOT NULL
- **email**: VARCHAR(100) UNIQUE NOT NULL
- **passwordHash**: VARCHAR(255) NOT NULL
- **preferredTypes**: TEXT[] (Array of GameTypes)
- **createdAt**: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- **lastLogin**: TIMESTAMP
- **accountStatus**: UUID (Foreign Key to AccountStatus.id)

### AccountStatus
- **id**: UUID (Primary Key)
- **status**: VARCHAR(20) NOT NULL (Values: active, suspended, deleted)
- **changedAt**: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### BoardGames
- **id**: UUID (Primary Key)
- **title**: VARCHAR(100) NOT NULL
- **complexity**: INTEGER CHECK (complexity BETWEEN 1 AND 5)
- **min_players**: INTEGER CHECK (min_players > 0)
- **max_players**: INTEGER CHECK (max_players > min_players)
- **duration**: INTEGER NOT NULL
- **description**: TEXT
- **isArchived**: BOOLEAN DEFAULT FALSE

### GameTypes
- **id**: UUID (Primary Key)
- **type**: VARCHAR(50) NOT NULL

### BoardGameTypes
- **gameId**: UUID (Foreign Key to BoardGames.id)
- **typeId**: UUID (Foreign Key to GameTypes.id)

### Reviews
- **id**: UUID (Primary Key)
- **userId**: UUID (Foreign Key to Users.id)
- **gameId**: UUID (Foreign Key to BoardGames.id)
- **reviewText**: TEXT NOT NULL
- **createdAt**: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- **updatedAt**: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- **helpfulVotes**: INTEGER DEFAULT 0

### Ratings
- **id**: UUID (Primary Key)
- **userId**: UUID (Foreign Key to Users.id)
- **gameId**: UUID (Foreign Key to BoardGames.id)
- **ratingValue**: INTEGER CHECK (ratingValue BETWEEN 1 AND 5)

### GameHistory
- **userId**: UUID (Foreign Key to Users.id)
- **gameId**: UUID (Foreign Key to BoardGames.id)
- **playedAt**: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- **durationPlayed**: INTEGER NOT NULL
- **interactionType**: VARCHAR(20) NOT NULL (Values: played, abandoned, recommended)
- **sessionDuration**: INTEGER NOT NULL
- **score**: INTEGER
- **notes**: TEXT

### GameMechanics
- **id**: UUID (Primary Key)
- **mechanic**: VARCHAR(50) NOT NULL (Values: Deck-building, worker placement, area control, drafting, push-your-luck, tile placement, auction, resource management, hand management, set collection, dice rolling, cooperative play, action selection, grid movement)
- **description**: TEXT (Short description to each value)

## 2. Relationships
- **Users** to **Reviews**: One-to-Many (One user can have many reviews)
- **Users** to **Ratings**: One-to-Many (One user can rate many games)
- **BoardGames** to **Reviews**: One-to-Many (One game can have many reviews)
- **BoardGames** to **Ratings**: One-to-Many (One game can have many ratings)
- **BoardGames** to **GameMechanics**: Many-to-Many (One game can have multiple mechanics, and one mechanic can belong to multiple games)
- **Users** to **GameHistory**: One-to-Many (One user can have many game history records)

## 3. Indexes
- Index on **Users.id**
- Index on **BoardGames.title**
- Index on **Reviews.userId**
- Index on **Ratings.userId**
- Index on **GameHistory.userId**
- Index on **GameHistory.gameId**

## 4. PostgreSQL Rules
- Implement Row-Level Security (RLS) to ensure users can only access their own data.
- Use bcrypt for password hashing and enforce strong password policies.

## 5. Additional Notes
- Ensure that all foreign key relationships are enforced to maintain data integrity.
- Regularly review and update the GameMechanics table to reflect new game mechanics as they become popular.
```
