// API service for handling HTTP requests

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

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
  role: "admin" | "staff"; 
  status: "active" | "inactive";
  lastLogin?: string;
  createdAt: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

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

  async getContacts(): Promise<Contact[]> {
    return this.request<Contact[]>("/contacts");
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

  async createUser(data: { name: string; email: string; role: "admin" | "staff" }): Promise<User> {
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
  async login(credentials: { email: string; password: string }): Promise<{ user: User; token: string }> {
    return this.request<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }
}

export const apiService = new ApiService();
export type { Contact, User, ContactFormData };
