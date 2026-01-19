import { appConfig } from "@/lib/config";

const sendMail = async (to: string, subject: string, html: string) => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("RESEND_API_KEY is not set. Email not sent.");
    return;
  }

  const from = `${appConfig.email.senderName} <${appConfig.email.senderEmail}>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    console.error("Failed to send email via Resend:", errorText);
  }
};

export default sendMail;
