export interface Country {
    name: string;
    code: string;
    flag: string;
    iso: string;
}

export const countries: Country[] = [
    { name: "Colombia", code: "+57", flag: "🇨🇴", iso: "CO" },
    { name: "México", code: "+52", flag: "🇲🇽", iso: "MX" },
    { name: "Estados Unidos", code: "+1", flag: "🇺🇸", iso: "US" },
    { name: "España", code: "+34", flag: "🇪🇸", iso: "ES" },
    { name: "Argentina", code: "+54", flag: "🇦🇷", iso: "AR" },
    { name: "Perú", code: "+51", flag: "🇵🇪", iso: "PE" },
    { name: "Chile", code: "+56", flag: "🇨🇱", iso: "CL" },
    { name: "Ecuador", code: "+593", flag: "🇪🇨", iso: "EC" },
    { name: "Venezuela", code: "+58", flag: "🇻🇪", iso: "VE" },
    { name: "Panamá", code: "+507", flag: "🇵🇦", iso: "PA" },
    { name: "Costa Rica", code: "+506", flag: "🇨🇷", iso: "CR" },
    { name: "Rep. Dominicana", code: "+1", flag: "🇩🇴", iso: "DO" },
    { name: "Bolivia", code: "+591", flag: "🇧🇴", iso: "BO" },
    { name: "Uruguay", code: "+598", flag: "🇺🇾", iso: "UY" },
    { name: "Paraguay", code: "+595", flag: "🇵🇾", iso: "PY" },
    { name: "El Salvador", code: "+503", flag: "🇸🇻", iso: "SV" },
    { name: "Guatemala", code: "+502", flag: "🇬🇹", iso: "GT" },
    { name: "Honduras", code: "+504", flag: "🇭🇳", iso: "HN" },
];