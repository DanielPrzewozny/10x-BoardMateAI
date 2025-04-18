import { useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseClient } from "@/db/supabase.client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Button } from "./ui/button";
import { LogOut, User as UserIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface UserNavProps {
  user: User;
}

export default function UserNav({ user }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSignOut = useCallback(async () => {
    try {
      setIsLoading(true);
      
      toast({
        title: "Wylogowywanie...",
        description: "Za chwilę nastąpi przekierowanie...",
      });

      // Przekieruj na stronę wylogowania, która zajmie się resztą
      window.location.href = "/auth/logout";
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Błąd wylogowania",
        description: "Wystąpił nieoczekiwany błąd podczas wylogowywania"
      });
      setIsLoading(false);
      setIsOpen(false);
    }
  }, [toast]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={isOpen}
          aria-label="Menu użytkownika"
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <UserIcon className="h-5 w-5" />
          <span className="hidden md:inline-block">
            {user.email}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start text-left font-normal"
            onClick={handleSignOut}
            disabled={isLoading}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isLoading ? "Wylogowywanie..." : "Wyloguj się"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
} 