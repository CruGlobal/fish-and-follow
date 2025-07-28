import { Router, Request, Response } from 'express';
import { sendMessage, sendTemplateMessage } from './whatsapp';
import { SendMessageRequest, ApiResponse } from './whatsapp-types';
import { getContactsByIds } from '../contacts/search-utils';

import { LanguagesEnum } from 'whatsapp/build/types/enums';

export const whatsappRouter = Router();

// Helper function to fill template parameters with contact data
const fillTemplateParameters = (
  contact: Record<string, unknown>,
  parameterMapping: string[],
): Record<string, string> => {
  const params: Record<string, string> = {};

  parameterMapping.forEach((fieldName, index) => {
    const paramNumber = (index + 1).toString();
    let value = '';

    if (fieldName && contact[fieldName] !== undefined && contact[fieldName] !== null) {
      const fieldValue = contact[fieldName];

      if (typeof fieldValue === 'boolean') {
        value = fieldValue ? 'Yes' : 'No';
      } else if (typeof fieldValue === 'string' || typeof fieldValue === 'number') {
        value = fieldValue.toString();
      } else {
        // For complex objects, try JSON.stringify or fallback to empty string
        try {
          value = JSON.stringify(fieldValue);
        } catch {
          value = '';
        }
      }
    }

    params[paramNumber] = value;
  });

  return params;
};

// Root endpoint
whatsappRouter.get('/', (req: Request, res: Response) => {
  res.json({ message: 'WhatsApp API root' });
});

