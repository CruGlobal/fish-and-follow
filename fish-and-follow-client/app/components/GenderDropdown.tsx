// components/GenderDropdown.tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "app/components/ui/dropdown-menu";
import { Button } from "app/components/ui/button";

import { genderOptions } from "~/types/contact";

type GenderDropdownProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function GenderDropdown({
  value,
  onChange,
}: GenderDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{genderOptions[value as keyof typeof genderOptions] || "Select Gender"}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Gender</DropdownMenuLabel>
        {Object.entries(genderOptions).map(([gender, label]) => (
          <DropdownMenuItem key={gender} onSelect={() => onChange(gender)}>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
