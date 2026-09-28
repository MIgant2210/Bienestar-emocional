/**
 * Configuración Central de Temáticas Visuales de EquilibrIA
 * Define los 14 temas del sistema, tokens CSS (modo claro y oscuro),
 * metadatos y accesorios para la mascota Equi.
 */

export const THEMES = [
  {
    id: 'equilibria',
    name: 'EquilibrIA Original',
    icon: '🌿',
    tagline: 'Identidad oficial de bienestar y serenidad',
    description: 'La esencia clásica de EquilibrIA con tonos índigo y violeta tecnológico equilibrado.',
    category: 'official',
    swatches: ['#6366f1', '#8b5cf6', '#a855f7', '#38bdf8'],
    mascotVariant: 'normal',
    mascotLabel: 'Equi Clásico',
    tokens: {
      light: {
        primary: '#6366f1',
        primaryHover: '#4f46e5',
        accent: '#8b5cf6',
        primaryLight: 'rgba(99, 102, 241, 0.15)',
        techGlow: '0 0 20px rgba(99, 102, 241, 0.25)',
        pageBg: 'linear-gradient(135deg, #fcf7ef 0%, #f8ebd6 100%)',
        cardBorder: 'rgba(99, 102, 241, 0.18)',
        badgeBg: 'rgba(99, 102, 241, 0.12)',
        badgeText: '#4f46e5'
      },
      dark: {
        primary: '#818cf8',
        primaryHover: '#6366f1',
        accent: '#a78bfa',
        primaryLight: 'rgba(129, 140, 248, 0.20)',
        techGlow: '0 0 24px rgba(129, 140, 248, 0.35)',
        pageBg: 'linear-gradient(135deg, #0f1222 0%, #181c34 100%)',
        cardBorder: 'rgba(129, 140, 248, 0.25)',
        badgeBg: 'rgba(129, 140, 248, 0.18)',
        badgeText: '#c7d2fe'
      }
    }
  },
  {
    id: 'spring',
    name: 'Primavera',
    icon: '🌸',
    tagline: 'Renovación, frescura y calma natural',
    description: 'Tonos pastel florales con verde menta y rosa suave para inspirar florecimiento personal.',
    category: 'seasonal',
    swatches: ['#ec4899', '#10b981', '#f472b6', '#a7f3d0'],
    mascotVariant: 'spring',
    mascotLabel: 'Equi con Corona Floral',
    tokens: {
      light: {
        primary: '#db2777',
        primaryHover: '#be185d',
        accent: '#10b981',
        primaryLight: 'rgba(219, 39, 119, 0.14)',
        techGlow: '0 0 22px rgba(219, 39, 119, 0.25)',
        pageBg: 'linear-gradient(135deg, #fff7fa 0%, #ecfdf5 100%)',
        cardBorder: 'rgba(219, 39, 119, 0.20)',
        badgeBg: 'rgba(219, 39, 119, 0.12)',
        badgeText: '#9d174d'
      },
      dark: {
        primary: '#f472b6',
        primaryHover: '#ec4899',
        accent: '#34d399',
        primaryLight: 'rgba(244, 114, 182, 0.20)',
        techGlow: '0 0 26px rgba(244, 114, 182, 0.35)',
        pageBg: 'linear-gradient(135deg, #1c101a 0%, #0d1a15 100%)',
        cardBorder: 'rgba(244, 114, 182, 0.25)',
        badgeBg: 'rgba(244, 114, 182, 0.18)',
        badgeText: '#fbcfe8'
      }
    }
  },
  {
    id: 'summer',
    name: 'Verano',
    icon: '☀️',
    tagline: 'Energía radiante, sol y vitalidad',
    description: 'Azules cielo combinados con turquesa y amarillo ámbar para impulsar tu motivación diaria.',
    category: 'seasonal',
    swatches: ['#0284c7', '#f59e0b', '#06b6d4', '#fb923c'],
    mascotVariant: 'summer',
    mascotLabel: 'Equi con Lentes de Sol',
    tokens: {
      light: {
        primary: '#0284c7',
        primaryHover: '#0369a1',
        accent: '#f59e0b',
        primaryLight: 'rgba(2, 132, 199, 0.14)',
        techGlow: '0 0 22px rgba(2, 132, 199, 0.25)',
        pageBg: 'linear-gradient(135deg, #f0f9ff 0%, #fffbeb 100%)',
        cardBorder: 'rgba(2, 132, 199, 0.20)',
        badgeBg: 'rgba(2, 132, 199, 0.12)',
        badgeText: '#075985'
      },
      dark: {
        primary: '#38bdf8',
        primaryHover: '#0284c7',
        accent: '#fbbf24',
        primaryLight: 'rgba(56, 189, 248, 0.20)',
        techGlow: '0 0 26px rgba(56, 189, 248, 0.35)',
        pageBg: 'linear-gradient(135deg, #0c1825 0%, #1a190f 100%)',
        cardBorder: 'rgba(56, 189, 248, 0.25)',
        badgeBg: 'rgba(56, 189, 248, 0.18)',
        badgeText: '#bae6fd'
      }
    }
  },
  {
    id: 'autumn',
    name: 'Otoño',
    icon: '🍂',
    tagline: 'Calidez, reflexión y cosecha interior',
    description: 'Tonos terracota, ámbar y bronce cálido que invitan a la introspección y el bienestar pacífico.',
    category: 'seasonal',
    swatches: ['#c2410c', '#d97706', '#b45309', '#f97316'],
    mascotVariant: 'autumn',
    mascotLabel: 'Equi con Bufanda Otoñal',
    tokens: {
      light: {
        primary: '#c2410c',
        primaryHover: '#9a3412',
        accent: '#d97706',
        primaryLight: 'rgba(194, 65, 12, 0.14)',
        techGlow: '0 0 22px rgba(194, 65, 12, 0.25)',
        pageBg: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)',
        cardBorder: 'rgba(194, 65, 12, 0.20)',
        badgeBg: 'rgba(194, 65, 12, 0.12)',
        badgeText: '#7c2d12'
      },
      dark: {
        primary: '#fb923c',
        primaryHover: '#f97316',
        accent: '#f59e0b',
        primaryLight: 'rgba(251, 146, 60, 0.20)',
        techGlow: '0 0 26px rgba(251, 146, 60, 0.35)',
        pageBg: 'linear-gradient(135deg, #1c100a 0%, #1e1508 100%)',
        cardBorder: 'rgba(251, 146, 60, 0.25)',
        badgeBg: 'rgba(251, 146, 60, 0.18)',
        badgeText: '#fed7aa'
      }
    }
  },
  {
    id: 'winter',
    name: 'Invierno',
    icon: '❄️',
    tagline: 'Claridad cristalina, calma y sosiego',
    description: 'Azules glaciar, plata y violeta nórdico que transmiten una atmósfera serena y acogedora.',
    category: 'seasonal',
    swatches: ['#0284c7', '#38bdf8', '#818cf8', '#e0f2fe'],
    mascotVariant: 'winter',
    mascotLabel: 'Equi con Gorrito Invernal',
    tokens: {
      light: {
        primary: '#0284c7',
        primaryHover: '#0369a1',
        accent: '#6366f1',
        primaryLight: 'rgba(2, 132, 199, 0.14)',
        techGlow: '0 0 22px rgba(2, 132, 199, 0.25)',
        pageBg: 'linear-gradient(135deg, #f0f9ff 0%, #f1f5f9 100%)',
        cardBorder: 'rgba(2, 132, 199, 0.20)',
        badgeBg: 'rgba(2, 132, 199, 0.12)',
        badgeText: '#0369a1'
      },
      dark: {
        primary: '#38bdf8',
        primaryHover: '#0ea5e9',
        accent: '#a5b4fc',
        primaryLight: 'rgba(56, 189, 248, 0.20)',
        techGlow: '0 0 26px rgba(56, 189, 248, 0.35)',
        pageBg: 'linear-gradient(135deg, #09131e 0%, #0d1527 100%)',
        cardBorder: 'rgba(56, 189, 248, 0.25)',
        badgeBg: 'rgba(56, 189, 248, 0.18)',
        badgeText: '#e0f2fe'
      }
    }
  },
  {
    id: 'halloween',
    name: 'Halloween Mágico',
    icon: '🎃',
    tagline: 'Misterio festivo, creatividad y encanto',
    description: 'Naranja calabaza con violeta obsidiana en una estética alegre y profesional sin terror.',
    category: 'celebration',
    swatches: ['#f97316', '#8b5cf6', '#7c3aed', '#fbbf24'],
    mascotVariant: 'halloween',
    mascotLabel: 'Equi con Sombrero Mágico',
    tokens: {
      light: {
        primary: '#ea580c',
        primaryHover: '#c2410c',
        accent: '#7c3aed',
        primaryLight: 'rgba(234, 88, 12, 0.14)',
        techGlow: '0 0 22px rgba(234, 88, 12, 0.25)',
        pageBg: 'linear-gradient(135deg, #fff7ed 0%, #faf5ff 100%)',
        cardBorder: 'rgba(234, 88, 12, 0.20)',
        badgeBg: 'rgba(234, 88, 12, 0.12)',
        badgeText: '#9a3412'
      },
      dark: {
        primary: '#fb923c',
        primaryHover: '#f97316',
        accent: '#c084fc',
        primaryLight: 'rgba(251, 146, 60, 0.20)',
        techGlow: '0 0 26px rgba(251, 146, 60, 0.35)',
        pageBg: 'linear-gradient(135deg, #180d05 0%, #180c22 100%)',
        cardBorder: 'rgba(251, 146, 60, 0.25)',
        badgeBg: 'rgba(251, 146, 60, 0.18)',
        badgeText: '#fed7aa'
      }
    }
  },
  {
    id: 'birthday',
    name: 'Cumpleaños Festivo',
    icon: '🎂',
    tagline: '¡Celebramos tu vida y tu camino!',
    description: 'Explosión de alegría con magenta, amarillo y azul cielo en honor a tus metas y crecimiento.',
    category: 'celebration',
    swatches: ['#db2777', '#f59e0b', '#0284c7', '#8b5cf6'],
    mascotVariant: 'birthday',
    mascotLabel: 'Equi con Bonete Festivo',
    tokens: {
      light: {
        primary: '#db2777',
        primaryHover: '#be185d',
        accent: '#f59e0b',
        primaryLight: 'rgba(219, 39, 119, 0.14)',
        techGlow: '0 0 22px rgba(219, 39, 119, 0.25)',
        pageBg: 'linear-gradient(135deg, #fdf2f8 0%, #fffbeb 100%)',
        cardBorder: 'rgba(219, 39, 119, 0.20)',
        badgeBg: 'rgba(219, 39, 119, 0.12)',
        badgeText: '#9d174d'
      },
      dark: {
        primary: '#f472b6',
        primaryHover: '#db2777',
        accent: '#fbbf24',
        primaryLight: 'rgba(244, 114, 182, 0.20)',
        techGlow: '0 0 26px rgba(244, 114, 182, 0.35)',
        pageBg: 'linear-gradient(135deg, #1c0f17 0%, #1b160b 100%)',
        cardBorder: 'rgba(244, 114, 182, 0.25)',
        badgeBg: 'rgba(244, 114, 182, 0.18)',
        badgeText: '#fbcfe8'
      }
    }
  },
  {
    id: 'valentines',
    name: 'San Valentín & Empatía',
    icon: '💗',
    tagline: 'Amor propio, conexión saludable y empatía',
    description: 'Rosas cuarzo y carmesí delicado enfocados en el autocuidado, aprecio y vínculos humanos sanos.',
    category: 'celebration',
    swatches: ['#e11d48', '#f43f5e', '#ec4899', '#fda4af'],
    mascotVariant: 'valentines',
    mascotLabel: 'Equi con Corazón de Bienestar',
    tokens: {
      light: {
        primary: '#e11d48',
        primaryHover: '#be123c',
        accent: '#ec4899',
        primaryLight: 'rgba(225, 29, 72, 0.14)',
        techGlow: '0 0 22px rgba(225, 29, 72, 0.25)',
        pageBg: 'linear-gradient(135deg, #fff1f2 0%, #fdf2f8 100%)',
        cardBorder: 'rgba(225, 29, 72, 0.20)',
        badgeBg: 'rgba(225, 29, 72, 0.12)',
        badgeText: '#9f1239'
      },
      dark: {
        primary: '#fb7185',
        primaryHover: '#f43f5e',
        accent: '#f472b6',
        primaryLight: 'rgba(251, 113, 133, 0.20)',
        techGlow: '0 0 26px rgba(251, 113, 133, 0.35)',
        pageBg: 'linear-gradient(135deg, #1f0c11 0%, #1c0e18 100%)',
        cardBorder: 'rgba(251, 113, 133, 0.25)',
        badgeBg: 'rgba(251, 113, 133, 0.18)',
        badgeText: '#fecdd3'
      }
    }
  },
  {
    id: 'environment',
    name: 'Día del Medio Ambiente',
    icon: '🌱',
    tagline: 'Conexión con la naturaleza y calma botánica',
    description: 'Verdes esmeralda y turquesa orgánico inspirados en la frescura de los bosques y el aire puro.',
    category: 'awareness',
    swatches: ['#059669', '#10b981', '#0d9488', '#6ee7b7'],
    mascotVariant: 'environment',
    mascotLabel: 'Equi con Brote Natural',
    tokens: {
      light: {
        primary: '#059669',
        primaryHover: '#047857',
        accent: '#0d9488',
        primaryLight: 'rgba(5, 150, 105, 0.14)',
        techGlow: '0 0 22px rgba(5, 150, 105, 0.25)',
        pageBg: 'linear-gradient(135deg, #f0fdf4 0%, #f0fdfa 100%)',
        cardBorder: 'rgba(5, 150, 105, 0.20)',
        badgeBg: 'rgba(5, 150, 105, 0.12)',
        badgeText: '#065f46'
      },
      dark: {
        primary: '#34d399',
        primaryHover: '#10b981',
        accent: '#2dd4bf',
        primaryLight: 'rgba(52, 211, 153, 0.20)',
        techGlow: '0 0 26px rgba(52, 211, 153, 0.35)',
        pageBg: 'linear-gradient(135deg, #091712 0%, #081a17 100%)',
        cardBorder: 'rgba(52, 211, 153, 0.25)',
        badgeBg: 'rgba(52, 211, 153, 0.18)',
        badgeText: '#a7f3d0'
      }
    }
  },
  {
    id: 'graduation',
    name: 'Graduación y Logro',
    icon: '🎓',
    tagline: 'Excelencia, triunfo académico y meta cumplida',
    description: 'Azul institucional profundo con dorados laureados para celebrar cada paso y culminación formativa.',
    category: 'achievement',
    swatches: ['#1d4ed8', '#d97706', '#3b82f6', '#fbbf24'],
    mascotVariant: 'graduation',
    mascotLabel: 'Equi con Birrete de Graduación',
    tokens: {
      light: {
        primary: '#1d4ed8',
        primaryHover: '#1e40af',
        accent: '#d97706',
        primaryLight: 'rgba(29, 78, 216, 0.14)',
        techGlow: '0 0 22px rgba(29, 78, 216, 0.25)',
        pageBg: 'linear-gradient(135deg, #eff6ff 0%, #fffbeb 100%)',
        cardBorder: 'rgba(29, 78, 216, 0.20)',
        badgeBg: 'rgba(29, 78, 216, 0.12)',
        badgeText: '#1e3a8a'
      },
      dark: {
        primary: '#60a5fa',
        primaryHover: '#3b82f6',
        accent: '#fbbf24',
        primaryLight: 'rgba(96, 165, 250, 0.20)',
        techGlow: '0 0 26px rgba(96, 165, 250, 0.35)',
        pageBg: 'linear-gradient(135deg, #0a1324 0%, #1a170b 100%)',
        cardBorder: 'rgba(96, 165, 250, 0.25)',
        badgeBg: 'rgba(96, 165, 250, 0.18)',
        badgeText: '#bfdbfe'
      }
    }
  },
  {
    id: 'guatemala',
    name: 'Orgullo Guatemalteco',
    icon: '🇬🇹',
    tagline: 'Colores de la patria y transformación en Quetzal',
    description: 'Homenaje a Guatemala con azul cielo, blanco nube y jade. ¡Equi se transforma en Quetzal!',
    category: 'cultural',
    swatches: ['#0284c7', '#059669', '#38bdf8', '#e11d48'],
    mascotVariant: 'quetzal',
    mascotLabel: 'Equi Edición Quetzal',
    tokens: {
      light: {
        primary: '#0284c7',
        primaryHover: '#0369a1',
        accent: '#059669',
        primaryLight: 'rgba(2, 132, 199, 0.14)',
        techGlow: '0 0 24px rgba(2, 132, 199, 0.28)',
        pageBg: 'linear-gradient(135deg, #f0f9ff 0%, #f8fafc 50%, #f0fdf4 100%)',
        cardBorder: 'rgba(2, 132, 199, 0.22)',
        badgeBg: 'rgba(2, 132, 199, 0.12)',
        badgeText: '#0369a1'
      },
      dark: {
        primary: '#38bdf8',
        primaryHover: '#0284c7',
        accent: '#34d399',
        primaryLight: 'rgba(56, 189, 248, 0.20)',
        techGlow: '0 0 28px rgba(56, 189, 248, 0.38)',
        pageBg: 'linear-gradient(135deg, #081726 0%, #0d1b1d 100%)',
        cardBorder: 'rgba(56, 189, 248, 0.25)',
        badgeBg: 'rgba(56, 189, 248, 0.18)',
        badgeText: '#bae6fd'
      }
    }
  },
  {
    id: 'christmas',
    name: 'Navidad y Paz',
    icon: '🎄',
    tagline: 'Espíritu de armonía, gratitud y unión',
    description: 'Rojo escarlata y verde pino complementados con destellos dorados que evocan paz y descanso.',
    category: 'celebration',
    swatches: ['#dc2626', '#15803d', '#f59e0b', '#fca5a5'],
    mascotVariant: 'christmas',
    mascotLabel: 'Equi con Gorro Navideño',
    tokens: {
      light: {
        primary: '#dc2626',
        primaryHover: '#b91c1c',
        accent: '#15803d',
        primaryLight: 'rgba(220, 38, 38, 0.14)',
        techGlow: '0 0 22px rgba(220, 38, 38, 0.25)',
        pageBg: 'linear-gradient(135deg, #fef2f2 0%, #f0fdf4 100%)',
        cardBorder: 'rgba(220, 38, 38, 0.20)',
        badgeBg: 'rgba(220, 38, 38, 0.12)',
        badgeText: '#991b1b'
      },
      dark: {
        primary: '#f87171',
        primaryHover: '#ef4444',
        accent: '#4ade80',
        primaryLight: 'rgba(248, 113, 113, 0.20)',
        techGlow: '0 0 26px rgba(248, 113, 113, 0.35)',
        pageBg: 'linear-gradient(135deg, #1c0c0c 0%, #0c1c11 100%)',
        cardBorder: 'rgba(248, 113, 113, 0.25)',
        badgeBg: 'rgba(248, 113, 113, 0.18)',
        badgeText: '#fecaca'
      }
    }
  },
  {
    id: 'newyear',
    name: 'Año Nuevo: Nuevos Comienzos',
    icon: '🎆',
    tagline: 'Propósito, resiliencia y nuevos horizontes',
    description: 'Azul cósmico profundo y oro reluciente que simbolizan la esperanza y metas renovadas.',
    category: 'celebration',
    swatches: ['#4f46e5', '#d97706', '#818cf8', '#fef08a'],
    mascotVariant: 'newyear',
    mascotLabel: 'Equi con Corbatín de Gala',
    tokens: {
      light: {
        primary: '#4f46e5',
        primaryHover: '#4338ca',
        accent: '#d97706',
        primaryLight: 'rgba(79, 70, 229, 0.14)',
        techGlow: '0 0 24px rgba(79, 70, 229, 0.28)',
        pageBg: 'linear-gradient(135deg, #eef2ff 0%, #fffbeb 100%)',
        cardBorder: 'rgba(79, 70, 229, 0.20)',
        badgeBg: 'rgba(79, 70, 229, 0.12)',
        badgeText: '#3730a3'
      },
      dark: {
        primary: '#a5b4fc',
        primaryHover: '#818cf8',
        accent: '#fbbf24',
        primaryLight: 'rgba(165, 180, 252, 0.20)',
        techGlow: '0 0 28px rgba(165, 180, 252, 0.38)',
        pageBg: 'linear-gradient(135deg, #0d1026 0%, #1c1809 100%)',
        cardBorder: 'rgba(165, 180, 252, 0.25)',
        badgeBg: 'rgba(165, 180, 252, 0.18)',
        badgeText: '#e0e7ff'
      }
    }
  },
  {
    id: 'anniversary',
    name: 'Aniversario de EquilibrIA',
    icon: '🎉',
    tagline: 'Celebrando nuestro camino de bienestar juntos',
    description: 'Dorado conmemorativo y morado tecnológico festivo que honra cada logro y comunidad.',
    category: 'official',
    swatches: ['#7c3aed', '#d97706', '#ec4899', '#fde047'],
    mascotVariant: 'anniversary',
    mascotLabel: 'Equi con Medalla de Aniversario',
    tokens: {
      light: {
        primary: '#7c3aed',
        primaryHover: '#6d28d9',
        accent: '#d97706',
        primaryLight: 'rgba(124, 58, 237, 0.14)',
        techGlow: '0 0 24px rgba(124, 58, 237, 0.28)',
        pageBg: 'linear-gradient(135deg, #f5f3ff 0%, #fffbeb 100%)',
        cardBorder: 'rgba(124, 58, 237, 0.20)',
        badgeBg: 'rgba(124, 58, 237, 0.12)',
        badgeText: '#5b21b6'
      },
      dark: {
        primary: '#c084fc',
        primaryHover: '#a855f7',
        accent: '#fbbf24',
        primaryLight: 'rgba(192, 132, 252, 0.20)',
        techGlow: '0 0 28px rgba(192, 132, 252, 0.38)',
        pageBg: 'linear-gradient(135deg, #150d26 0%, #1a1508 100%)',
        cardBorder: 'rgba(192, 132, 252, 0.25)',
        badgeBg: 'rgba(192, 132, 252, 0.18)',
        badgeText: '#f3e8ff'
      }
    }
  }
];

export const getThemeById = (id) => {
  return THEMES.find(t => t.id === id) || THEMES[0];
};
