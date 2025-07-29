
interface APIResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

type YearEnum = "1st_year" | "2nd_year" | "3rd_year" | "4th_year" | "5th_year" | "6th_year" | "7th_year" | "8th_year" | "9th_year" | "10th_year" | "11th_year";
type GenderEnum = "male" | "female";

export const yearOptions: Record<YearEnum, string> = {
  "1st_year": "1st Year",
  "2nd_year": "2nd Year",
  "3rd_year": "3rd Year",
  "4th_year": "4th Year",
  "5th_year": "5th Year",
  "6th_year": "6th Year",
  "7th_year": "7th Year",
  "8th_year": "8th Year",
  "9th_year": "9th Year",
  "10th_year": "10th Year",
  "11th_year": "11th Year"
};

export const genderOptions: Record<GenderEnum, string> = {
  male: "Male",
  female: "Female"
};

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string; // facultatif
  campus: string;
  major: string;
  year: YearEnum;
  isInterested: boolean;
  gender: GenderEnum;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  followUpStatusNumber: number; // Référence à l'ID du statut de suivi
  followUpStatusDescription?: string;
}

interface ContactBrief {
  id: string;
  firstName: string;
  lastName: string;
}

interface ContactFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  campus: string;
  major: string;
  year: YearEnum;
  gender: GenderEnum;
  isInterested?: boolean;
  notes?: string;
  followUpStatusNumber?: number;
}

interface NewContactData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  campus: string;
  major: string;
  year: YearEnum;
  gender: GenderEnum;
  isInterested?: boolean;
  notes?: string;
  followUpStatusNumber?: number;
  followUpStatusDescription?: string;
}

interface ContactSearchResponse {
  contacts: ContactBrief[] | null; // Peut être null si aucun contact trouvé
  total: number; // Nombre total de contacts trouvés
  totalContacts: number; // Nombre total de contacts dans la base de données
}

interface ContactField {
  key: string;
  label: string;
  type: string;
}

interface ContactFieldsResponse {
  success: boolean;
  fields: ContactField[];
  timestamp: string;
}

export type {
  APIResponse,
  Contact,
  ContactBrief,
  ContactFormData,
  NewContactData,
  ContactSearchResponse,
  ContactField,
  ContactFieldsResponse,
  YearEnum,
  GenderEnum
}