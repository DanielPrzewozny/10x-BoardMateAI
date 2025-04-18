<api_analysis>

1. **Main Entities from Database Schema:**
   - **Users**: 
     - Table: `Users`
     - Fields: `id`, `firstName`, `lastName`, `email`, `passwordHash`, `createdAt`, `lastLogin`, `accountStatus`
   - **AccountStatus**: 
     - Table: `AccountStatus`
     - Fields: `id`, `status`, `changedAt`
   - **BoardGames**: 
     - Table: `BoardGames`
     - Fields: `id`, `title`, `complexity`, `min_players`, `max_players`, `duration`, `description`, `isArchived`
   - **GameTypes**: 
     - Table: `GameTypes`
     - Fields: `id`, `type`
   - **BoardGameTypes**: 
     - Table: `BoardGameTypes`
     - Fields: `gameId`, `typeId`
   - **Reviews**: 
     - Table: `Reviews`
     - Fields: `id`, `userId`, `gameId`, `reviewText`, `createdAt`, `updatedAt`, `helpfulVotes`
   - **Ratings**: 
     - Table: `Ratings`
     - Fields: `id`, `userId`, `gameId`, `ratingValue`
   - **GameHistory**: 
     - Table: `GameHistory`
     - Fields: `userId`, `gameId`, `playedAt`, `durationPlayed`, `interactionType`, `sessionDuration`, `score`, `notes`
   - **GameMechanics**: 
     - Table: `GameMechanics`
     - Fields: `id`, `mechanic`, `description`

2. **Key Business Logic Features from PRD:**
   - **User Registration and Profile Management**: 
     - "Users can register and manage their profiles."
   - **Game Recommendations**: 
     - "AI analyzes given preferences and generates recommendations for board games best suited to the situation."
   - **User Reviews and Ratings**: 
     - "Users can review and rate games."
   - **Game History Tracking**: 
     - "Users can track their game interactions."

3. **Mapping PRD Features to API Endpoints:**
   - **User Registration and Profile Management**:
     - Option 1: `POST /api/users` (Create user)
     - Option 2: `PATCH /api/users/{id}` (Update user profile)
     - **Selected**: Option 2 is more RESTful for updating existing profiles.
   - **Game Recommendations**:
     - Option 1: `GET /api/recommendations` (Get recommendations based on user preferences)
     - Option 2: `POST /api/recommendations/generate` (Generate recommendations)
     - **Selected**: Option 1 is preferred for its cacheability and adherence to REST principles.
   - **User Reviews and Ratings**:
     - Option 1: `POST /api/games/{id}/reviews` (Create a review)
     - Option 2: `GET /api/games/{id}/reviews` (Get reviews for a game)
     - **Selected**: Both endpoints are necessary for full review functionality.
   - **Game History Tracking**:
     - Option 1: `GET /api/history` (Get user game history)
     - Option 2: `POST /api/history` (Record game interaction)
     - **Selected**: Both endpoints are essential for tracking history.

4. **Security & Performance Requirements:**
   - **Row Level Security (RLS)**: "Implement Row-Level Security (RLS) to ensure users can only access their own data."
   - **Authentication**: "Uses Supabase for user authentication."
   - **Rate Limiting**: "Consider implementing rate limiting for the recommendations endpoint to prevent abuse."
   - **Caching**: "Cache results for performance, especially for frequently accessed data."

5. **Business Logic to API Mapping:**
   - **User Preferences**: Managed through the user profile endpoint.
   - **Game Recommendations**: Implemented through the recommendations endpoint, utilizing AI for personalized suggestions.
   - **Review System**: Managed through dedicated endpoints for creating, updating, and retrieving reviews.
   - **Game History**: Managed through endpoints for tracking user interactions with games.

6. **Validation Requirements:**
   - **User Registration**: Required fields include `firstName`, `lastName`, `email`, and `passwordHash`.
   - **Game Validation**: Required fields include `title`, `complexity`, `min_players`, `max_players`, and `duration`. Complexity must be between 1 and 5, and player counts must be valid.
   - **Review Validation**: Required fields include `reviewText`, and only one review per user per game is allowed.
   - **Game History Validation**: Required fields include `durationPlayed` and `interactionType`, with valid types being `played`, `abandoned`, and `recommended`.

</api_analysis>

# REST API Plan

## 1. Resources
- **Profiles**: User profiles and preferences
- **BoardGames**: Board game information and metadata
- **Reviews**: User reviews for games
- **Ratings**: User ratings for games
- **GameHistory**: User interaction history with games
- **GameTypes**: Available game types
- **GameMechanics**: Available game mechanics
- **FavoriteGames**: User's favorite games
- **Preferences**: User's gaming preferences

## 2. Endpoints

### Profiles

#### GET /api/profiles/{id}
- Description: Retrieve user profile
- Response: Profile object
- Status Codes: 200 OK, 404 Not Found

#### PATCH /api/profiles/{id}
- Description: Update user profile
- Request Body: Partial Profile object
- Response: Updated Profile object
- Status Codes: 200 OK, 400 Bad Request, 404 Not Found

### Board Games

