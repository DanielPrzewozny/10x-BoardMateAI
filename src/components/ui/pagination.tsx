import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationSimpleProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Prosty komponent paginacji z przyciskami numerycznymi
export function PaginationSimple({ currentPage, totalPages, onPageChange }: PaginationSimpleProps) {
  // Funkcja pomocnicza do generowania przycisków stron
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Jeśli liczba stron jest mniejsza lub równa maksymalnej liczbie stron do wyświetlenia
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Zawsze pokaż pierwszą stronę
      pages.push(1);

      // Oblicz środkowe strony do pokazania
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Dostosuj, jeśli jesteśmy blisko początku
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, maxPagesToShow - 1);
      }

      // Dostosuj, jeśli jesteśmy blisko końca
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - (maxPagesToShow - 2));
      }

      // Dodaj kropki przed środkowymi stronami, jeśli potrzeba
      if (startPage > 2) {
        pages.push("...");
      }

      // Dodaj środkowe strony
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Dodaj kropki po środkowych stronach, jeśli potrzeba
      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      // Zawsze pokaż ostatnią stronę
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Poprzednia strona"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getPageNumbers().map((page, index) =>
        typeof page === "number" ? (
          <Button
            key={index}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className="min-w-[2.5rem]"
          >
            {page}
          </Button>
        ) : (
          <span key={index} className="mx-1">
            {page}
          </span>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Następna strona"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Komponent główny paginacji
const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="Paginacja"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);

// Lista elementów paginacji
const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-row items-center gap-1", className)} {...props} />
  )
);
PaginationContent.displayName = "PaginationContent";

// Pojedynczy element paginacji
const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

// Przycisk paginacji
type PaginationButtonProps = {
  isActive?: boolean;
} & React.ComponentProps<typeof Button>;

const PaginationButton = ({ className, isActive, size = "icon", ...props }: PaginationButtonProps) => (
  <Button
    aria-current={isActive ? "page" : undefined}
    variant={isActive ? "default" : "outline"}
    size={size}
    className={cn("h-9 w-9", className)}
    {...props}
  />
);

// Opcjonalne komponenty dla paginacji
const PaginationPrevious = ({ className, ...props }: React.ComponentProps<typeof Button>) => (
  <Button
    aria-label="Przejdź do poprzedniej strony"
    variant="outline"
    size="default"
    className={cn("gap-1 pl-2.5 pr-3.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Poprzednia</span>
  </Button>
);

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof Button>) => (
  <Button
    aria-label="Przejdź do następnej strony"
    variant="outline"
    size="default"
    className={cn("gap-1 pl-3.5 pr-2.5", className)}
    {...props}
  >
    <span>Następna</span>
    <ChevronRight className="h-4 w-4" />
  </Button>
);

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span aria-hidden className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}>
    &#8230;
  </span>
);

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationButton,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
