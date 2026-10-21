// emailAlerts.js
import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

export async function sendBuySignalEmail(cis, qty, price) {
  if (!process.env.EMAIL_TO) return;

  const subject = `Buy signal: ${cis.tradingsymbol} @ ${price}`;
  const text = `Buy signal triggered

Symbol: ${cis.tradingsymbol}
Strategy: ${cis.buyStrategy}
Price: ${price}
Quantity: ${qty}
Time: ${global.clock || new Date().toString()}
`;

  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject,
      text,
    });
    console.log(`Buy signal email sent for ${cis.tradingsymbol}`);
  } catch (error) {
    console.error('Failed to send buy signal email:', error.message);
  }
}
