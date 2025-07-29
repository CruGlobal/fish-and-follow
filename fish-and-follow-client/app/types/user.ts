import type { Contact } from './contact';

type UserRole = "admin" | "staff";

interface User {
  id: string;
  role: UserRole;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  lastLogin?: string;
  contactId?: string; // Optional, if user is linked to a contact
  contact?: Contact; // Optional, if you want to embed the contact object
}

export interface NewUserData {
  email: string;
  role: UserRole;
}

export type { User, UserRole };