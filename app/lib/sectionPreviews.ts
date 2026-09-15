/**
 * SVG Preview illustrations for each section type and variant.
 * Similar to Shopify's section previews in the component picker.
 */

export interface SectionPreview {
  svg: string
  label: string
}

const PREVIEW_SVGS: Record<string, Record<string, SectionPreview>> = {
  hero: {
    classic: {
      label: 'Clásico',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f1f5f9"/>
        <rect x="0" y="0" width="320" height="200" fill="url(#hero-grad)"/>
        <rect x="24" y="60" width="120" height="12" rx="2" fill="white" opacity="0.9"/>
        <rect x="24" y="80" width="160" height="8" rx="1.5" fill="white" opacity="0.6"/>
        <rect x="24" y="96" width="140" height="8" rx="1.5" fill="white" opacity="0.5"/>
        <rect x="24" y="120" width="60" height="28" rx="6" fill="white"/>
        <rect x="92" y="120" width="60" height="28" rx="6" fill="white" opacity="0.2" stroke="white" stroke-width="1.5"/>
        <rect x="200" y="40" width="100" height="120" rx="8" fill="white" opacity="0.15"/>
        <rect x="210" y="50" width="80" height="12" rx="2" fill="white" opacity="0.4"/>
        <rect x="210" y="72" width="60" height="8" rx="1" fill="white" opacity="0.3"/>
        <rect x="210" y="88" width="70" height="8" rx="1" fill="white" opacity="0.3"/>
        <defs><linearGradient id="hero-grad" x1="0" y1="0" x2="320" y2="200"><stop stop-color="#7c3aed"/><stop offset="1" stop-color="#3b82f6"/></linearGradient></defs>
      </svg>`,
    },
    centered: {
      label: 'Centrado',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f1f5f9"/>
        <rect x="0" y="0" width="320" height="200" fill="url(#hero-c-grad)"/>
        <rect x="80" y="50" width="160" height="14" rx="3" fill="white" opacity="0.9"/>
        <rect x="60" y="74" width="200" height="8" rx="1.5" fill="white" opacity="0.6"/>
        <rect x="70" y="90" width="180" height="8" rx="1.5" fill="white" opacity="0.5"/>
        <rect x="120" y="116" width="80" height="30" rx="7" fill="white"/>
        <defs><linearGradient id="hero-c-grad" x1="0" y1="0" x2="320" y2="200"><stop stop-color="#6366f1"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs>
      </svg>`,
    },
    split: {
      label: 'Dividido',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="0" y="0" width="150" height="200" fill="#1e293b"/>
        <rect x="20" y="50" width="110" height="12" rx="2" fill="white" opacity="0.9"/>
        <rect x="20" y="70" width="100" height="8" rx="1.5" fill="white" opacity="0.6"/>
        <rect x="20" y="86" width="90" height="8" rx="1.5" fill="white" opacity="0.5"/>
        <rect x="20" y="110" width="70" height="26" rx="6" fill="#6366f1"/>
        <rect x="170" y="20" width="130" height="160" rx="12" fill="#e2e8f0"/>
        <rect x="185" y="35" width="100" height="100" rx="8" fill="#cbd5e1"/>
      </svg>`,
    },
    slider: {
      label: 'Slider',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f1f5f9"/>
        <rect x="10" y="10" width="300" height="150" rx="10" fill="url(#hero-s-grad)"/>
        <rect x="30" y="50" width="120" height="12" rx="2" fill="white" opacity="0.9"/>
        <rect x="30" y="70" width="100" height="8" rx="1.5" fill="white" opacity="0.6"/>
        <rect x="30" y="94" width="70" height="24" rx="5" fill="white"/>
        <circle cx="145" cy="175" r="4" fill="#6366f1"/>
        <circle cx="160" cy="175" r="4" fill="#cbd5e1"/>
        <circle cx="175" cy="175" r="4" fill="#cbd5e1"/>
        <defs><linearGradient id="hero-s-grad" x1="0" y1="0" x2="320" y2="160"><stop stop-color="#ec4899"/><stop offset="1" stop-color="#f97316"/></linearGradient></defs>
      </svg>`,
    },
    video: {
      label: 'Video',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#0f172a"/>
        <circle cx="160" cy="90" r="30" fill="white" opacity="0.15"/>
        <polygon points="152,76 152,104 176,90" fill="white" opacity="0.8"/>
        <rect x="80" y="140" width="160" height="10" rx="2" fill="white" opacity="0.5"/>
        <rect x="100" y="158" width="120" height="8" rx="1.5" fill="white" opacity="0.3"/>
      </svg>`,
    },
    countdown: {
      label: 'Countdown',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f1f5f9"/>
        <rect x="0" y="0" width="320" height="200" fill="url(#hero-cd-grad)"/>
        <rect x="80" y="30" width="160" height="12" rx="2" fill="white" opacity="0.9"/>
        <rect x="60" y="52" width="200" height="8" rx="1.5" fill="white" opacity="0.6"/>
        <rect x="50" y="80" width="56" height="48" rx="8" fill="white" opacity="0.2" stroke="white" stroke-width="1"/>
        <rect x="120" y="80" width="56" height="48" rx="8" fill="white" opacity="0.2" stroke="white" stroke-width="1"/>
        <rect x="190" y="80" width="56" height="48" rx="8" fill="white" opacity="0.2" stroke="white" stroke-width="1"/>
        <rect x="68" y="88" width="40" height="16" rx="2" fill="white" opacity="0.8"/>
        <rect x="138" y="88" width="20" height="16" rx="2" fill="white" opacity="0.8"/>
        <rect x="208" y="88" width="20" height="16" rx="2" fill="white" opacity="0.8"/>
        <rect x="110" y="148" width="100" height="28" rx="6" fill="white"/>
        <defs><linearGradient id="hero-cd-grad" x1="0" y1="0" x2="320" y2="200"><stop stop-color="#dc2626"/><stop offset="1" stop-color="#f97316"/></linearGradient></defs>
      </svg>`,
    },
    parallax: {
      label: 'Parallax',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f1f5f9"/>
        <rect x="0" y="0" width="320" height="200" fill="url(#hero-p-grad)"/>
        <circle cx="260" cy="40" r="20" fill="white" opacity="0.1"/>
        <circle cx="40" cy="160" r="15" fill="white" opacity="0.08"/>
        <rect x="200" y="100" width="80" height="60" rx="6" fill="white" opacity="0.1" transform="rotate(-5 240 130)"/>
        <rect x="24" y="60" width="130" height="12" rx="2" fill="white" opacity="0.9"/>
        <rect x="24" y="80" width="160" height="8" rx="1.5" fill="white" opacity="0.6"/>
        <rect x="24" y="104" width="70" height="26" rx="6" fill="white"/>
        <defs><linearGradient id="hero-p-grad" x1="0" y1="0" x2="320" y2="200"><stop stop-color="#0ea5e9"/><stop offset="1" stop-color="#6366f1"/></linearGradient></defs>
      </svg>`,
    },
  },
  benefits: {
    icons: {
      label: 'Iconos',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="100" y="12" width="120" height="10" rx="2" fill="#1e293b" opacity="0.8"/>
        <rect x="80" y="28" width="160" height="6" rx="1" fill="#94a3b8"/>
        <rect x="15" y="50" width="68" height="70" rx="8" fill="white" stroke="#e2e8f0"/>
        <circle cx="49" cy="72" r="12" fill="#dbeafe"/>
        <rect x="25" y="92" width="48" height="6" rx="1" fill="#1e293b" opacity="0.6"/>
        <rect x="29" y="104" width="40" height="4" rx="1" fill="#94a3b8"/>
        <rect x="93" y="50" width="68" height="70" rx="8" fill="white" stroke="#e2e8f0"/>
        <circle cx="127" cy="72" r="12" fill="#dcfce7"/>
        <rect x="103" y="92" width="48" height="6" rx="1" fill="#1e293b" opacity="0.6"/>
        <rect x="107" y="104" width="40" height="4" rx="1" fill="#94a3b8"/>
        <rect x="171" y="50" width="68" height="70" rx="8" fill="white" stroke="#e2e8f0"/>
        <circle cx="205" cy="72" r="12" fill="#fef3c7"/>
        <rect x="181" y="92" width="48" height="6" rx="1" fill="#1e293b" opacity="0.6"/>
        <rect x="185" y="104" width="40" height="4" rx="1" fill="#94a3b8"/>
        <rect x="239" y="50" width="68" height="70" rx="8" fill="white" stroke="#e2e8f0"/>
        <circle cx="273" cy="72" r="12" fill="#fce7f3"/>
        <rect x="249" y="92" width="48" height="6" rx="1" fill="#1e293b" opacity="0.6"/>
        <rect x="253" y="104" width="40" height="4" rx="1" fill="#94a3b8"/>
      </svg>`,
    },
    steps: {
      label: 'Pasos',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="100" y="12" width="120" height="10" rx="2" fill="#1e293b" opacity="0.8"/>
        <rect x="80" y="28" width="160" height="6" rx="1" fill="#94a3b8"/>
        <circle cx="49" cy="65" r="14" fill="#6366f1"/>
        <text x="49" y="70" text-anchor="middle" fill="white" font-size="12" font-weight="bold">1</text>
        <rect x="75" y="58" width="80" height="6" rx="1" fill="#1e293b" opacity="0.6"/>
        <rect x="75" y="70" width="60" height="4" rx="1" fill="#94a3b8"/>
        <line x1="49" y1="79" x2="49" y2="105" stroke="#6366f1" stroke-width="2" stroke-dasharray="4 2"/>
        <circle cx="49" cy="120" r="14" fill="#6366f1" opacity="0.6"/>
        <text x="49" y="125" text-anchor="middle" fill="white" font-size="12" font-weight="bold">2</text>
        <rect x="75" y="113" width="80" height="6" rx="1" fill="#1e293b" opacity="0.6"/>
        <rect x="75" y="125" width="60" height="4" rx="1" fill="#94a3b8"/>
        <line x1="49" y1="134" x2="49" y2="155" stroke="#6366f1" stroke-width="2" stroke-dasharray="4 2" opacity="0.4"/>
        <circle cx="49" cy="170" r="14" fill="#6366f1" opacity="0.3"/>
        <text x="49" y="175" text-anchor="middle" fill="white" font-size="12" font-weight="bold">3</text>
        <rect x="75" y="163" width="80" height="6" rx="1" fill="#1e293b" opacity="0.4"/>
        <rect x="75" y="175" width="60" height="4" rx="1" fill="#94a3b8" opacity="0.5"/>
      </svg>`,
    },
    cards: {
      label: 'Tarjetas',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="100" y="12" width="120" height="10" rx="2" fill="#1e293b" opacity="0.8"/>
        <rect x="80" y="28" width="160" height="6" rx="1" fill="#94a3b8"/>
        <rect x="15" y="46" width="92" height="80" rx="10" fill="white" stroke="#e2e8f0" stroke-width="1.5"/>
        <rect x="15" y="46" width="92" height="24" rx="10" fill="#dbeafe"/>
        <circle cx="61" cy="58" r="8" fill="#6366f1" opacity="0.5"/>
        <rect x="25" y="80" width="72" height="6" rx="1" fill="#1e293b" opacity="0.7"/>
        <rect x="25" y="92" width="60" height="4" rx="1" fill="#94a3b8"/>
        <rect x="25" y="100" width="50" height="4" rx="1" fill="#94a3b8" opacity="0.5"/>
        <rect x="114" y="46" width="92" height="80" rx="10" fill="white" stroke="#e2e8f0" stroke-width="1.5"/>
        <rect x="114" y="46" width="92" height="24" rx="10" fill="#dcfce7"/>
        <circle cx="160" cy="58" r="8" fill="#16a34a" opacity="0.5"/>
        <rect x="124" y="80" width="72" height="6" rx="1" fill="#1e293b" opacity="0.7"/>
        <rect x="124" y="92" width="60" height="4" rx="1" fill="#94a3b8"/>
        <rect x="124" y="100" width="50" height="4" rx="1" fill="#94a3b8" opacity="0.5"/>
        <rect x="213" y="46" width="92" height="80" rx="10" fill="white" stroke="#e2e8f0" stroke-width="1.5"/>
        <rect x="213" y="46" width="92" height="24" rx="10" fill="#fef3c7"/>
        <circle cx="259" cy="58" r="8" fill="#d97706" opacity="0.5"/>
        <rect x="223" y="80" width="72" height="6" rx="1" fill="#1e293b" opacity="0.7"/>
        <rect x="223" y="92" width="60" height="4" rx="1" fill="#94a3b8"/>
        <rect x="223" y="100" width="50" height="4" rx="1" fill="#94a3b8" opacity="0.5"/>
      </svg>`,
    },
  },
  categories: {
    grid: {
      label: 'Cuadrícula',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="100" y="12" width="120" height="10" rx="2" fill="#1e293b" opacity="0.8"/>
        <rect x="80" y="28" width="160" height="6" rx="1" fill="#94a3b8"/>
        <rect x="15" y="44" width="92" height="72" rx="8" fill="#e2e8f0"/>
        <rect x="25" y="54" width="50" height="36" rx="4" fill="#cbd5e1"/>
        <rect x="25" y="98" width="72" height="6" rx="1" fill="#1e293b" opacity="0.6"/>
        <rect x="114" y="44" width="92" height="72" rx="8" fill="#e2e8f0"/>
        <rect x="124" y="54" width="50" height="36" rx="4" fill="#cbd5e1"/>
        <rect x="124" y="98" width="72" height="6" rx="1" fill="#1e293b" opacity="0.6"/>
        <rect x="213" y="44" width="92" height="72" rx="8" fill="#e2e8f0"/>
        <rect x="223" y="54" width="50" height="36" rx="4" fill="#cbd5e1"/>
        <rect x="223" y="98" width="72" height="6" rx="1" fill="#1e293b" opacity="0.6"/>
        <rect x="15" y="124" width="92" height="68" rx="8" fill="#e2e8f0"/>
        <rect x="114" y="124" width="92" height="68" rx="8" fill="#e2e8f0"/>
        <rect x="213" y="124" width="92" height="68" rx="8" fill="#e2e8f0"/>
      </svg>`,
    },
    carousel: {
      label: 'Carrusel',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="100" y="12" width="120" height="10" rx="2" fill="#1e293b" opacity="0.8"/>
        <rect x="80" y="28" width="160" height="6" rx="1" fill="#94a3b8"/>
        <rect x="5" y="44" width="100" height="80" rx="8" fill="white" stroke="#e2e8f0"/>
        <rect x="15" y="54" width="60" height="40" rx="4" fill="#e2e8f0"/>
        <rect x="15" y="102" width="70" height="6" rx="1" fill="#1e293b" opacity="0.6"/>
        <rect x="115" y="44" width="100" height="80" rx="8" fill="white" stroke="#e2e8f0"/>
        <rect x="125" y="54" width="60" height="40" rx="4" fill="#e2e8f0"/>
        <rect x="125" y="102" width="70" height="6" rx="1" fill="#1e293b" opacity="0.6"/>
        <rect x="225" y="44" width="100" height="80" rx="8" fill="white" stroke="#e2e8f0" opacity="0.5"/>
        <rect x="235" y="54" width="60" height="40" rx="4" fill="#e2e8f0" opacity="0.5"/>
        <circle cx="145" cy="140" r="4" fill="#6366f1"/>
        <circle cx="160" cy="140" r="4" fill="#cbd5e1"/>
        <circle cx="175" cy="140" r="4" fill="#cbd5e1"/>
      </svg>`,
    },
    pills: {
      label: 'Píldoras',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="100" y="12" width="120" height="10" rx="2" fill="#1e293b" opacity="0.8"/>
        <rect x="80" y="28" width="160" height="6" rx="1" fill="#94a3b8"/>
        <rect x="20" y="50" width="70" height="30" rx="15" fill="#6366f1" opacity="0.15" stroke="#6366f1" stroke-width="1"/>
        <circle cx="40" cy="65" r="6" fill="#6366f1" opacity="0.4"/>
        <rect x="50" y="62" width="30" height="6" rx="1" fill="#6366f1" opacity="0.6"/>
        <rect x="100" y="50" width="70" height="30" rx="15" fill="#6366f1" opacity="0.15" stroke="#6366f1" stroke-width="1"/>
        <circle cx="120" cy="65" r="6" fill="#6366f1" opacity="0.4"/>
        <rect x="130" y="62" width="30" height="6" rx="1" fill="#6366f1" opacity="0.6"/>
        <rect x="180" y="50" width="70" height="30" rx="15" fill="#6366f1" opacity="0.15" stroke="#6366f1" stroke-width="1"/>
        <circle cx="200" cy="65" r="6" fill="#6366f1" opacity="0.4"/>
        <rect x="210" y="62" width="30" height="6" rx="1" fill="#6366f1" opacity="0.6"/>
        <rect x="60" y="95" width="70" height="30" rx="15" fill="#6366f1" opacity="0.15" stroke="#6366f1" stroke-width="1"/>
        <circle cx="80" cy="110" r="6" fill="#6366f1" opacity="0.4"/>
        <rect x="90" y="107" width="30" height="6" rx="1" fill="#6366f1" opacity="0.6"/>
        <rect x="140" y="95" width="70" height="30" rx="15" fill="#6366f1" opacity="0.15" stroke="#6366f1" stroke-width="1"/>
        <circle cx="160" cy="110" r="6" fill="#6366f1" opacity="0.4"/>
        <rect x="170" y="107" width="30" height="6" rx="1" fill="#6366f1" opacity="0.6"/>
      </svg>`,
    },
  },
  featured: {
    grid: {
      label: 'Cuadrícula',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="100" y="12" width="120" height="10" rx="2" fill="#1e293b" opacity="0.8"/>
        <rect x="80" y="28" width="160" height="6" rx="1" fill="#94a3b8"/>
        <rect x="15" y="44" width="90" height="100" rx="8" fill="white" stroke="#e2e8f0"/>
        <rect x="20" y="48" width="80" height="50" rx="4" fill="#e2e8f0"/>
        <rect x="20" y="106" width="60" height="6" rx="1" fill="#1e293b" opacity="0.6"/>
        <rect x="20" y="118" width="40" height="10" rx="3" fill="#6366f1" opacity="0.2"/>
        <rect x="115" y="44" width="90" height="100" rx="8" fill="white" stroke="#e2e8f0"/>
        <rect x="120" y="48" width="80" height="50" rx="4" fill="#e2e8f0"/>
        <rect x="120" y="106" width="60" height="6" rx="1" fill="#1e293b" opacity="0.6"/>
        <rect x="120" y="118" width="40" height="10" rx="3" fill="#6366f1" opacity="0.2"/>
        <rect x="215" y="44" width="90" height="100" rx="8" fill="white" stroke="#e2e8f0"/>
        <rect x="220" y="48" width="80" height="50" rx="4" fill="#e2e8f0"/>
        <rect x="220" y="106" width="60" height="6" rx="1" fill="#1e293b" opacity="0.6"/>
        <rect x="220" y="118" width="40" height="10" rx="3" fill="#6366f1" opacity="0.2"/>
        <rect x="15" y="154" width="90" height="36" rx="8" fill="white" stroke="#e2e8f0"/>
        <rect x="115" y="154" width="90" height="36" rx="8" fill="white" stroke="#e2e8f0"/>
        <rect x="215" y="154" width="90" height="36" rx="8" fill="white" stroke="#e2e8f0"/>
      </svg>`,
    },
    carousel: {
      label: 'Carrusel',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="100" y="12" width="120" height="10" rx="2" fill="#1e293b" opacity="0.8"/>
        <rect x="80" y="28" width="160" height="6" rx="1" fill="#94a3b8"/>
        <rect x="5" y="44" width="110" height="110" rx="8" fill="white" stroke="#e2e8f0"/>
        <rect x="12" y="50" width="96" height="60" rx="4" fill="#e2e8f0"/>
        <rect x="12" y="118" width="70" height="6" rx="1" fill="#1e293b" opacity="0.6"/>
        <rect x="12" y="130" width="50" height="10" rx="3" fill="#6366f1" opacity="0.2"/>
        <rect x="125" y="44" width="110" height="110" rx="8" fill="white" stroke="#e2e8f0"/>
        <rect x="132" y="50" width="96" height="60" rx="4" fill="#e2e8f0"/>
        <rect x="132" y="118" width="70" height="6" rx="1" fill="#1e293b" opacity="0.6"/>
        <rect x="240" y="44" width="80" height="110" rx="8" fill="white" stroke="#e2e8f0" opacity="0.4"/>
        <circle cx="145" cy="170" r="4" fill="#6366f1"/>
        <circle cx="160" cy="170" r="4" fill="#cbd5e1"/>
        <circle cx="175" cy="170" r="4" fill="#cbd5e1"/>
      </svg>`,
    },
    'large-cards': {
      label: 'Tarjetas grandes',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="100" y="12" width="120" height="10" rx="2" fill="#1e293b" opacity="0.8"/>
        <rect x="80" y="28" width="160" height="6" rx="1" fill="#94a3b8"/>
        <rect x="15" y="44" width="140" height="100" rx="10" fill="white" stroke="#e2e8f0"/>
        <rect x="20" y="48" width="130" height="60" rx="6" fill="#e2e8f0"/>
        <rect x="20" y="116" width="90" height="8" rx="1.5" fill="#1e293b" opacity="0.7"/>
        <rect x="20" y="130" width="60" height="6" rx="1" fill="#94a3b8"/>
        <rect x="165" y="44" width="140" height="100" rx="10" fill="white" stroke="#e2e8f0"/>
        <rect x="170" y="48" width="130" height="60" rx="6" fill="#e2e8f0"/>
        <rect x="170" y="116" width="90" height="8" rx="1.5" fill="#1e293b" opacity="0.7"/>
        <rect x="170" y="130" width="60" height="6" rx="1" fill="#94a3b8"/>
      </svg>`,
    },
  },
  testimonials: {
    cards: {
      label: 'Tarjetas',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="100" y="12" width="120" height="10" rx="2" fill="#1e293b" opacity="0.8"/>
        <rect x="80" y="28" width="160" height="6" rx="1" fill="#94a3b8"/>
        <rect x="15" y="44" width="92" height="80" rx="8" fill="white" stroke="#e2e8f0"/>
        <circle cx="35" cy="60" r="10" fill="#e2e8f0"/>
        <rect x="52" y="55" width="40" height="6" rx="1" fill="#1e293b" opacity="0.6"/>
        <rect x="52" y="65" width="30" height="4" rx="1" fill="#94a3b8"/>
        <rect x="25" y="80" width="72" height="4" rx="1" fill="#94a3b8"/>
        <rect x="25" y="90" width="60" height="4" rx="1" fill="#94a3b8" opacity="0.5"/>
        <rect x="25" y="100" width="40" height="4" rx="1" fill="#fbbf24"/>
        <rect x="114" y="44" width="92" height="80" rx="8" fill="white" stroke="#e2e8f0"/>
        <circle cx="134" cy="60" r="10" fill="#e2e8f0"/>
        <rect x="151" y="55" width="40" height="6" rx="1" fill="#1e293b" opacity="0.6"/>
        <rect x="151" y="65" width="30" height="4" rx="1" fill="#94a3b8"/>
        <rect x="124" y="80" width="72" height="4" rx="1" fill="#94a3b8"/>
        <rect x="124" y="90" width="60" height="4" rx="1" fill="#94a3b8" opacity="0.5"/>
        <rect x="124" y="100" width="40" height="4" rx="1" fill="#fbbf24"/>
        <rect x="213" y="44" width="92" height="80" rx="8" fill="white" stroke="#e2e8f0"/>
        <circle cx="233" cy="60" r="10" fill="#e2e8f0"/>
        <rect x="250" y="55" width="40" height="6" rx="1" fill="#1e293b" opacity="0.6"/>
        <rect x="250" y="65" width="30" height="4" rx="1" fill="#94a3b8"/>
        <rect x="223" y="80" width="72" height="4" rx="1" fill="#94a3b8"/>
        <rect x="223" y="90" width="60" height="4" rx="1" fill="#94a3b8" opacity="0.5"/>
        <rect x="223" y="100" width="40" height="4" rx="1" fill="#fbbf24"/>
      </svg>`,
    },
    spotlight: {
      label: 'Destacado',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="100" y="12" width="120" height="10" rx="2" fill="#1e293b" opacity="0.8"/>
        <rect x="80" y="28" width="160" height="6" rx="1" fill="#94a3b8"/>
        <rect x="40" y="44" width="240" height="90" rx="12" fill="white" stroke="#e2e8f0"/>
        <text x="160" y="65" text-anchor="middle" fill="#94a3b8" font-size="20">"</text>
        <rect x="70" y="75" width="180" height="6" rx="1" fill="#94a3b8"/>
        <rect x="80" y="88" width="160" height="6" rx="1" fill="#94a3b8" opacity="0.5"/>
        <rect x="90" y="101" width="140" height="6" rx="1" fill="#94a3b8" opacity="0.4"/>
        <circle cx="120" cy="122" r="8" fill="#e2e8f0"/>
        <rect x="134" y="118" width="50" height="6" rx="1" fill="#1e293b" opacity="0.5"/>
        <rect x="134" y="128" width="35" height="4" rx="1" fill="#94a3b8"/>
        <circle cx="145" cy="160" r="4" fill="#6366f1"/>
        <circle cx="160" cy="160" r="4" fill="#cbd5e1"/>
        <circle cx="175" cy="160" r="4" fill="#cbd5e1"/>
      </svg>`,
    },
    masonry: {
      label: 'Masonry',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="100" y="12" width="120" height="10" rx="2" fill="#1e293b" opacity="0.8"/>
        <rect x="80" y="28" width="160" height="6" rx="1" fill="#94a3b8"/>
        <rect x="15" y="44" width="95" height="70" rx="8" fill="white" stroke="#e2e8f0"/>
        <rect x="25" y="54" width="75" height="4" rx="1" fill="#94a3b8"/>
        <rect x="25" y="64" width="60" height="4" rx="1" fill="#94a3b8" opacity="0.5"/>
        <rect x="25" y="74" width="50" height="4" rx="1" fill="#fbbf24" opacity="0.6"/>
        <rect x="120" y="44" width="95" height="100" rx="8" fill="white" stroke="#e2e8f0"/>
        <rect x="130" y="54" width="75" height="4" rx="1" fill="#94a3b8"/>
        <rect x="130" y="64" width="60" height="4" rx="1" fill="#94a3b8" opacity="0.5"/>
        <rect x="130" y="74" width="50" height="4" rx="1" fill="#fbbf24" opacity="0.6"/>
        <rect x="130" y="88" width="75" height="4" rx="1" fill="#94a3b8"/>
        <rect x="130" y="98" width="60" height="4" rx="1" fill="#94a3b8" opacity="0.5"/>
        <rect x="225" y="44" width="80" height="55" rx="8" fill="white" stroke="#e2e8f0"/>
        <rect x="235" y="54" width="60" height="4" rx="1" fill="#94a3b8"/>
        <rect x="235" y="64" width="50" height="4" rx="1" fill="#94a3b8" opacity="0.5"/>
        <rect x="225" y="110" width="80" height="60" rx="8" fill="white" stroke="#e2e8f0"/>
        <rect x="15" y="124" width="95" height="56" rx="8" fill="white" stroke="#e2e8f0"/>
      </svg>`,
    },
  },
  cta: {
    banner: {
      label: 'Banner',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="10" y="10" width="300" height="180" rx="12" fill="url(#cta-b-grad)"/>
        <rect x="80" y="50" width="160" height="14" rx="3" fill="white" opacity="0.9"/>
        <rect x="60" y="74" width="200" height="8" rx="1.5" fill="white" opacity="0.6"/>
        <rect x="100" y="100" width="120" height="32" rx="8" fill="white"/>
        <rect x="115" y="112" width="90" height="8" rx="1.5" fill="#6366f1" opacity="0.3"/>
        <defs><linearGradient id="cta-b-grad" x1="0" y1="0" x2="320" y2="200"><stop stop-color="#6366f1"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs>
      </svg>`,
    },
    split: {
      label: 'Dividido',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="10" y="10" width="140" height="180" rx="10" fill="#1e293b"/>
        <rect x="25" y="50" width="110" height="12" rx="2" fill="white" opacity="0.9"/>
        <rect x="25" y="70" width="100" height="8" rx="1.5" fill="white" opacity="0.6"/>
        <rect x="25" y="86" width="80" height="8" rx="1.5" fill="white" opacity="0.5"/>
        <rect x="25" y="110" width="80" height="28" rx="6" fill="white"/>
        <rect x="160" y="10" width="150" height="180" rx="10" fill="#e2e8f0"/>
        <rect x="175" y="30" width="120" height="140" rx="8" fill="#cbd5e1"/>
      </svg>`,
    },
    gradient: {
      label: 'Gradiente',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="10" y="10" width="300" height="180" rx="12" fill="url(#cta-g-grad)"/>
        <circle cx="80" cy="60" r="40" fill="white" opacity="0.08"/>
        <circle cx="250" cy="140" r="30" fill="white" opacity="0.06"/>
        <rect x="80" y="50" width="160" height="14" rx="3" fill="white" opacity="0.9"/>
        <rect x="60" y="74" width="200" height="8" rx="1.5" fill="white" opacity="0.6"/>
        <rect x="100" y="100" width="120" height="32" rx="8" fill="white"/>
        <defs><linearGradient id="cta-g-grad" x1="0" y1="0" x2="320" y2="200"><stop stop-color="#ec4899"/><stop offset="0.5" stop-color="#a855f7"/><stop offset="1" stop-color="#6366f1"/></linearGradient></defs>
      </svg>`,
    },
  },
  deals: {
    default: {
      label: 'Estándar',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="10" y="10" width="300" height="180" rx="12" fill="#fef2f2"/>
        <rect x="10" y="10" width="80" height="24" rx="6" fill="#dc2626"/>
        <rect x="20" y="16" width="60" height="12" rx="2" fill="white" opacity="0.9"/>
        <rect x="40" y="50" width="240" height="14" rx="3" fill="#1e293b" opacity="0.8"/>
        <rect x="50" y="74" width="220" height="8" rx="1.5" fill="#94a3b8"/>
        <rect x="100" y="100" width="120" height="32" rx="8" fill="#dc2626"/>
        <rect x="115" y="112" width="90" height="8" rx="1.5" fill="white" opacity="0.5"/>
        <rect x="30" y="150" width="60" height="30" rx="6" fill="#e2e8f0"/>
        <rect x="100" y="150" width="60" height="30" rx="6" fill="#e2e8f0"/>
        <rect x="170" y="150" width="60" height="30" rx="6" fill="#e2e8f0"/>
      </svg>`,
    },
  },
  newsletter: {
    default: {
      label: 'Estándar',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="10" y="10" width="300" height="180" rx="12" fill="#6366f1"/>
        <rect x="80" y="40" width="160" height="14" rx="3" fill="white" opacity="0.9"/>
        <rect x="60" y="64" width="200" height="8" rx="1.5" fill="white" opacity="0.6"/>
        <rect x="50" y="90" width="220" height="32" rx="8" fill="white" opacity="0.15" stroke="white" stroke-width="1"/>
        <rect x="60" y="98" width="100" height="8" rx="1.5" fill="white" opacity="0.5"/>
        <rect x="210" y="90" width="50" height="32" rx="8" fill="white"/>
        <rect x="220" y="102" width="30" height="8" rx="1.5" fill="#6366f1" opacity="0.4"/>
      </svg>`,
    },
  },
  brand_logos: {
    default: {
      label: 'Estándar',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="100" y="20" width="120" height="10" rx="2" fill="#1e293b" opacity="0.8"/>
        <rect x="80" y="36" width="160" height="6" rx="1" fill="#94a3b8"/>
        <rect x="25" y="60" width="55" height="35" rx="6" fill="white" stroke="#e2e8f0"/>
        <rect x="30" y="70" width="45" height="16" rx="2" fill="#e2e8f0"/>
        <rect x="90" y="60" width="55" height="35" rx="6" fill="white" stroke="#e2e8f0"/>
        <rect x="95" y="70" width="45" height="16" rx="2" fill="#e2e8f0"/>
        <rect x="155" y="60" width="55" height="35" rx="6" fill="white" stroke="#e2e8f0"/>
        <rect x="160" y="70" width="45" height="16" rx="2" fill="#e2e8f0"/>
        <rect x="220" y="60" width="55" height="35" rx="6" fill="white" stroke="#e2e8f0"/>
        <rect x="225" y="70" width="45" height="16" rx="2" fill="#e2e8f0"/>
        <rect x="55" y="60" width="55" height="35" rx="6" fill="white" stroke="#e2e8f0" opacity="0.4"/>
      </svg>`,
    },
  },
  gallery_feed: {
    default: {
      label: 'Estándar',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="100" y="12" width="120" height="10" rx="2" fill="#1e293b" opacity="0.8"/>
        <rect x="80" y="28" width="160" height="6" rx="1" fill="#94a3b8"/>
        <rect x="15" y="44" width="68" height="68" rx="6" fill="#e2e8f0"/>
        <rect x="93" y="44" width="68" height="68" rx="6" fill="#e2e8f0"/>
        <rect x="171" y="44" width="68" height="68" rx="6" fill="#e2e8f0"/>
        <rect x="249" y="44" width="56" height="68" rx="6" fill="#e2e8f0" opacity="0.5"/>
        <rect x="15" y="122" width="68" height="68" rx="6" fill="#e2e8f0"/>
        <rect x="93" y="122" width="68" height="68" rx="6" fill="#e2e8f0"/>
        <rect x="171" y="122" width="68" height="68" rx="6" fill="#e2e8f0"/>
        <rect x="249" y="122" width="56" height="68" rx="6" fill="#e2e8f0" opacity="0.5"/>
      </svg>`,
    },
  },
  stats: {
    default: {
      label: 'Estándar',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="10" y="10" width="300" height="180" rx="12" fill="#0f172a"/>
        <rect x="25" y="30" width="60" height="20" rx="3" fill="white" opacity="0.9"/>
        <rect x="25" y="56" width="50" height="8" rx="1.5" fill="white" opacity="0.5"/>
        <rect x="95" y="30" width="60" height="20" rx="3" fill="white" opacity="0.9"/>
        <rect x="95" y="56" width="50" height="8" rx="1.5" fill="white" opacity="0.5"/>
        <rect x="165" y="30" width="60" height="20" rx="3" fill="white" opacity="0.9"/>
        <rect x="165" y="56" width="50" height="8" rx="1.5" fill="white" opacity="0.5"/>
        <rect x="235" y="30" width="60" height="20" rx="3" fill="white" opacity="0.9"/>
        <rect x="235" y="56" width="50" height="8" rx="1.5" fill="white" opacity="0.5"/>
        <line x1="25" y1="80" x2="295" y2="80" stroke="white" stroke-width="0.5" opacity="0.1"/>
        <rect x="35" y="100" width="40" height="60" rx="4" fill="#6366f1" opacity="0.3"/>
        <rect x="95" y="120" width="40" height="40" rx="4" fill="#6366f1" opacity="0.4"/>
        <rect x="155" y="90" width="40" height="70" rx="4" fill="#6366f1" opacity="0.5"/>
        <rect x="215" y="110" width="40" height="50" rx="4" fill="#6366f1" opacity="0.35"/>
        <rect x="275" y="105" width="20" height="55" rx="4" fill="#6366f1" opacity="0.25"/>
      </svg>`,
    },
  },
  video: {
    default: {
      label: 'Estándar',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="10" y="10" width="300" height="180" rx="12" fill="#1e293b"/>
        <circle cx="160" cy="90" r="35" fill="white" opacity="0.15" stroke="white" stroke-width="1.5" opacity="0.3"/>
        <polygon points="148,72 148,108 180,90" fill="white" opacity="0.8"/>
        <rect x="80" y="145" width="160" height="10" rx="2" fill="white" opacity="0.5"/>
        <rect x="100" y="163" width="120" height="8" rx="1.5" fill="white" opacity="0.3"/>
      </svg>`,
    },
  },
  map: {
    default: {
      label: 'Estándar',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="10" y="10" width="180" height="180" rx="10" fill="#e2e8f0"/>
        <circle cx="100" cy="100" r="20" fill="#dc2626" opacity="0.3"/>
        <circle cx="100" cy="100" r="8" fill="#dc2626"/>
        <rect x="210" y="30" width="90" height="10" rx="2" fill="#1e293b" opacity="0.7"/>
        <rect x="210" y="50" width="80" height="6" rx="1" fill="#94a3b8"/>
        <rect x="210" y="70" width="85" height="6" rx="1" fill="#94a3b8"/>
        <rect x="210" y="90" width="70" height="6" rx="1" fill="#94a3b8"/>
        <rect x="210" y="110" width="75" height="6" rx="1" fill="#94a3b8"/>
        <rect x="210" y="140" width="60" height="24" rx="6" fill="#6366f1"/>
        <rect x="220" y="148" width="40" height="8" rx="1.5" fill="white" opacity="0.5"/>
      </svg>`,
    },
  },
  richtext: {
    default: {
      label: 'Estándar',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="10" y="10" width="300" height="180" rx="10" fill="white" stroke="#e2e8f0"/>
        <rect x="30" y="30" width="140" height="12" rx="2" fill="#1e293b" opacity="0.8"/>
        <rect x="30" y="52" width="260" height="6" rx="1" fill="#94a3b8"/>
        <rect x="30" y="66" width="240" height="6" rx="1" fill="#94a3b8" opacity="0.6"/>
        <rect x="30" y="80" width="250" height="6" rx="1" fill="#94a3b8" opacity="0.5"/>
        <rect x="30" y="94" width="200" height="6" rx="1" fill="#94a3b8" opacity="0.4"/>
        <rect x="30" y="120" width="80" height="28" rx="6" fill="#6366f1"/>
        <rect x="40" y="130" width="60" height="8" rx="1.5" fill="white" opacity="0.5"/>
      </svg>`,
    },
  },
  urgency_banner: {
    default: {
      label: 'Estándar',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="10" y="10" width="300" height="40" rx="8" fill="#dc2626"/>
        <rect x="20" y="18" width="100" height="8" rx="1.5" fill="white" opacity="0.9"/>
        <rect x="20" y="32" width="80" height="6" rx="1" fill="white" opacity="0.5"/>
        <rect x="220" y="14" width="80" height="32" rx="6" fill="white"/>
        <rect x="230" y="26" width="60" height="8" rx="1.5" fill="#dc2626" opacity="0.4"/>
        <rect x="10" y="60" width="300" height="130" rx="10" fill="white" stroke="#e2e8f0"/>
        <rect x="30" y="80" width="120" height="10" rx="2" fill="#1e293b" opacity="0.7"/>
        <rect x="30" y="100" width="200" height="6" rx="1" fill="#94a3b8"/>
        <rect x="30" y="114" width="180" height="6" rx="1" fill="#94a3b8" opacity="0.5"/>
        <rect x="30" y="140" width="80" height="28" rx="6" fill="#6366f1"/>
      </svg>`,
    },
  },
  countdown_offer: {
    default: {
      label: 'Estándar',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="10" y="10" width="300" height="180" rx="12" fill="url(#co-grad)"/>
        <rect x="80" y="25" width="160" height="12" rx="2" fill="white" opacity="0.9"/>
        <rect x="70" y="45" width="180" height="8" rx="1.5" fill="white" opacity="0.6"/>
        <rect x="60" y="70" width="50" height="40" rx="8" fill="white" opacity="0.2" stroke="white" stroke-width="1"/>
        <rect x="120" y="70" width="50" height="40" rx="8" fill="white" opacity="0.2" stroke="white" stroke-width="1"/>
        <rect x="180" y="70" width="50" height="40" rx="8" fill="white" opacity="0.2" stroke="white" stroke-width="1"/>
        <rect x="70" y="78" width="30" height="14" rx="2" fill="white" opacity="0.8"/>
        <rect x="130" y="78" width="20" height="14" rx="2" fill="white" opacity="0.8"/>
        <rect x="190" y="78" width="20" height="14" rx="2" fill="white" opacity="0.8"/>
        <rect x="100" y="130" width="120" height="32" rx="8" fill="white"/>
        <rect x="40" y="175" width="240" height="8" rx="4" fill="white" opacity="0.2"/>
        <rect x="40" y="175" width="150" height="8" rx="4" fill="white" opacity="0.5"/>
        <defs><linearGradient id="co-grad" x1="0" y1="0" x2="320" y2="200"><stop stop-color="#dc2626"/><stop offset="1" stop-color="#f97316"/></linearGradient></defs>
      </svg>`,
    },
  },
  stock_counter: {
    default: {
      label: 'Estándar',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="40" y="30" width="240" height="10" rx="2" fill="#1e293b" opacity="0.8"/>
        <rect x="60" y="50" width="200" height="8" rx="1.5" fill="#94a3b8"/>
        <rect x="40" y="80" width="240" height="16" rx="8" fill="#e2e8f0"/>
        <rect x="40" y="80" width="160" height="16" rx="8" fill="#f97316"/>
        <rect x="40" y="110" width="100" height="8" rx="1.5" fill="#94a3b8"/>
        <rect x="40" y="130" width="80" height="8" rx="1.5" fill="#94a3b8" opacity="0.5"/>
        <rect x="40" y="155" width="100" height="28" rx="6" fill="#6366f1"/>
      </svg>`,
    },
  },
  sticky_add_to_cart: {
    default: {
      label: 'Estándar',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="0" y="0" width="320" height="160" fill="#e2e8f0" opacity="0.3"/>
        <rect x="0" y="160" width="320" height="40" fill="white" stroke="#e2e8f0" stroke-width="0 0 1 0"/>
        <rect x="10" y="168" width="60" height="24" rx="4" fill="#e2e8f0"/>
        <rect x="80" y="170" width="100" height="8" rx="1.5" fill="#1e293b" opacity="0.7"/>
        <rect x="80" y="184" width="60" height="6" rx="1" fill="#94a3b8"/>
        <rect x="240" y="166" width="70" height="28" rx="6" fill="#6366f1"/>
        <rect x="250" y="176" width="50" height="8" rx="1.5" fill="white" opacity="0.5"/>
      </svg>`,
    },
  },
  faq: {
    default: {
      label: 'Estándar',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="100" y="12" width="120" height="10" rx="2" fill="#1e293b" opacity="0.8"/>
        <rect x="80" y="28" width="160" height="6" rx="1" fill="#94a3b8"/>
        <rect x="30" y="48" width="260" height="32" rx="6" fill="white" stroke="#e2e8f0"/>
        <rect x="40" y="58" width="160" height="8" rx="1.5" fill="#1e293b" opacity="0.7"/>
        <rect x="270" y="60" width="12" height="8" rx="1" fill="#94a3b8"/>
        <rect x="30" y="88" width="260" height="32" rx="6" fill="white" stroke="#e2e8f0"/>
        <rect x="40" y="98" width="140" height="8" rx="1.5" fill="#1e293b" opacity="0.7"/>
        <rect x="270" y="100" width="12" height="8" rx="1" fill="#94a3b8"/>
        <rect x="30" y="128" width="260" height="32" rx="6" fill="white" stroke="#e2e8f0"/>
        <rect x="40" y="138" width="120" height="8" rx="1.5" fill="#1e293b" opacity="0.7"/>
        <rect x="270" y="140" width="12" height="8" rx="1" fill="#6366f1"/>
        <rect x="40" y="150" width="200" height="4" rx="1" fill="#94a3b8" opacity="0.4"/>
      </svg>`,
    },
  },
  timeline: {
    default: {
      label: 'Estándar',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="100" y="12" width="120" height="10" rx="2" fill="#1e293b" opacity="0.8"/>
        <rect x="80" y="28" width="160" height="6" rx="1" fill="#94a3b8"/>
        <line x1="160" y1="48" x2="160" y2="190" stroke="#6366f1" stroke-width="2" opacity="0.3"/>
        <circle cx="160" cy="60" r="10" fill="#6366f1"/>
        <rect x="30" y="54" width="80" height="12" rx="2" fill="#1e293b" opacity="0.7"/>
        <rect x="180" y="54" width="110" height="8" rx="1.5" fill="#94a3b8"/>
        <circle cx="160" cy="110" r="10" fill="#6366f1" opacity="0.6"/>
        <rect x="30" y="104" width="80" height="12" rx="2" fill="#1e293b" opacity="0.5"/>
        <rect x="180" y="104" width="100" height="8" rx="1.5" fill="#94a3b8"/>
        <circle cx="160" cy="160" r="10" fill="#6366f1" opacity="0.3"/>
        <rect x="30" y="154" width="80" height="12" rx="2" fill="#1e293b" opacity="0.3"/>
        <rect x="180" y="154" width="90" height="8" rx="1.5" fill="#94a3b8" opacity="0.5"/>
      </svg>`,
    },
  },
  blog_grid: {
    default: {
      label: 'Estándar',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="100" y="12" width="120" height="10" rx="2" fill="#1e293b" opacity="0.8"/>
        <rect x="80" y="28" width="160" height="6" rx="1" fill="#94a3b8"/>
        <rect x="15" y="44" width="140" height="100" rx="8" fill="white" stroke="#e2e8f0"/>
        <rect x="20" y="48" width="130" height="50" rx="4" fill="#e2e8f0"/>
        <rect x="20" y="106" width="90" height="8" rx="1.5" fill="#1e293b" opacity="0.6"/>
        <rect x="20" y="120" width="70" height="6" rx="1" fill="#94a3b8"/>
        <rect x="165" y="44" width="140" height="100" rx="8" fill="white" stroke="#e2e8f0"/>
        <rect x="170" y="48" width="130" height="50" rx="4" fill="#e2e8f0"/>
        <rect x="170" y="106" width="90" height="8" rx="1.5" fill="#1e293b" opacity="0.6"/>
        <rect x="170" y="120" width="70" height="6" rx="1" fill="#94a3b8"/>
        <rect x="15" y="154" width="140" height="36" rx="8" fill="white" stroke="#e2e8f0"/>
        <rect x="165" y="154" width="140" height="36" rx="8" fill="white" stroke="#e2e8f0"/>
      </svg>`,
    },
  },
  article_featured: {
    default: {
      label: 'Estándar',
      svg: `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f8fafc"/>
        <rect x="100" y="12" width="120" height="10" rx="2" fill="#1e293b" opacity="0.8"/>
        <rect x="80" y="28" width="160" height="6" rx="1" fill="#94a3b8"/>
        <rect x="15" y="44" width="290" height="70" rx="8" fill="white" stroke="#e2e8f0"/>
        <rect x="20" y="48" width="100" height="62" rx="4" fill="#e2e8f0"/>
        <rect x="130" y="54" width="160" height="8" rx="1.5" fill="#1e293b" opacity="0.7"/>
        <rect x="130" y="70" width="140" height="6" rx="1" fill="#94a3b8"/>
        <rect x="130" y="84" width="120" height="6" rx="1" fill="#94a3b8" opacity="0.5"/>
        <rect x="130" y="100" width="60" height="6" rx="1" fill="#6366f1" opacity="0.3"/>
        <rect x="15" y="124" width="140" height="64" rx="8" fill="white" stroke="#e2e8f0"/>
        <rect x="20" y="128" width="130" height="30" rx="4" fill="#e2e8f0"/>
        <rect x="20" y="166" width="100" height="6" rx="1" fill="#1e293b" opacity="0.5"/>
        <rect x="165" y="124" width="140" height="64" rx="8" fill="white" stroke="#e2e8f0"/>
        <rect x="170" y="128" width="130" height="30" rx="4" fill="#e2e8f0"/>
        <rect x="170" y="166" width="100" height="6" rx="1" fill="#1e293b" opacity="0.5"/>
      </svg>`,
    },
  },
}

/**
 * Get the SVG preview for a section type and variant.
 * Falls back to the first available variant if the requested one doesn't exist.
 */
export function getSectionPreview(type: string, variant?: string): SectionPreview | null {
  const sectionPreviews = PREVIEW_SVGS[type]
  if (!sectionPreviews) return null

  if (variant && sectionPreviews[variant]) {
    return sectionPreviews[variant]
  }

  const firstKey = Object.keys(sectionPreviews)[0]
  return firstKey ? (sectionPreviews[firstKey] ?? null) : null
}

/**
 * Get all available previews for a section type.
 */
export function getSectionPreviews(type: string): Record<string, SectionPreview> {
  return PREVIEW_SVGS[type] ?? {}
}