#### GET /api/games
- Description: List board games
- Query Parameters:
  - page: number
  - limit: number
  - sort: string
  - complexity: number
  - players: number
  - duration: number
  - types: string[]
- Response: Array of BoardGame objects with pagination
- Status Codes: 200 OK

#### GET /api/games/{id}
- Description: Get specific board game
- Response: BoardGame object
- Status Codes: 200 OK, 404 Not Found

#### GET /api/recommendations
- Description: Get game recommendations based on preferences
- Query Parameters:
  - players: number
  - duration: number
  - types: string[]
  - complexity: number
  - description: string
- Response: Array of BoardGame objects with AI-generated relevance scores
- Status Codes: 200 OK, 400 Bad Request

### Reviews

#### GET /api/games/{id}/reviews
- Description: Get reviews for a game
- Query Parameters:
  - page: number
  - limit: number
  - sort: string
- Response: Array of Review objects with pagination
- Status Codes: 200 OK

#### POST /api/games/{id}/reviews
- Description: Create a review
- Request Body: Review object
- Response: Created Review object
- Status Codes: 201 Created, 400 Bad Request

#### PATCH /api/reviews/{id}
- Description: Update a review
- Request Body: Partial Review object
- Response: Updated Review object
- Status Codes: 200 OK, 400 Bad Request, 404 Not Found

#### DELETE /api/reviews/{id}
- Description: Delete a review
- Status Codes: 204 No Content, 404 Not Found

### Game History

#### GET /api/history
- Description: Get user's game history
- Query Parameters:
  - page: number
  - limit: number
  - sort: string
- Response: Array of GameHistory objects with pagination
- Status Codes: 200 OK

#### POST /api/history
- Description: Record game interaction
- Request Body: GameHistory object
- Response: Created GameHistory object
- Status Codes: 201 Created, 400 Bad Request

### Favorites

#### GET /api/favorites
- Description: Get user's favorite games
- Query Parameters:
  - page: number
  - limit: number
  - sort: string
- Response: Array of FavoriteGame objects with pagination
- Status Codes: 200 OK

#### POST /api/favorites
- Description: Add game to favorites
- Request Body: { gameId: UUID, notes?: string }
- Response: Created FavoriteGame object
- Status Codes: 201 Created, 400 Bad Request

#### DELETE /api/favorites/{gameId}
- Description: Remove game from favorites
- Status Codes: 204 No Content, 404 Not Found

### Preferences

#### GET /api/preferences
- Description: Get user's gaming preferences
- Response: Preferences object
- Status Codes: 200 OK, 404 Not Found

#### PUT /api/preferences
- Description: Update user's gaming preferences
- Request Body: Preferences object
- Response: Updated Preferences object
- Status Codes: 200 OK, 400 Bad Request

## 3. Authentication and Authorization

### Authentication
- Uses Supabase Authentication
- JWT tokens required in Authorization header
- Refresh token rotation for security

### Authorization
- Public endpoints:
  - GET /api/games
  - GET /api/games/{id}
  - GET /api/games/{id}/reviews
- Authenticated endpoints (require valid JWT):
  - All other endpoints
- Row Level Security (RLS) ensures users can only:
  - Read/update their own profile
  - Create/update/delete their own reviews
  - Access their own game history

## 4. Validation and Business Logic

### Profile Validation
- Required fields: first_name, last_name
- Valid account_status values: active, suspended, deleted
- Array of valid game types for preferred_types

### Board Game Validation
- Required fields: title, complexity, min_players, max_players, duration
- Complexity range: 1-5
- Players: min_players > 0, max_players > min_players
- Duration must be positive

### Review Validation
- Required fields: review_text
- One review per user per game
- Cannot review archived games

### Game History Validation
- Required fields: duration_played, interaction_type
- Valid interaction_type values: played, abandoned, recommended
- Duration must be positive

### Favorites Validation
- Required fields: gameId
- Cannot favorite archived games
- Optional notes field for user comments
- One favorite entry per user per game

### Preferences Validation
- Required fields: userId
- Valid preferredComplexity range: 1-5
- Valid preferredPlayerCount: > 0
- Valid maxGameDuration: > 0
- preferredGameTypes must contain valid GameType UUIDs
- preferredMechanics must contain valid GameMechanic UUIDs

### Business Logic Implementation
1. **Game Recommendations**:
   - AI-powered endpoint using OpenRouter.ai
   - Considers user preferences and game history
   - Uses user's explicit preferences from Preferences table
   - Prioritizes games similar to user's favorites
   - Filters out archived games
   - Caches results for performance

2. **User Preferences**:
   - Stored in dedicated Preferences table
   - One active preference set per user
   - Used for personalized recommendations
   - Updated through preferences endpoint
   - Maintains history of preference changes

3. **Favorites Management**:
   - Quick access to user's favorite games
   - Optional notes for personal reminders
   - Used in recommendation algorithm
   - Prevents favoriting archived games

4. **Review System**:
   - Helpful votes tracking
   - One review per user per game
   - Automatic update of updated_at timestamp 

This plan should provide a solid foundation for developing the API. If you have any questions or need further details, feel free to ask!
