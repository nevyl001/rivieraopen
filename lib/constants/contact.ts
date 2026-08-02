export const CONTACT_EMAIL = "rivieraopen@gmail.com";

export const CONTACT_PHONE_DISPLAY = "+52 (55) 1474-5677";
export const CONTACT_PHONE_TEL = "+525514745677";
export const CONTACT_PHONE_WHATSAPP = "525514745677";

export const CONTACT_WHATSAPP_MESSAGE =
  "Hola Me interesa saber mas de Riviera Open!";

export const CONTACT_WHATSAPP_URL = `https://wa.me/${CONTACT_PHONE_WHATSAPP}?text=${encodeURIComponent(CONTACT_WHATSAPP_MESSAGE)}`;

// Used specifically by the "Conectemos" partnerships/sponsors CTA on the
// contact page - kept separate from CONTACT_WHATSAPP_URL (used elsewhere,
// e.g. the footer) so that link keeps its general-purpose message.
export const CONTACT_WHATSAPP_PARTNERSHIP_MESSAGE =
  "Hola, me interesa conocer más sobre Riviera Open para colaborar, integrar mi comunidad o participar como sponsor.";

export const CONTACT_WHATSAPP_PARTNERSHIP_URL = `https://wa.me/${CONTACT_PHONE_WHATSAPP}?text=${encodeURIComponent(CONTACT_WHATSAPP_PARTNERSHIP_MESSAGE)}`;
