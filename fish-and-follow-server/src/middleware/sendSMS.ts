import dotenv from 'dotenv';
dotenv.config();

const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

export async function sendSMS(to: string, body: string) {
  const message = await client.messages.create({
    body,
    from: twilioNumber,
    to,
  });

  console.log("Message sent:", message.sid);
}
