
export interface TemplateComponent {
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

export interface TemplateItem {
  id: string;
  name: string;
  language: string;
  status: string;
  category: string;
  components: TemplateComponent[];
}

export interface FacebookConfig {
  businessId: string;
  assetId: string;
}

export interface Template {
  success: boolean
  templates: TemplateItem[];
  timestamp: string;
  total: number;
  facebookConfig: FacebookConfig;
}

export interface BulkTemplateMessageRequest {
  contactIds: string[];
  template?: string;
  language?: string;
  params?: Record<string, string>;
  fields?: string[];
  parameterMapping?: string[]; // Ordered list of contact field names for template parameters
}

export interface BulkTemplateMessageResponse {
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
