// components/GenderDropdown.tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "app/components/ui/dropdown-menu";
import { Button } from "app/components/ui/button";

type YearDropdownProps = {
  value: string;
  onChange: (value: string) => void;
};

const years = ["1st", "2nd", "3rd", "4th", "5th+"];

export default function YearDropdown({ value, onChange }: YearDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{value || "Select Year"}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Year</DropdownMenuLabel>
        {years.map((year) => (
          <DropdownMenuItem key={year} onSelect={() => onChange(year)}>
            {year}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
