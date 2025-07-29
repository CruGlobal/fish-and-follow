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

type GenderDropdownProps = {
  value: string;
  onChange: (value: string) => void;
};

const genders = ["male", "female"];

export default function GenderDropdown({
  value,
  onChange,
}: GenderDropdownProps) {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {value
            ? t(`dropdowns.gender.options.${value}`)
            : t("dropdowns.gender.placeholder")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{t("dropdowns.gender.label")}</DropdownMenuLabel>
        {genders.map((gender) => (
          <DropdownMenuItem key={gender} onSelect={() => onChange(gender)}>
            {t(`dropdowns.gender.options.${gender}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
