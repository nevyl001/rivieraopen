const COUNTRY_NAMES: Record<string, string> = {
  MX: "México",
  US: "Estados Unidos",
  ES: "España",
  AR: "Argentina",
  CO: "Colombia",
  CL: "Chile",
  PE: "Perú",
  VE: "Venezuela",
  EC: "Ecuador",
  GT: "Guatemala",
  CR: "Costa Rica",
  PA: "Panamá",
  UY: "Uruguay",
  PY: "Paraguay",
  BO: "Bolivia",
  HN: "Honduras",
  SV: "El Salvador",
  NI: "Nicaragua",
  DO: "República Dominicana",
  PR: "Puerto Rico",
};

export function countryCodeToFlag(code: string): string {
  const upper = code.trim().toUpperCase();
  if (upper.length !== 2 || !/^[A-Z]{2}$/.test(upper)) {
    return "";
  }
  return String.fromCodePoint(
    ...upper.split("").map((char) => 0x1f1e6 + char.charCodeAt(0) - 65)
  );
}

export function getCountryName(code: string): string {
  return COUNTRY_NAMES[code.trim().toUpperCase()] ?? code.toUpperCase();
}

interface CountryFlagProps {
  code: string;
  showName?: boolean;
  size?: "sm" | "md" | "lg";
}

const flagSizes = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-5xl",
};

export function CountryFlag({
  code,
  showName = true,
  size = "md",
}: CountryFlagProps) {
  const flag = countryCodeToFlag(code);
  if (!flag) return <span className="text-primary">{code}</span>;

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`${flagSizes[size]} leading-none`}
        role="img"
        aria-label={getCountryName(code)}
      >
        {flag}
      </span>
      {showName && (
        <span className="font-medium text-primary text-base">
          {getCountryName(code)}
        </span>
      )}
    </span>
  );
}
