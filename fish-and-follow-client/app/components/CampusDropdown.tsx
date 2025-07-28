// components/GenderDropdown.tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "app/components/ui/dropdown-menu";
import { Button } from "app/components/ui/button";

type CampusDropdownProps = {
  value: string;
  onChange: (value: string) => void;
};

const campuses = ["CNU", "ODU", "VT", "W&M", "LU"];

export default function CampusDropdown({
  value,
  onChange,
}: CampusDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{value || "Select Campus"}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Campus</DropdownMenuLabel>
        {campuses.map((campus) => (
          <DropdownMenuItem key={campus} onSelect={() => onChange(campus)}>
            {campus}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
