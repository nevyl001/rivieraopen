import { Container } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos de Servicio",
  description:
    "Términos de Servicio de Riviera Open. Conoce las condiciones de uso de nuestro sitio y participación en torneos.",
};

export default function TermsPage() {
  const today = new Date().toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="pt-32 pb-16 bg-gray-50">
      <Container>
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-5xl font-bold text-black mb-4">
            Términos de Servicio
          </h1>
          <p className="text-gray-600 mb-8">Última actualización: {today}</p>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              Bienvenido(a) a Riviera Open ("Riviera Open", "nosotros",
              "nuestro"). Al acceder, navegar o registrarte en nuestro sitio (el
              "Sitio"), aceptas estos Términos de Servicio (los "Términos"). Si
              no estás de acuerdo, por favor no uses el Sitio.
            </p>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              1) Alcance del Sitio
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              El Sitio ofrece información relacionada con el circuito
              (incluyendo torneos, categorías, horarios, draws, resultados,
              rankings y contenido audiovisual) y permite el registro a torneos
              y/o eventos.
            </p>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              2) Elegibilidad
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Al usar el Sitio declaras que:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>
                Tienes capacidad legal para aceptar estos Términos, o cuentas
                con autorización de tu tutor (si aplica).
              </li>
              <li>
                La información que proporcionas en registros es veraz y
                actualizada.
              </li>
            </ul>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              3) Registro y participación en torneos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Al registrarte a un torneo o evento:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>
                Aceptas proporcionar información correcta (por ejemplo: nombre,
                correo, categoría, pareja, etc.).
              </li>
              <li>
                Reconoces que la participación puede estar sujeta a cupos,
                criterios de categoría/nivel, y validaciones organizativas.
              </li>
              <li>
                Aceptas respetar reglamentos y lineamientos del torneo
                (horarios, sedes, conducta, formato, scoring, etc.) que se
                informen en el Sitio o por canales oficiales.
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              <strong>Importante:</strong> Riviera Open se reserva el derecho de
              rechazar, cancelar o ajustar registros cuando sea necesario para
              mantener la integridad del evento (por ejemplo: cupo completo,
              información inconsistente, categoría incorrecta, conducta
              inapropiada o incumplimiento de reglas).
            </p>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              4) Información pública del circuito
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Como parte del funcionamiento deportivo, el Sitio puede mostrar
              públicamente:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>
                Nombres de participantes (y/o pareja), categoría, resultados,
                horarios, draws, estadísticas básicas y rankings.
              </li>
              <li>Fotografías y videos de eventos.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              Si deseas solicitar la corrección de un dato público o la remoción
              de una imagen, contáctanos en{" "}
              <a
                href="mailto:info@rivieraopen.com"
                className="text-accent hover:opacity-70 transition-opacity"
              >
                info@rivieraopen.com
              </a>
              .
            </p>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              5) Conducta del usuario
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Te comprometes a usar el Sitio de forma responsable y a no:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>
                Publicar o transmitir contenido ilegal, ofensivo, difamatorio,
                discriminatorio o que viole derechos de terceros.
              </li>
              <li>
                Intentar vulnerar la seguridad del Sitio (hacking, scraping
                agresivo, ataques, acceso no autorizado).
              </li>
              <li>Usar el Sitio para suplantación de identidad o fraude.</li>
              <li>
                Interferir con el funcionamiento normal del Sitio o con la
                experiencia de otros usuarios.
              </li>
            </ul>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              6) Pagos, cuotas y reembolsos (si aplica)
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Si el Sitio o el circuito incorpora cuotas de inscripción, pagos o
              cobros:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>
                Las cuotas, lo incluido y las fechas límite se informarán en el
                Sitio o canales oficiales.
              </li>
              <li>
                Salvo que se indique lo contrario por escrito, las inscripciones
                pueden ser no reembolsables por razones operativas (planeación
                de llaves, horarios, venue, staff, etc.).
              </li>
              <li>
                Riviera Open podrá ofrecer créditos, cambios o reprogramaciones
                en casos específicos (por ejemplo: cancelación del evento,
                causas de fuerza mayor o decisiones organizativas).
              </li>
            </ul>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              7) Cambios, cancelaciones y fuerza mayor
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Riviera Open puede modificar:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>
                Sede, horarios, formato, categorías, reglas y logística por
                razones organizativas o de seguridad.
              </li>
              <li>
                La calendarización por clima, mantenimiento, disponibilidad del
                venue, causas de fuerza mayor o circunstancias fuera de nuestro
                control.
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              En caso de cancelación total del evento, comunicaremos las
              opciones disponibles (reprogramación, crédito, reembolso
              parcial/total si aplica).
            </p>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              8) Propiedad intelectual
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Todo el contenido del Sitio (marca, logotipos, textos, diseños,
              fotografías, videos, gráficos, formatos y compilaciones) es
              propiedad de Riviera Open o se utiliza con autorización. No puedes
              copiar, reproducir, modificar, distribuir o explotar
              comercialmente el contenido sin permiso previo por escrito, salvo
              usos permitidos por ley.
            </p>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              9) Contenido aportado por usuarios (si aplica)
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Si el Sitio permite subir fotos, comentarios, datos o cualquier
              contenido:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>
                Garantizas que tienes derecho de compartirlo y que no infringe
                derechos de terceros.
              </li>
              <li>
                Otorgas a Riviera Open una licencia no exclusiva para usarlo en
                relación con la operación y promoción del circuito (por ejemplo,
                mostrarlo en el Sitio o redes), salvo que acordemos lo
                contrario.
              </li>
            </ul>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              10) Enlaces a terceros
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              El Sitio puede contener enlaces a sitios o servicios de terceros
              (por ejemplo: sedes, redes sociales, pasarelas de pago). Riviera
              Open no controla dichos sitios y no es responsable por su
              contenido, políticas o prácticas.
            </p>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              11) Limitación de responsabilidad
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              En la máxima medida permitida por la ley:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>El Sitio se ofrece "tal cual" y "según disponibilidad".</li>
              <li>
                Riviera Open no garantiza que el Sitio funcione sin
                interrupciones o errores.
              </li>
              <li>
                Riviera Open no será responsable por daños indirectos,
                incidentales, especiales o consecuentes derivados del uso del
                Sitio o de la imposibilidad de usarlo.
              </li>
              <li>
                La participación en torneos implica riesgos propios de la
                actividad deportiva. Cada participante es responsable de su
                condición física y de seguir recomendaciones médicas y de
                seguridad, así como lineamientos del venue.
              </li>
            </ul>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              12) Privacidad
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              El uso de tus datos personales se rige por nuestra{" "}
              <a
                href="/privacy"
                className="text-accent hover:opacity-70 transition-opacity"
              >
                Política de Privacidad
              </a>{" "}
              disponible en el Sitio. Al aceptar estos Términos, aceptas también
              dicha política.
            </p>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              13) Suspensión o terminación
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Podemos suspender o restringir el acceso al Sitio, o cancelar
              registros, si detectamos violaciones a estos Términos, actividades
              sospechosas o por razones de seguridad/operación.
            </p>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              14) Cambios a los Términos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Podemos actualizar estos Términos en cualquier momento.
              Publicaremos la versión vigente en el Sitio e indicaremos la fecha
              de actualización. El uso continuo del Sitio después de cambios
              implica aceptación de los Términos actualizados.
            </p>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              15) Ley aplicable y jurisdicción
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Estos Términos se rigen por las leyes aplicables en México.
              Cualquier controversia se someterá a los tribunales competentes de
              Ciudad de México, salvo que la ley disponga otra cosa.
            </p>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              16) Contacto
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Para dudas sobre estos Términos o el Sitio:{" "}
              <a
                href="mailto:info@rivieraopen.com"
                className="text-accent hover:opacity-70 transition-opacity"
              >
                info@rivieraopen.com
              </a>
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
