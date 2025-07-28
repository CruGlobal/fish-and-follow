// WhatsApp Template Types
export interface TemplateButton {
  type: string;
  text: string;
  url?: string;
}

export interface TemplateExample {
  body_text?: string[][];
  header_text?: string[];
}

export interface TemplateComponent {
  type: string;
  text?: string;
  format?: string;
  buttons?: TemplateButton[];
  example?: TemplateExample;
}

export interface WhatsAppTemplate {
  name: string;
  language: string;
  status: string;
  category: string;
  id: string;
  components?: TemplateComponent[];
}

export interface WhatsAppTemplatesResponse {
  data: WhatsAppTemplate[];
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
  };
}

// Request/Response types
export interface SendMessageRequest {
  to: string | number;
  message: string;
}

export interface SendTemplateMessageRequest {
  to: string | number;
  template?: string;
  language?: string;
  params?: Record<string, string>;
}

export interface BulkTemplateMessageRequest {
  contactIds: string[];
  template?: string;
  language?: string;
  params?: Record<string, string>;
  fields?: string[]; // Optional additional fields to include in response
  parameterMapping?: string[]; // Ordered list of contact field names for template parameters
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  timestamp: string;
}

// WhatsApp Template Message Response Types
export interface WhatsAppContact {
  input: string;
  wa_id: string;
}

export interface WhatsAppMessage {
  id: string;
  message_status?: string;
  wa_id?: string;
}

export interface WhatsAppError {
  message: string;
  code: number | string;
  error_data?: unknown;
  type?: string;
  error_subcode?: string;
  error_user_title?: string;
  error_user_msg?: string;
}

// Template Message Function Return Types
export interface TemplateMessageSuccessResult {
  success: true;
  data: {
    messaging_product: 'whatsapp';
    contacts: WhatsAppContact[];
    messages: WhatsAppMessage[];
  };
}

export interface TemplateMessageErrorResult {
  success: false;
  data?: {
    message: string;
    code: number | string;
    error_data?: unknown;
  };
  error?: string;
  details?: string;
}

export type TemplateMessageResult = TemplateMessageSuccessResult | TemplateMessageErrorResult;
