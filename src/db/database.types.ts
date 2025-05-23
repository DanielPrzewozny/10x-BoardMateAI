export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      board_games: {
        Row: {
          id: string;
          title: string;
          description: string;
          players: string;
          duration: number;
          complexity: number;
          types: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          players: string;
          duration: number;
          complexity: number;
          types: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          players?: string;
          duration?: number;
          complexity?: number;
          types?: string[];
          created_at?: string;
          updated_at?: string;
        };
        // @E2ETeardownDoc Tabela zawierająca dane gier planszowych - należy zachować gry testowe, ale usunąć nowe rekordy utworzone podczas testów E2E
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          game_id?: string;
          created_at?: string;
        };
        // @E2ETeardownDoc Tabela z ulubionymi grami użytkowników - należy usunąć wszystkie rekordy utworzone podczas testów E2E
      };
      recommendations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          players: string;
          duration: number;
          complexity: number;
          types: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          players: string;
          duration: number;
          complexity: number;
          types: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          players?: string;
          duration?: number;
          complexity?: number;
          types?: string[];
          created_at?: string;
        };
        // @E2ETeardownDoc Tabela z zapisanymi rekomendacjami - należy usunąć wszystkie rekordy utworzone podczas testów E2E
      };
      user_profiles: {
        Row: {
          id: string;
          username: string;
          email: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          email: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        // @E2ETeardownDoc Tabela z profilami użytkowników - należy zachować testowe konta, ale usunąć nowe profile utworzone podczas testów E2E
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
  };
}
