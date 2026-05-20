import { Container } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Política de Privacidad de Riviera Open. Conoce cómo recopilamos, usamos y protegemos tu información personal.",
};

export default function PrivacyPage() {
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
            Política de Privacidad
          </h1>
          <p className="text-gray-600 mb-8">Última actualización: {today}</p>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              En Riviera Open valoramos tu privacidad. Esta Política de
              Privacidad describe qué datos recopilamos, cómo los usamos y qué
              opciones tienes respecto a tu información cuando visitas nuestro
              sitio y/o te registras a torneos.
            </p>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              1) Quiénes somos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              El responsable del tratamiento de datos es Riviera Open
              ("nosotros"). Contacto: info@rivieraopen.com
            </p>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              2) Qué información recopilamos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Recopilamos información de manera directa cuando la proporcionas
              y, en algunos casos, información técnica generada al usar el
              sitio.
            </p>

            <h3 className="font-heading text-xl font-semibold text-black mt-6 mb-3">
              A. Información que tú nos proporcionas
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>
                <strong>Registro a torneos:</strong> nombre, apellidos, correo,
                teléfono (si aplica), categoría/nivel, pareja (si aplica),
                club/ciudad (si aplica).
              </li>
              <li>
                <strong>Cuenta o perfil (si existe):</strong> nombre visible,
                foto (si aplica), resultados/participaciones.
              </li>
              <li>
                <strong>Comunicaciones:</strong> mensajes que nos envíes (por
                formulario, correo o redes).
              </li>
            </ul>

            <h3 className="font-heading text-xl font-semibold text-black mt-6 mb-3">
              B. Información publicada en el sitio (no sensible)
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>
                <strong>Información de torneos:</strong> draws, horarios,
                resultados, rankings, categorías.
              </li>
              <li>
                <strong>Fotos y contenido audiovisual:</strong> imágenes de
                torneos, premiaciones, experiencias y actividades del circuito.
              </li>
            </ul>

            <h3 className="font-heading text-xl font-semibold text-black mt-6 mb-3">
              C. Información técnica
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Dirección IP aproximada, tipo de navegador/dispositivo, páginas
              visitadas, fecha/hora, y eventos de navegación (generalmente
              mediante cookies o herramientas de analítica).
            </p>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              3) Para qué usamos tu información
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Usamos tus datos para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>
                Gestionar tu registro, participación y comunicación relacionada
                con torneos.
              </li>
              <li>
                Publicar horarios, resultados, rankings y contenido del
                circuito.
              </li>
              <li>Mantener la operación, seguridad y mejora del sitio.</li>
              <li>Responder dudas, solicitudes o incidencias.</li>
              <li>
                Enviar comunicaciones relacionadas con el circuito
                (confirmaciones, cambios de horario, información de torneos). Si
                enviamos marketing/promociones, incluiremos opción de darte de
                baja.
              </li>
            </ul>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              4) Base legal (por qué estamos autorizados)
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Tratamos datos principalmente por:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>
                <strong>Ejecución de un servicio</strong> (gestionar tu
                inscripción y participación).
              </li>
              <li>
                <strong>Interés legítimo</strong> (operación del sitio,
                seguridad, publicaciones deportivas del circuito).
              </li>
              <li>
                <strong>Consentimiento</strong> (por ejemplo, para ciertos tipos
                de cookies o comunicaciones promocionales, cuando aplique).
              </li>
            </ul>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              5) Fotos, resultados y contenido del circuito
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Al participar en eventos de Riviera Open, es posible que se tomen
              fotografías y videos para fines informativos y promocionales del
              circuito (sitio y redes sociales). Si deseas solicitar la remoción
              de una foto donde apareces, contáctanos en info@rivieraopen.com
              con la liga o captura del contenido y haremos lo razonable para
              atender tu solicitud.
            </p>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              6) Con quién compartimos tu información
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              No vendemos tus datos. Podemos compartir información en estos
              casos:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>
                <strong>Proveedores de servicio</strong> que nos ayudan a operar
                el sitio (hosting, correo, formularios, analítica,
                almacenamiento de fotos, CRM).
              </li>
              <li>
                <strong>Organización del torneo:</strong> para coordinar llaves,
                horarios, comunicación logística y operación del evento.
              </li>
              <li>
                <strong>Autoridades:</strong> si existe obligación legal o
                requerimiento válido.
              </li>
            </ul>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              7) Transferencias internacionales
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Algunos proveedores pueden procesar datos fuera de México. Cuando
              aplique, procuramos que existan medidas razonables para proteger
              tu información conforme a estándares de la industria.
            </p>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              8) Cookies y tecnologías similares
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Podemos usar cookies para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>
                <strong>Funcionamiento del sitio</strong> (cookies esenciales).
              </li>
              <li>
                <strong>Analítica y mejora</strong> (medición de visitas y
                comportamiento general).
              </li>
              <li>
                <strong>Preferencias</strong> (idioma, sesión, etc.).
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              Puedes controlar o eliminar cookies desde la configuración de tu
              navegador. Si deshabilitas ciertas cookies, algunas funciones del
              sitio podrían no operar correctamente.
            </p>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              9) Por cuánto tiempo conservamos tu información
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Conservamos los datos solo el tiempo necesario para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Gestión del torneo y operación del circuito.</li>
              <li>Cumplimiento de obligaciones administrativas o legales.</li>
              <li>
                Historial deportivo (resultados/rankings) cuando sea razonable y
                relevante para el circuito.
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              Cuando ya no sea necesario, eliminamos o anonimizamos la
              información.
            </p>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              10) Seguridad de la información
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Aplicamos medidas razonables de seguridad (técnicas y
              organizativas) para proteger tu información. Aun así, ninguna
              transmisión o almacenamiento es 100% infalible, por lo que no
              podemos garantizar seguridad absoluta.
            </p>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              11) Tus derechos y cómo ejercerlos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Dependiendo de la legislación aplicable, puedes solicitar:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Acceso a tus datos.</li>
              <li>Corrección/actualización.</li>
              <li>Cancelación o eliminación (cuando proceda).</li>
              <li>Oposición o limitación al tratamiento.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para ejercerlos, escríbenos a info@rivieraopen.com con:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>Tu nombre completo,</li>
              <li>El correo con el que te registraste,</li>
              <li>Tu solicitud específica.</li>
            </ul>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              12) Privacidad de menores
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              El sitio y los torneos no están dirigidos intencionalmente a
              menores sin autorización de su tutor. Si consideras que un menor
              nos proporcionó datos sin consentimiento, contáctanos para
              revisarlo.
            </p>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              13) Cambios a esta política
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Podemos actualizar esta Política de Privacidad cuando sea
              necesario. Publicaremos la versión vigente en esta página e
              indicaremos la fecha de última actualización.
            </p>

            <h2 className="font-heading text-2xl font-semibold text-black mt-8 mb-4">
              14) Contacto
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Para dudas o solicitudes relacionadas con privacidad:{" "}
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
