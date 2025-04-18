import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseClient } from "@/db/supabase.client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Button } from "./ui/button";
import { LogOut, User as UserIcon } from "lucide-react";

interface UserNavProps {
  user: User;
}

export default function UserNav({ user }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabaseClient.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Błąd podczas wylogowywania:", error);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={isOpen}
          aria-label="Wybierz opcję użytkownika"
          className="flex items-center gap-2"
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
          >
            <LogOut className="mr-2 h-4 w-4" />
            Wyloguj się
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
} 