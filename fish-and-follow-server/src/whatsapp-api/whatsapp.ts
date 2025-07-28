import WhatsApp from 'whatsapp';
import 'dotenv/config';
import { MessageTemplateObject } from 'whatsapp/build/types/messages';
import { LanguagesEnum, ComponentTypesEnum, ParametersTypesEnum } from 'whatsapp/build/types/enums';
import { TemplateMessageResult } from './whatsapp-types';

// Webhook types (for future webhook implementation)
/*
interface WebhookHeaders {
  [key: string]: string | string[] | undefined;
}
interface WebhookResponse {
  writeHead(statusCode: number, headers: { [key: string]: string }): void;
  end(): void;
}
type WebhookObject = { [key: string]: unknown };
*/

// Your test sender phone number
const senderPhoneNumber = process.env.WA_PHONE_NUMBER_ID
  ? Number(process.env.WA_PHONE_NUMBER_ID)
  : undefined;

console.log('Initializing WhatsApp with sender phone number:', senderPhoneNumber);
const wa = new WhatsApp(senderPhoneNumber);

// Enter the recipient phone number
// const recipient_number = 14169965733;

export async function sendMessage(to: number, message: string): Promise<void> {
  try {
    const sendTextMessage = wa.messages.text({ body: message }, to);

    const res = await sendTextMessage;
    console.log(res.rawResponse());
  } catch (e) {
    console.log(JSON.stringify(e));
  }
  console.log('Message sent');
}

export async function sendTemplateMessage(
  to: number,
  templateName: string,
  language: LanguagesEnum = LanguagesEnum.English_US,
  params: Record<string, string>,
): Promise<TemplateMessageResult> {
  console.log(`=== START: sendTemplateMessage function called ===`);
  console.log(`Target: ${to}, Template: ${templateName}, Language: ${language}, Params:`, params);

  try {
    // Create template configuration with proper typing
    const template: MessageTemplateObject<ComponentTypesEnum> = {
      name: templateName,
      // @ts-expect-error - WhatsApp library types don't match the actual API structure for language field
      language: {
        code: language, // Use the provided language enum
      },
      components:
        Object.keys(params).length > 0
          ? [
              {
                type: ComponentTypesEnum.Body,
                parameters: Object.entries(params).map(([_, value]) => ({
                  type: ParametersTypesEnum.Text,
                  text: value,
                })),
              },
            ]
          : [],
    };

    console.log('WhatsApp API template config:', JSON.stringify(template, null, 2));

    const res = await wa.messages.template(template, to);
    const responseData = await res.responseBodyToJSON();
    const { messaging_product, contacts, messages, error } = responseData;

    if (error) {
      return {
        success: false,
        data: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          message: String(error.message || 'Failed to send template message'),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          code: error.code || 'UNKNOWN_ERROR',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          error_data: error.error_data,
        },
      };
    }

    return {
      success: true,
      data: {
        messaging_product,
        contacts,
        messages,
      },
    };
  } catch (error) {
    console.error('❌ Error sending template message:', error);
    return {
      success: false,
      data: {
        message: 'Failed to send template message',
        code: 'UNKNOWN_ERROR',
        error_data: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

export async function getTemplateMessages(): Promise<unknown> {
  console.log('=== START: getTemplateMessages function called ===');

  try {
    // This requires making a direct HTTP request to the WhatsApp Business API
    // GET /v16.0/{whatsapp-business-account-id}/message_templates
    // Try business account ID first, then fall back to phone number ID
    const businessAccountId = process.env.WA_BUSINESS_ACCOUNT_ID;
    const accessToken = process.env.CLOUD_API_ACCESS_TOKEN;

    if (!businessAccountId || !accessToken) {
      throw new Error(
        'Missing required environment variables: WA_BUSINESS_ACCOUNT_ID (or WA_BUSSINESS_ACCOUNT_ID or WA_PHONE_NUMBER_ID) and CLOUD_API_ACCESS_TOKEN',
      );
    }

    console.log(`Using account ID: ${businessAccountId}`);

    const response = await fetch(
      `https://graph.facebook.com/v16.0/${businessAccountId}/message_templates`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log(`API Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('API Error Response:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const templates = await response.json();
    console.log('✅ Templates retrieved using direct API call');
    console.log('Templates response:', JSON.stringify(templates, null, 2));

    return templates;
  } catch (e) {
    console.error('❌ Error in getTemplateMessages:', e);
    console.error('Error details:', JSON.stringify(e, null, 2));
    throw e;
  } finally {
    console.log('=== END: getTemplateMessages function ===');
  }
}
