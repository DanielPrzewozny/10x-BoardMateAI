// Import the Database type from the appropriate file
import type { Database } from './db/database.types'; // Adjust the path as necessary

// Base database types
export type Tables = Database['public']['Tables'];
export type Profile = Tables['profiles']['Row'];
export type BoardGame = Tables['board_games']['Row'];
export type Review = Tables['reviews']['Row'];
export type Rating = Tables['ratings']['Row'];
export type GameHistory = Tables['game_history']['Row'];
export type RecommendationErrorLog = Tables['recommendation_error_logs']['Row'];

// Profile Data Transfer Object
export type ProfileDTO = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  account_status: string;
  preferred_types: string[];
  avatarUrl?: string;
  joinDate: Date;
};

// Board Game Data Transfer Object  
export type BoardGameDTO = Pick<BoardGame,
  'id' | 'title' | 'complexity' | 'min_players' | 'max_players' | 'duration' | 'description' | 'is_archived'>;

// Review Data Transfer Object
export type ReviewDTO = Pick<Review,
  'id' | 'user_id' | 'game_id' | 'review_text' | 'helpful_votes'>;

// Rating Data Transfer Object
export type RatingDTO = Pick<Rating,
  'id' | 'user_id' | 'game_id' | 'rating_value'>;

// Game History Data Transfer Object
export type GameHistoryDTO = Pick<GameHistory,
  'id' | 'user_id' | 'game_id' | 'played_at' | 'duration_played' | 'interaction_type' | 'session_duration' | 'score' | 'notes'>;

export interface BoardGameDescriptionDTO {
    id: string;
    title: string;
    complexity: number;
    min_players: number;
    max_players: number;
    duration: number;
    description: string;
    is_archived: boolean;
  }

// Game Preferences
export interface GamePreferences {
  minPlayers: number;
  maxPlayers: number;
  preferredDuration: number;
  preferredTypes: string[];
  complexityLevel: number;
  budget?: number;
  }

// Recommendation Data Transfer Object
export type RecommendationDTO = {
    players: number,
    duration: number,
    types: string[],
    complexity: number,
    description: string
};

// Game Recommendation DTO - pojedyncza rekomendacja gry
export type GameRecommendation = {
    title: string,
    players: string,
    duration: string,
    types: string[],
    complexity: number,
    description: string,
    imageUrl: string
};

// Lista rekomendacji gier
export type GameRecommendationsResponseDto = {
    recommendations: GameRecommendation[]
};

export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
}

export interface BoardGameListDTO {
    games: BoardGameDTO[];
    pagination: PaginationDTO;
}

export interface ReviewListDTO {
    reviews: ReviewDTO[];
    pagination: PaginationDTO;
}

export interface RatingListDTO {
    ratings: RatingDTO[];
    pagination: PaginationDTO;
}

export interface GameHistoryListDTO {
    game_history: GameHistoryDTO[];
    pagination: PaginationDTO;
}


export interface GameDescriptionCommand {
    description: string,
    players: number,
    duration: number,
    types: string[],
    complexity: number  
}

export type GameDescriptionResponseDto = {
    players: number,
    duration: number,
    types: string[],
    complexity: number,
    description: string
};

// ------------------------------------------------------------------------------------------------
// 10. Recommendation Error Log DTO
//     Represents an error log entry for the AI board game recommendation process (GET /recommendation-error-logs).
// ------------------------------------------------------------------------------------------------
export type RecommendationErrorLogDto = Pick<
  RecommendationErrorLog,
  "id" | "error_code" | "error_message" | "model" | "description_hash" | "description_length" | "created_at" | "user_id"
>;




