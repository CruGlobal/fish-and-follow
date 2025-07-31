import type { Contact, ContactBrief, ContactFormData, ContactField, ContactFieldsResponse, ContactSearchResponse } from "~/types/contact";
import type { UserRole, User, NewUserData } from "~/types/user";
import type { Template, TemplateItem, TemplateComponent, BulkTemplateMessageRequest, BulkTemplateMessageResponse } from "~/types/bulkMessaging";
import type { FollowUpStatus, NewFollowUpStatusData } from "~/types/followUpStatus";

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `/api${endpoint}`;
    const config: RequestInit = {
      credentials: 'include', // Include cookies for session-based auth
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // If the response is empty, return an empty object
      if (response.status === 204) {
        return {} as T; // Return empty object for 204 No Content
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Contact endpoints
  async submitContact(data: ContactFormData): Promise<Contact> {
    return this.request<Contact>("/contacts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getContacts(search?: string, fields?: string[]): Promise<ContactBrief[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (fields && fields.length > 0) params.append('fields', fields.join(','));
    
    const queryString = params.toString();
    const endpoint = `/contacts/search${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await this.request<ContactSearchResponse>(endpoint);
      // Handle case where response.contacts is undefined or null
      if (!response.contacts || !Array.isArray(response.contacts)) {
        return [];
      }
      return response.contacts;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return []; // Return empty array on error
    }
  }

  async getFullContacts(
    search?: string, 
    filters?: {
      year?: string;
      gender?: string;
      campus?: string;
      major?: string;
      isInterested?: string;
      followUpStatusNumber?: string;
    }
  ): Promise<Contact[]> {
    const allFields = [
      'id', 'firstName', 'lastName', 'phoneNumber', 'email', 
      'campus', 'major', 'year', 'isInterested', 'gender', 
      'followUpStatusNumber', 'createdAt', 'updatedAt', 'notes', 'orgId'
    ];
    
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    
    // Add filter parameters
    if (filters) {
      if (filters.year && filters.year !== 'all') params.append('year', filters.year);
      if (filters.gender && filters.gender !== 'all') params.append('gender', filters.gender);
      if (filters.campus && filters.campus !== 'all') params.append('campus', filters.campus);
      if (filters.major && filters.major !== 'all') params.append('major', filters.major);
      if (filters.isInterested && filters.isInterested !== 'all') params.append('isInterested', filters.isInterested);
      if (filters.followUpStatusNumber && filters.followUpStatusNumber !== 'all') params.append('followUpStatusNumber', filters.followUpStatusNumber);
    }
    
    params.append('fields', allFields.join(','));
    
    const queryString = params.toString();
    const endpoint = `/contacts/search${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await this.request<ContactSearchResponse>(endpoint);
      // Handle case where response.contacts is undefined or null
      if (!response.contacts || !Array.isArray(response.contacts)) {
        return [];
      }
      return response.contacts.map(result => result as Contact);
    } catch (error) {
      console.error('Error fetching full contacts:', error);
      return []; // Return empty array on error
    }
  }

  async searchContacts(query: string): Promise<ContactBrief[]> {
    try {
      return await this.getContacts(query);
    } catch (error) {
      console.error('Error searching contacts:', error);
      return []; // Return empty array on error
    }
  }

  async getContact(id: string): Promise<Contact> {
    return this.request<Contact>(`/contacts/${id}`);
  }

  async updateContact(id: string, data: Partial<ContactFormData>): Promise<Contact> {
    return this.request<Contact>(`/contacts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteContact(id: string): Promise<void> {
    return this.request<void>(`/contacts/${id}`, {
      method: "DELETE",
    });
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    return this.request<User[]>("/users");
  }
    async searchUsers(
    search?: string,
    filters?: {
      role?: string;
      status?: string;
      limit?: string;
    }
  ): Promise<{ success: boolean; users: User[]; query: string | null; total: number; timestamp: string }> {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (filters?.role) params.append("role", filters.role);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.limit) params.append("limit", filters.limit);

    return this.request<{ success: boolean; users: User[]; query: string | null; total: number; timestamp: string }>(
      `/users/search?${params.toString()}`
    );
  }

  async createUser(data: NewUserData): Promise<User> {
    return this.request<User>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request<void>(`/users/${id}`, {
      method: "DELETE",
    });
  }

  async getUserStats(): Promise<{
    total: number;
    adminCount: number;
    staffCount: number;
  }> {
    const response = await this.request<{
      success: boolean;
      stats: {
        total: number;
        adminCount: number;
        staffCount: number;
      };
      timestamp: string;
    }>("/users/stats");
    return response.stats;
  }

  // Template endpoints
  async getTemplates(): Promise<Template> {
    return this.request<Template>("/whatsapp/templates");
  }

  // WhatsApp endpoints
  async sendBulkTemplateMessage(data: BulkTemplateMessageRequest): Promise<BulkTemplateMessageResponse> {
    return this.request<BulkTemplateMessageResponse>("/whatsapp/send_template_message", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getContactFields(): Promise<ContactField[]> {
    const response = await this.request<ContactFieldsResponse>("/contacts/fields");
    return response.fields;
  }

  async getContactStats(): Promise<{
    total: number;
    interested: number;
    notInterested: number;
    maleCount: number;
    femaleCount: number;
  }> {
    const response = await this.request<{
      success: boolean;
      stats: {
        total: number;
        interested: number;
        notInterested: number;
        maleCount: number;
        femaleCount: number;
      };
      timestamp: string;
    }>("/contacts/stats");
    return response.stats;
  }

  // Follow-up status endpoints
  async getFollowUpStatuses(): Promise<FollowUpStatus[]> {
    return this.request<FollowUpStatus[]>("/follow-up-status");
  }

  async getFollowUpStatus(number: number): Promise<FollowUpStatus> {
    return this.request<FollowUpStatus>(`/follow-up-status/${number}`);
  }

  async createFollowUpStatus(data: NewFollowUpStatusData): Promise<FollowUpStatus> {
    return this.request<FollowUpStatus>("/follow-up-status", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateFollowUpStatus(number: number, description: string): Promise<FollowUpStatus> {
    return this.request<FollowUpStatus>(`/follow-up-status/${number}`, {
      method: "PUT",
      body: JSON.stringify({ description }),
    });
  }
}

export const apiService = new ApiService();