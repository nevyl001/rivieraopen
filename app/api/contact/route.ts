import { NextResponse } from "next/server";
import { z } from "zod";
import { CONTACT_EMAIL } from "@/lib/constants/contact";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email"),
  message: z.string().trim().min(1, "Message is required").max(5000),
  website: z.string().optional(),
});

async function sendViaResend(
  data: z.infer<typeof contactSchema>,
  toEmail: string,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const fromEmail =
    process.env.CONTACT_FROM_EMAIL || "Riviera Open <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: data.email,
      subject: `Contacto web: ${data.name}`,
      text: [
        `Nombre: ${data.name}`,
        `Email: ${data.email}`,
        "",
        data.message,
      ].join("\n"),
    }),
  });

  return response.ok;
}

async function sendViaFormSubmit(
  data: z.infer<typeof contactSchema>,
  toEmail: string,
): Promise<boolean> {
  const response = await fetch(`https://formsubmit.co/ajax/${toEmail}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      message: data.message,
      _subject: `Nuevo mensaje de ${data.name} - Riviera Open`,
      _template: "table",
      _captcha: "false",
    }),
  });

  if (!response.ok) return false;

  try {
    const result = (await response.json()) as { success?: string | boolean };
    return result.success === "true" || result.success === true;
  } catch {
    return true;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = contactSchema.parse(body);

    if (data.website?.trim()) {
      return NextResponse.json({ success: true });
    }

    const toEmail = process.env.CONTACT_TO_EMAIL || CONTACT_EMAIL;

    const sent =
      (await sendViaResend(data, toEmail)) ||
      (await sendViaFormSubmit(data, toEmail));

    if (!sent) {
      return NextResponse.json(
        { error: "No se pudo enviar el mensaje" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.flatten() },
        { status: 400 },
      );
    }

    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Error interno al enviar el mensaje" },
      { status: 500 },
    );
  }
}
