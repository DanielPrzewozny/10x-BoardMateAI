import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { FormMessage } from '@/components/ui/form';

// Lista przykładowych typów gier
const gameTypesList = [
  { value: "strategy", label: "Strategiczna" },
  { value: "family", label: "Rodzinna" },
  { value: "card", label: "Karciana" },
  { value: "party", label: "Imprezowa" },
  { value: "cooperative", label: "Kooperacyjna" },
  { value: "deck-building", label: "Budowanie talii" },
  { value: "worker-placement", label: "Zarządzanie pracownikami" },
  { value: "area-control", label: "Kontrola terenu" },
  { value: "resource-management", label: "Zarządzanie zasobami" },
  { value: "dice", label: "Kościana" },
  { value: "miniatures", label: "Figurkowa" },
  { value: "adventure", label: "Przygodowa" },
];

interface GameTypeSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

export default function GameTypeSelector({ value, onChange, error }: GameTypeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>(value || []);

  useEffect(() => {
    setSelectedValues(value || []);
  }, [value]);

  const handleSelect = (currentValue: string) => {
    const newValues = selectedValues.includes(currentValue)
      ? selectedValues.filter(val => val !== currentValue)
      : [...selectedValues, currentValue];
    
    setSelectedValues(newValues);
    onChange(newValues);
    // Nie zamykamy popovera po wyborze, aby umożliwić wybór wielu typów
  };

  const selectedLabels = selectedValues.map(val => {
    const type = gameTypesList.find(type => type.value === val);
    return type ? type.label : val;
  });

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedValues.length > 0 
              ? `Wybrano ${selectedValues.length} ${selectedValues.length === 1 ? 'typ' : selectedValues.length < 5 ? 'typy' : 'typów'}`
              : "Wybierz typy gier"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Szukaj typu gry..." />
            <CommandEmpty>Nie znaleziono typów gier.</CommandEmpty>
            <CommandGroup>
              {gameTypesList.map((type) => (
                <CommandItem
                  key={type.value}
                  value={type.value}
                  onSelect={() => handleSelect(type.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValues.includes(type.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {type.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedLabels.map((label, index) => (
            <Badge 
              key={index} 
              variant="secondary"
              className="cursor-pointer"
              onClick={() => handleSelect(selectedValues[index])}
            >
              {label}
              <span className="sr-only">Usuń {label}</span>
            </Badge>
          ))}
        </div>
      )}

      {error && <FormMessage>{error}</FormMessage>}
    </div>
  );
} 