// API service for handling HTTP requests

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  message?: string;
}

interface Contact extends ContactFormData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "inactive";
  lastLogin?: string;
  createdAt: string;
}
interface ContactSummary {
  id: string;
  firstName: string;
  lastName: string;
}

interface ContactSearchResponse {
  success: boolean;
  contacts: ContactSummary[];
  query: string | null;
  fuzzySearch: boolean;
  threshold: number;
  total: number;
  totalContacts: number;
  timestamp: string;
}

interface TemplateComponent {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
  text?: string;
  format?: "TEXT" | "MEDIA";
  buttons?: Array<{
    type?: string;
    text?: string;
    url?: string;
    phone_number?: string;
  }>;
  example?: unknown;
}

interface TemplateItem {
  id: string;
  name: string;
  language: string;
  status: string;
  category: string;
  components: TemplateComponent[];
}

interface FacebookConfig {
  businessId: string;
  assetId: string;
}

interface Template {
  success: boolean
  templates: TemplateItem[];
  timestamp: string;
  total: number;
  facebookConfig: FacebookConfig;
}

interface BulkTemplateMessageRequest {
  contactIds: string[];
  template?: string;
  language?: string;
  params?: Record<string, string>;
  fields?: string[];
  parameterMapping?: string[]; // Ordered list of contact field names for template parameters
}

interface BulkTemplateMessageResponse {
  success: boolean;
  data: {
    totalRequested: number;
    totalFound: number;
    totalSent: number;
    totalFailed: number;
    results: any[];
    errors: any[];
  };
  timestamp: string;
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

  async getContacts(search?: string, fields?: string[]): Promise<ContactSummary[]> {
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

  async getFullContacts(search?: string): Promise<Contact[]> {
    const allFields = [
      'id', 'firstName', 'lastName', 'phoneNumber', 'email', 
      'campus', 'major', 'year', 'isInterested', 'gender', 
      'followUpStatusNumber', 'createdAt', 'updatedAt'
    ];
    
    const params = new URLSearchParams();
    if (search) params.append('search', search);
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

  async searchContacts(query: string): Promise<ContactSummary[]> {
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

  async createUser(data: { name: string; email: string; role: "admin" | "user" }): Promise<User> {
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

  // Auth endpoints
  async getAuthStatus(): Promise<{ authenticated: boolean; user: any | null }> {
    // Call the backend's auth status endpoint directly (not through /api since it's not protected)
    const url = "http://localhost:3000/auth/status";
    const response = await fetch(url, {
      credentials: 'include', // Include cookies
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  // Redirect to backend's OAuth login
  redirectToLogin(): void {
    window.location.href = "http://localhost:3000/signin";
  }

  // Call backend's logout endpoint
  async logout(): Promise<void> {
    const url = "http://localhost:3000/signout";
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
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
}

export const apiService = new ApiService();
export type { 
  Contact, 
  ContactSummary, 
  User, 
  ContactFormData, 
  Template, 
  TemplateItem, 
  TemplateComponent,
  BulkTemplateMessageRequest,
  BulkTemplateMessageResponse,
  ContactField,
  ContactFieldsResponse 
};
