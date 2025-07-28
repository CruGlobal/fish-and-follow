// components/GenderDropdown.tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "app/components/ui/dropdown-menu";
import { Button } from "app/components/ui/button";

type GenderDropdownProps = {
  value: string;
  onChange: (value: string) => void;
};

const genders = ["Male", "Female"];

export default function GenderDropdown({
  value,
  onChange,
}: GenderDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{value || "Select Gender"}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Gender</DropdownMenuLabel>
        {genders.map((gender) => (
          <DropdownMenuItem key={gender} onSelect={() => onChange(gender)}>
            {gender}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
