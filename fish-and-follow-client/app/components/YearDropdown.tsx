// components/GenderDropdown.tsx
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {value ? t(`dropdowns.year.options.${value}`) : t("dropdowns.year.placeholder")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{t("dropdowns.year.label")}</DropdownMenuLabel>
        {years.map((year) => (
          <DropdownMenuItem key={year} onSelect={() => onChange(year)}>
            {t(`dropdowns.year.options.${year}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
