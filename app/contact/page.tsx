"use client";

import { useState } from "react";
import { Container, Card, Button } from "@/components/ui";
import { Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react";
import { TikTokIcon } from "@/components/ui/TikTokIcon";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function ContactPage() {
  const { t } = useTranslation("contact");
  const { t: tCommon } = useTranslation("common");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({ name: "", email: "", message: "" });
    }, 1000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="pt-32 pb-16 bg-gray-50">
      <Container>
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-5xl font-bold text-black mb-4">
            {t("form.contactUs")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            ¿Tienes preguntas sobre torneos, registro o el circuito? Nos
            encantaría escucharte.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <h2 className="font-heading text-2xl font-semibold text-black mb-6">
                {t("form.getInTouch")}
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-accent/10 p-3 rounded-lg shrink-0">
                    <Mail size={24} className="text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-black mb-1">
                      {t("form.email")}
                    </p>
                    <a
                      href="mailto:info@rivieraopen.com"
                      className="text-text-secondary hover:text-accent transition-colors"
                    >
                      info@rivieraopen.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-accent/10 p-3 rounded-lg shrink-0">
                    <Phone size={24} className="text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-black mb-1">
                      {t("form.phone")}
                    </p>
                    <a
                      href="tel:+525519540472"
                      className="text-text-secondary hover:text-accent transition-colors"
                    >
                      +52 (55) 1954-0472
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-accent/10 p-3 rounded-lg shrink-0">
                    <MapPin size={24} className="text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-black mb-1">
                      {tCommon("labels.location")}
                    </p>
                    <p className="text-text-secondary">CDMX, México</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="font-heading text-2xl font-semibold text-black mb-6">
                {t("info.followUs")}
              </h2>
              <p className="text-text-secondary mb-4">
                Mantente conectado con nosotros en redes sociales para las
                últimas actualizaciones, anuncios de torneos y destacados de la
                comunidad.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://instagram.com/rivieraopen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-accent rounded-full transition-colors group"
                >
                  <Instagram
                    size={20}
                    className="text-accent group-hover:text-white"
                  />
                  <span className="text-black group-hover:text-white">
                    Instagram
                  </span>
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61585620090741"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-accent rounded-full transition-colors group"
                >
                  <Facebook
                    size={20}
                    className="text-accent group-hover:text-white"
                  />
                  <span className="text-black group-hover:text-white">
                    Facebook
                  </span>
                </a>
                <a
                  href="https://tiktok.com/@rivieraopen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-accent rounded-full transition-colors group"
                >
                  <TikTokIcon
                    size={20}
                    className="text-accent group-hover:text-white"
                  />
                  <span className="text-black group-hover:text-white">
                    TikTok
                  </span>
                </a>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <Card>
            <h2 className="font-heading text-2xl font-semibold text-black mb-6">
              Envíanos un Mensaje
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-black mb-2"
                >
                  {t("form.name")} *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder={t("placeholders.enterName")}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-black mb-2"
                >
                  {t("form.email")} *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder={t("placeholders.enterEmail")}
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-black mb-2"
                >
                  {t("form.message")} *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  placeholder={t("placeholders.enterMessage")}
                />
              </div>

              {submitStatus === "success" && (
                <div className="p-4 bg-success/10 text-success rounded-lg">
                  {t("success.thankYou")}! {t("success.willRespond")}.
                </div>
              )}

              {submitStatus === "error" && (
                <div className="p-4 bg-error/10 text-error rounded-lg">
                  {t("error.sendFailed")}. {t("error.tryAgain")}.
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? t("form.sending") : t("form.send")}
              </Button>
            </form>
          </Card>
        </div>
      </Container>
    </div>
  );
}
