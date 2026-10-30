'use client';

import { useMemo, useState } from 'react';
import {
  ChevronsUpDown,
  Loader2,
  LocateFixed,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DIVISIONS, districtsByDivision, type BDDistrict } from '@/lib/bd-districts';
import { cn } from '@/lib/utils';

interface LocationPickerProps {
  currentName?: string;
  detecting: boolean;
  detectingLabel?: string;
  onSelect: (district: BDDistrict) => void;
  onDetect: () => void;
}

export function LocationPicker({
  currentName,
  detecting,
  detectingLabel,
  onSelect,
  onDetect,
}: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const grouped = useMemo(() => districtsByDivision(), []);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        aria-label="Use my current location"
        className="shrink-0 border-white/25 bg-white/15 text-white backdrop-blur hover:bg-white/25 hover:text-white"
        onClick={onDetect}
        disabled={detecting}
      >
        {detecting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LocateFixed className="h-4 w-4" />
        )}
      </Button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a district"
            className="w-[150px] justify-between border-white/25 bg-white/15 text-white backdrop-blur hover:bg-white/25 hover:text-white sm:w-[190px]"
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{currentName ?? 'Select district'}</span>
            </span>
            <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0 sm:w-80" align="end">
          <Command>
            <CommandInput placeholder="Search 64 districts..." />
            <CommandList className="max-h-80">
              <CommandEmpty>No district found.</CommandEmpty>
              {detectingLabel ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  {detectingLabel}
                </div>
              ) : null}
              {DIVISIONS.map((div) => {
                const items = grouped[div.name];
                if (!items?.length) return null;
                return (
                  <CommandGroup
                    key={div.name}
                    heading={`${div.name} Division`}
                  >
                    {items.map((d) => (
                      <CommandItem
                        key={d.id}
                        value={`${d.name} ${d.bnName} ${div.name}`}
                        onSelect={() => {
                          onSelect(d);
                          setOpen(false);
                        }}
                        className="justify-between"
                      >
                        <span
                          className={cn(
                            'font-medium',
                            d.name === currentName && 'text-primary'
                          )}
                        >
                          {d.name}
                        </span>
                        <span className="font-bengali text-xs text-muted-foreground">
                          {d.bnName}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
