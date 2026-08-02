import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimitMiddleware, getClientIp } from "@/lib/admin/security/rateLimitMiddleware";
import { RATE_LIMITS } from "@/lib/admin/security/rateLimit";

// Generous headroom over the actual field limits below.
const MAX_BODY_BYTES = 16 * 1024;

const ALLOWED_FIELDS = new Set([
  "nombre",
  "email",
  "telefono",
  "asunto",
  "mensaje",
  "website", // honeypot - must stay empty
]);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactFormData {
  nombre: string;
  email: string;
  mensaje: string;
  telefono?: string;
  asunto?: string;
}

type ValidationResult =
  | { valid: true; data: ContactFormData; honeypotTriggered: boolean }
  | { valid: false; error: string };

/** Strips control characters from a value that must stay a single line
 * (these feed into the email subject) - prevents header/line injection
 * without touching legitimate accented/unicode text. */
function sanitizeSingleLine(value: string): string {
  return value
    .replace(/[\x00-\x1F\x7F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Normalizes line endings and strips non-printable control characters
 * from the free-text message, but keeps newlines - legitimate messages
 * are multi-line. */
function sanitizeMultiLine(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim();
}

function validateContactForm(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { valid: false, error: "Solicitud inválida" };
  }

  const record = body as Record<string, unknown>;
  const unexpectedKeys = Object.keys(record).filter(
    (key) => !ALLOWED_FIELDS.has(key),
  );
  if (unexpectedKeys.length > 0) {
    return { valid: false, error: "Solicitud inválida" };
  }

  const website = record.website;
  if (website !== undefined && typeof website !== "string") {
    return { valid: false, error: "Solicitud inválida" };
  }
  const honeypotTriggered = Boolean(website && website.trim().length > 0);

  const { nombre: nombreRaw, email: emailRaw, mensaje: mensajeRaw, telefono: telefonoRaw, asunto: asuntoRaw } =
    record;

  if (
    typeof nombreRaw !== "string" ||
    typeof emailRaw !== "string" ||
    typeof mensajeRaw !== "string"
  ) {
    return { valid: false, error: "Todos los campos son obligatorios" };
  }
  if (telefonoRaw !== undefined && typeof telefonoRaw !== "string") {
    return { valid: false, error: "Teléfono inválido" };
  }
  if (asuntoRaw !== undefined && typeof asuntoRaw !== "string") {
    return { valid: false, error: "Asunto inválido" };
  }

  // Honeypot trips skip further validation - the response must stay neutral
  // either way, and we don't need to bother validating a bot's payload.
  if (honeypotTriggered) {
    return {
      valid: true,
      data: { nombre: "", email: "", mensaje: "" },
      honeypotTriggered: true,
    };
  }

  const nombre = sanitizeSingleLine(nombreRaw);
  const email = sanitizeSingleLine(emailRaw);
  const mensaje = sanitizeMultiLine(mensajeRaw);
  const telefono = telefonoRaw !== undefined ? sanitizeSingleLine(telefonoRaw) : undefined;
  const asunto = asuntoRaw !== undefined ? sanitizeSingleLine(asuntoRaw) : undefined;

  if (nombre.length < 2 || nombre.length > 80) {
    return { valid: false, error: "El nombre debe tener entre 2 y 80 caracteres" };
  }
  if (email.length > 254 || !EMAIL_REGEX.test(email)) {
    return { valid: false, error: "El correo no es válido" };
  }
  if (mensaje.length < 10 || mensaje.length > 2000) {
    return { valid: false, error: "El mensaje debe tener entre 10 y 2000 caracteres" };
  }
  if (telefono !== undefined && telefono.length > 30) {
    return { valid: false, error: "El teléfono no es válido" };
  }
  if (asunto !== undefined && asunto.length > 120) {
    return { valid: false, error: "El asunto no es válido" };
  }

  return {
    valid: true,
    data: { nombre, email, mensaje, telefono, asunto },
    honeypotTriggered: false,
  };
}

export async function POST(request: NextRequest) {
  // 1. Rate limit by IP, before touching the body.
  const rateLimitResponse = await rateLimitMiddleware(request, RATE_LIMITS.CONTACT);
  if (rateLimitResponse) {
    console.warn("Contact: rate limit exceeded", { ip: getClientIp(request) });
    return rateLimitResponse;
  }

  // 2. Content-Type must be JSON.
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json(
      { error: "Content-Type debe ser application/json" },
      { status: 415 },
    );
  }

  // 3. Reject oversized requests before parsing. Content-Length can be
  // omitted or spoofed by a client, so this is an early mitigation, not
  // the only safeguard - field length limits are enforced again below.
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "Solicitud demasiado grande" },
      { status: 413 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const validation = validateContactForm(body);
  if (!validation.valid) {
    console.warn("Contact: rejected", { reason: validation.error });
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // Bots that fill the honeypot get a neutral success response - no email
  // is sent, and the response is indistinguishable from a real success so
  // there's nothing for a bot to learn from.
  if (validation.honeypotTriggered) {
    console.warn("Contact: honeypot triggered", { ip: getClientIp(request) });
    return NextResponse.json({ success: true });
  }

  const { nombre, email, mensaje, telefono, asunto } = validation.data;

  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Servicio de email no configurado" },
        { status: 500 },
      );
    }

    const resend = new Resend(apiKey);
    const bodyLines = [
      `Nombre: ${nombre}`,
      `Email: ${email}`,
      ...(telefono ? [`Teléfono: ${telefono}`] : []),
      ...(asunto ? [`Asunto: ${asunto}`] : []),
      `Mensaje: ${mensaje}`,
    ];

    const { error } = await resend.emails.send({
      from: "Riviera Open <contacto@appriviera.rivieraopen.com>",
      to: "rivieraopen@gmail.com",
      subject: "Nuevo mensaje de contacto - " + nombre,
      text: bodyLines.join("\n"),
    });

    if (error) {
      // Log server-side for debugging - Resend's error describes a
      // delivery/API failure, not the submitted message content. The
      // client only ever gets the generic message below.
      console.error("Contact: Resend error", error);
      return NextResponse.json(
        { error: "No se pudo enviar el mensaje" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact: unexpected error", error);
    return NextResponse.json(
      { error: "Error interno al enviar el mensaje" },
      { status: 500 },
    );
  }
}
