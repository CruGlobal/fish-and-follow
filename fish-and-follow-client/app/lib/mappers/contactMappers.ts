import type { Contact } from "~/types/contact";

// Map API contact to local Contact interface, applying defaults as needed
export function mapApiContactToContact(apiContact: any): Contact {
  console.log(apiContact);
  return {
    id: apiContact.id,
    firstName: apiContact.firstName,
    lastName: apiContact.lastName,
    phoneNumber: apiContact.phoneNumber || '',
    email: apiContact.email,
    campus: apiContact.campus || '',
    major: apiContact.major || '',
    year: apiContact.year || '1st_year',
    isInterested: apiContact.isInterested || false,
    gender: apiContact.gender || 'male',
    createdAt: apiContact.createdAt,
    updatedAt: apiContact.updatedAt,
    followUpStatusNumber: apiContact.followUpStatusNumber || 1,
    followUpStatusDescription: apiContact.followUpStatusDescription || '',
    notes: apiContact.notes || '',
    orgId: apiContact.orgId || '', // Ensure orgId is included
  };
}
