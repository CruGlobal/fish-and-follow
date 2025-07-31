// components/GenderDropdown.tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "app/components/ui/dropdown-menu";
import { Button } from "app/components/ui/button";

import { yearOptions } from "~/types/contact";

type YearDropdownProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function YearDropdown({ value, onChange }: YearDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{yearOptions[value as keyof typeof yearOptions] || "Select Year"}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Year</DropdownMenuLabel>
        {Object.entries(yearOptions).map(([year, label]) => (
          <DropdownMenuItem key={year} onSelect={() => onChange(year)}>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
