import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationButton,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import GameCard from "./GameCard";
import type { BoardGameListDTO, BoardGameDTO } from "@/types";
import { Search } from "lucide-react";
import { supabaseClient } from "@/db/supabase.client";

// Hook do pobierania danych o grach
const useGames = (page: number, searchQuery: string) => {
  return useQuery({
    queryKey: ["games", page, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "9"); // 3 kolumny x 3 wiersze
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/games?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Błąd podczas pobierania danych");
      }

      return response.json() as Promise<BoardGameListDTO>;
    },
    staleTime: 60000, // 1 minuta
  });
};

export default function GameCatalog() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Opóźnienie wyszukiwania aby zredukować ilość zapytań
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset strony po wyszukiwaniu
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sprawdź, czy użytkownik jest zalogowany
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabaseClient.auth.getSession();
      setIsLoggedIn(!!data.session);
    };

    checkAuth();
  }, []);

  const { data, isLoading, error } = useGames(page, debouncedSearch);

  // Oblicz zakres stron do wyświetlenia w paginacji
  const getPaginationRange = () => {
    if (!data?.pagination) return [];

    const totalPages = Math.ceil(data.pagination.total / data.pagination.limit);
    const currentPage = data.pagination.page;
    const range = [];

    // Zawsze pokazuj pierwszą stronę
    range.push(1);

    // Dodaj "..." jeśli obecna strona jest dalej niż 2 od początku
    if (currentPage > 3) {
      range.push("...");
    }

    // Dodaj poprzednią stronę jeśli nie jest to strona 1
    if (currentPage > 2) {
      range.push(currentPage - 1);
    }

    // Dodaj obecną stronę jeśli nie jest to strona 1
    if (currentPage > 1 && currentPage < totalPages) {
      range.push(currentPage);
    }

    // Dodaj następną stronę jeśli nie jest to ostatnia strona
    if (currentPage < totalPages - 1) {
      range.push(currentPage + 1);
    }

    // Dodaj "..." jeśli obecna strona jest dalej niż 2 od końca
    if (currentPage < totalPages - 2) {
      range.push("...");
    }

    // Zawsze pokazuj ostatnią stronę jeśli jest więcej niż 1 strona
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  return (
    <div className="container mx-auto px-4 py-8" data-testid="game-catalog">
      <h1 className="text-3xl font-bold text-center mb-8">Katalog gier planszowych</h1>

      {/* Wyszukiwarka */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Input
            type="text"
            placeholder="Szukaj gier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="search-input"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Informacja o błędzie */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-8">
          <p>Wystąpił błąd podczas pobierania danych: {error instanceof Error ? error.message : "Nieznany błąd"}</p>
        </div>
      )}

      {/* Loader */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Lista gier */}
      {!isLoading && data?.games && (
        <>
          {data.games.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">Nie znaleziono gier pasujących do podanych kryteriów</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" data-testid="games-list">
              {data.games.map((game) => (
                <GameCard key={game.id} game={game} isLoggedIn={isLoggedIn} />
              ))}
            </div>
          )}

          {/* Paginacja */}
          {data.pagination.total > data.pagination.limit && (
            <Pagination className="mt-8" data-testid="pagination">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
                    }}
                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                    data-testid="pagination-prev"
                  />
                </PaginationItem>

                {getPaginationRange().map((pageNum, index) => (
                  <PaginationItem key={index}>
                    {pageNum === "..." ? (
                      <span className="px-4 py-2">...</span>
                    ) : (
                      <PaginationButton
                        onClick={(e: React.MouseEvent) => {
                          e.preventDefault();
                          if (typeof pageNum === "number") {
                            setPage(pageNum);
                          }
                        }}
                        isActive={page === pageNum}
                        data-testid={`pagination-page-${pageNum}`}
                      >
                        {pageNum}
                      </PaginationButton>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault();
                      const totalPages = Math.ceil(data.pagination.total / data.pagination.limit);
                      if (page < totalPages) setPage(page + 1);
                    }}
                    className={
                      page >= Math.ceil(data.pagination.total / data.pagination.limit)
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                    data-testid="pagination-next"
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