// Send regular message endpoint
whatsappRouter.post('/send', async (req: Request, res: Response) => {
  try {
    const body = req.body as SendMessageRequest;
    const to = Number(body.to);
    const message = body.message;

    // Validate required fields
    if (!body.to || !body.message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to and message',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }

    if (isNaN(to)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }

    await sendMessage(to, message);
    res.status(200).json({
      success: true,
      data: { message: 'Message sent successfully' },
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
});

// Send template messages to multiple contacts by ID
whatsappRouter.post('/send_template_message', async (req: Request, res: Response) => {
  try {
    console.log('=== Bulk template endpoint called ===');
    const body = req.body as {
      contactIds: string[];
      template?: string;
      language?: string;
      params?: Record<string, string>;
      fields?: string[]; // Optional additional fields to include in response
      parameterMapping?: string[]; // Ordered list of contact field names for template parameters
    };

    const {
      contactIds,
      template: templateName = 'hello_world',
      language = 'en_US',
      params = {},
      parameterMapping = [], // Default to empty array
      // fields parameter available for potential future use
    } = body;

    // Validate required fields
    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      console.log('❌ Missing required field: contactIds');
      return res.status(400).json({
        success: false,
        error: 'Missing required field: contactIds (array)',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }

    // Import contacts functions

    // Find contacts by IDs (full contact data for phone numbers)
    const fullContactsToMessage = await getContactsByIds(contactIds);

    if (fullContactsToMessage.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No valid contacts found for the provided IDs',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }

    console.log(
      `📱 Sending template "${templateName}" to ${fullContactsToMessage.length} contacts`,
    );

    // Define the result type for template message sending
    interface SendTemplateMessageResult {
      contactId: string;
      contactName: string;
      phoneNumber: string;
      success: boolean;
      result: unknown;
    }

    // Send template messages to all contacts
    const results = await Promise.allSettled(
      fullContactsToMessage.map(async (contact): Promise<SendTemplateMessageResult> => {
        const phoneNumber = Number(contact.phoneNumber.replace(/\D/g, ''));
        if (isNaN(phoneNumber)) {
          throw new Error(`Invalid phone number for contact ${contact.id}: ${contact.phoneNumber}`);
        }

        // Fill template parameters with contact data if parameterMapping is provided
        let finalParams = { ...params };
        if (parameterMapping && parameterMapping.length > 0) {
          const contactParams = fillTemplateParameters(
            contact as unknown as Record<string, unknown>,
            parameterMapping,
          );
          finalParams = { ...finalParams, ...contactParams };
        }

        console.log(
          `Sending to ${contact.firstName} ${contact.lastName} with params:`,
          finalParams,
        );

        const result = await sendTemplateMessage(
          phoneNumber,
          templateName,
          language as LanguagesEnum,
          finalParams,
        );
        return {
          contactId: contact.id,
          contactName: `${contact.firstName} ${contact.lastName}`,
          phoneNumber: contact.phoneNumber,
          success: result.success,
          result: result.data,
        };
      }),
    );

    // Separate successful and failed sends
    const successful = results
      .filter(
        (result): result is PromiseFulfilledResult<SendTemplateMessageResult> =>
          result.status === 'fulfilled',
      )
      .map((result) => result.value);

    const failed = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map((result) => ({
        error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
      }));

    console.log(`✅ Successfully sent to ${successful.filter((r) => r.success).length} contacts`);
    console.log(
      `❌ Failed to send to ${failed.length + successful.filter((r) => !r.success).length} contacts`,
    );

    res.status(200).json({
      success: true,
      data: {
        totalRequested: contactIds.length,
        totalFound: fullContactsToMessage.length,
        totalSent: successful.filter((r) => r.success).length,
        totalFailed: failed.length + successful.filter((r) => !r.success).length,
        results: successful,
        errors: failed,
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('❌ Error in bulk template endpoint:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      success: false,
      error: 'Failed to send bulk template messages',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
});

// Get all available templates endpoint
whatsappRouter.get('/templates', async (req: Request, res: Response) => {
  try {
    console.log('=== Get templates endpoint called ===');

    console.log('Calling getTemplateMessages...');
    const { getTemplateMessages } = await import('./whatsapp');
    const rawTemplates = (await getTemplateMessages()) as {
      data?: Array<{
        name?: string;
        language?: string;
        status?: string;
        category?: string;
        id?: string;
        components?: Array<{
          type?: string;
          text?: string;
          format?: string;
          buttons?: unknown;
          example?: unknown;
        }>;
      }>;
    };
    console.log('✅ getTemplateMessages completed successfully');

    // Transform the raw API response into a cleaner format
    const cleanTemplates =
      rawTemplates?.data?.map((template) => ({
        name: template.name || '',
        language: template.language || '',
        status: template.status || '',
        category: template.category || '',
        id: template.id || '',
        // Include components for detailed view if needed
        components:
          template.components
            ?.map((comp) => ({
              type: comp.type || '',
              text: comp.text || '',
              format: comp.format || '',
              buttons: comp.buttons,
              example: comp.example,
            }))
            .filter((comp) => comp.text || comp.buttons) || [], // Only include meaningful components
      })) || [];

    res.status(200).json({
      success: true,
      templates: cleanTemplates,
      total: cleanTemplates.length,
      timestamp: new Date().toISOString(),
      // Include Facebook Business Manager configuration
      facebookConfig: {
        businessId: '794684380935055',
        assetId: '1291982606049724',
      },
      // Include raw data option via query parameter
      ...(req.query.raw === 'true' && { raw_data: rawTemplates }),
    });
  } catch (error) {
    console.error('❌ Error in get templates endpoint:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve template messages',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
});

// Debug endpoint
whatsappRouter.get('/debug', (req: Request, res: Response) => {
  try {
    const envVars = {
      WA_SENDER_PHONE_NUMBER: process.env.WA_SENDER_PHONE_NUMBER,
      WA_PHONE_NUMBER_ID: process.env.WA_PHONE_NUMBER_ID,
      WA_BUSINESS_ACCOUNT_ID: process.env.WA_BUSINESS_ACCOUNT_ID,
      WA_BUSSINESS_ACCOUNT_ID: process.env.WA_BUSSINESS_ACCOUNT_ID,
      CLOUD_API_ACCESS_TOKEN: process.env.CLOUD_API_ACCESS_TOKEN ? '***HIDDEN***' : 'NOT SET',
      CLOUD_API_VERSION: process.env.CLOUD_API_VERSION,
    };

    res.json({
      success: true,
      message: 'WhatsApp configuration debug info',
      environment: envVars,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
});
