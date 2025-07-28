/**
 * Search utilities for contact fuzzy matching using Levenshtein distance
 */

import { contact } from '../db/schema';
import { db } from '../db/client';
import { inArray } from 'drizzle-orm';

// Contact interface that matches the database schema
// Using InferSelectModel to derive the type from the schema
export type Contact = typeof contact.$inferSelect;

// ContactField interface that matches frontend expectations
export interface ContactField {
  key: string;
  label: string;
  type: string;
}

// Field metadata mapping for better labels and types (using camelCase field names)
const FIELD_METADATA: Record<string, { label: string; type: string }> = {
  id: { label: 'ID', type: 'text' },
  firstName: { label: 'First Name', type: 'text' },
  lastName: { label: 'Last Name', type: 'text' },
  phoneNumber: { label: 'Phone Number', type: 'text' },
  email: { label: 'Email', type: 'email' },
  campus: { label: 'Campus', type: 'text' },
  major: { label: 'Major', type: 'text' },
  year: { label: 'Year', type: 'select' },
  isInterested: { label: 'Is Interested', type: 'boolean' },
  gender: { label: 'Gender', type: 'select' },
  followUpStatusNumber: { label: 'Follow Up Status', type: 'number' },
};

// Field validation and selection utilities
// Dynamically extract allowed fields from the Drizzle schema
export const ALLOWED_CONTACT_FIELDS = Object.keys(contact) as readonly (keyof typeof contact)[];

export const DEFAULT_SEARCH_FIELDS = ['id', 'firstName', 'lastName'] as const;

// Mapping from camelCase field names to database column names
const FIELD_TO_COLUMN_MAP: Record<string, string> = {
  id: 'id',
  firstName: 'first_name',
  lastName: 'last_name',
  phoneNumber: 'phone_number',
  email: 'email',
  campus: 'campus',
  major: 'major',
  year: 'year',
  isInterested: 'is_interested',
  gender: 'gender',
  followUpStatusNumber: 'follow_up_status',
};

/**
 * Convert camelCase field names to database column names for raw SQL queries
 */
export const getColumnNamesForFields = (fieldNames: string[]): string[] => {
  return fieldNames
    .filter(field => field in FIELD_TO_COLUMN_MAP)
    .map(field => FIELD_TO_COLUMN_MAP[field]);
};

/**
 * Convert camelCase field names to database column names with aliases for raw SQL queries
 */
export const getColumnNamesWithAliases = (fieldNames: string[]): string => {
  return fieldNames
    .filter(field => field in FIELD_TO_COLUMN_MAP)
    .map(field => {
      const columnName = FIELD_TO_COLUMN_MAP[field];
      return columnName === field ? columnName : `${columnName} AS "${field}"`;
    })
    .join(', ');
};

/**
 * Central field management class for contact schema operations
 */
class ContactFieldManager {
  private static _instance: ContactFieldManager;
  private _fieldNames: string[] | null = null;

  static get instance(): ContactFieldManager {
    if (!ContactFieldManager._instance) {
      ContactFieldManager._instance = new ContactFieldManager();
    }
    return ContactFieldManager._instance;
  }

  /**
   * Get field names array from the schema
   */
  private extractFieldNames(): string[] {
    if (this._fieldNames) return this._fieldNames;
    // Extract field names directly from the contact schema, filtering out internal fields
    const allFields = Object.keys(contact);
    this._fieldNames = allFields.filter(field => 
      !field.startsWith('_') && // Filter out internal fields
      field !== 'enableRLS' &&  // Filter out RLS field
      field in FIELD_METADATA     // Only include fields we have metadata for
    );
    return this._fieldNames;
  }

  /**
   * Get simple field names array
   */
  getFieldNames(): string[] {
    return this.extractFieldNames();
  }

  /**
   * Get default fields for API responses
   */
  getDefaultFields(): string[] {
    return [...DEFAULT_SEARCH_FIELDS];
  }

  /**
   * Validate and filter requested fields against allowed fields
   */
  validateFields(requestedFields?: string[]): string[] {
    if (!requestedFields || requestedFields.length === 0) {
      return this.getDefaultFields();
    }

    const allowedFieldNames = this.getFieldNames();
    const validFields = requestedFields.filter((field) => allowedFieldNames.includes(field));

    return validFields.length > 0 ? validFields : this.getDefaultFields();
  }

  /**
   * Parse and validate fields from query parameter
   */
  parseFieldsParameter(fieldsParam: unknown): string[] {
    if (typeof fieldsParam !== 'string') {
      return this.getDefaultFields();
    }

    const requestedFields = fieldsParam.split(',').map((f) => f.trim());
    return this.validateFields(requestedFields);
  }

  /**
   * Convert field names to ContactField objects with labels and types
   */
  toContactFieldObjects(fieldNames: string[]): ContactField[] {
    return fieldNames.map((field) => {
      const metadata = FIELD_METADATA[field];
      return {
        key: field,
        label: metadata?.label || field.charAt(0).toUpperCase() + field.slice(1),
        type: metadata?.type || 'text',
      };
    });
  }
}

// Export convenience functions that use the singleton
const fieldManager = ContactFieldManager.instance;

export const getContactFieldNames = (): string[] => fieldManager.getFieldNames();
export const getDefaultContactFields = (): string[] => fieldManager.getDefaultFields();
export const getContactFieldObjects = (): ContactField[] => 
  fieldManager.toContactFieldObjects(fieldManager.getFieldNames());
export const validateContactFields = (requestedFields?: string[]): string[] =>
  fieldManager.validateFields(requestedFields);
export const parseFieldsParameter = (fieldsParam: unknown): string[] =>
  fieldManager.parseFieldsParameter(fieldsParam);

/**
 * Get contacts by their IDs using Drizzle ORM
 * @param contactIds Array of contact IDs to retrieve
 * @returns Promise<Array<Contact>> objects matching the provided IDs
 */
export const getContactsByIds = async (contactIds: string[]): Promise<Contact[]> => {
  if (!contactIds || contactIds.length === 0) {
    return [];
  }

  try {
    const dbContacts = await db.select().from(contact).where(inArray(contact.id, contactIds));
    return dbContacts;
  } catch (error) {
    console.error('Error fetching contacts by IDs:', error);
    return [];
  }
};

// Helper function to get full name from contact
export const getContactName = (contact: Contact): string => {
  return `${contact.firstName} ${contact.lastName}`;
};

// Search result interface with scoring details
export interface SearchResult {
  contact: Contact;
  score: number;
  matchedFields: string[];
  fieldScores?: Record<string, number>;
}

// Field configuration for weighted search
export interface SearchField {
  field: string;
  value: string;
  weight: number;
}
