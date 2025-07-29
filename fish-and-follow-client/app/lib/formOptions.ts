import type { GenderEnum, YearEnum } from "./contactStore";

export const genderOptions = [
  { value: "male" as GenderEnum, label: "Male" },
  { value: "female" as GenderEnum, label: "Female" },
  { value: "other" as GenderEnum, label: "Other" },
  { value: "prefer_not_to_say" as GenderEnum, label: "Prefer not to say" },
];

export const yearOptions = [
  { value: "1" as YearEnum, label: "1st year" },
  { value: "2" as YearEnum, label: "2nd year" },
  { value: "3" as YearEnum, label: "3rd year" },
  { value: "4" as YearEnum, label: "4th year" },
  { value: "5" as YearEnum, label: "5th year" },
  { value: "Master" as YearEnum, label: "Master" },
  { value: "PhD" as YearEnum, label: "PhD" },
];

export const campusOptions = [
  { value: "Campus A", label: "Campus A" },
  { value: "Campus B", label: "Campus B" },
  { value: "Campus C", label: "Campus C" },
  { value: "Campus D", label: "Campus D" },
  { value: "Online", label: "Online" },
];
