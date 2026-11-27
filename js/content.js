/* ============================================================
   CAPRA · contenido compartido de las tres propuestas (v6)
   Business Astrology & Intelligence · Wisdom. Timing. Legacy.
   Reglas: orientación de timing (nunca predicción ni garantías), sin métricas inventadas,
   sin nombres de personas reales, foco en el producto/servicio.
   ============================================================ */

export const BRAND = {
  name: 'CAPRA',
  slogan: 'Greatest of all timing',
  descriptor: 'Business Astrology & Intelligence',
  philosophy: ['Wisdom', 'Timing', 'Legacy'],
  lines: {
    hero: 'Astrología para CEOs modernos.',
    heroAlt: 'Inteligencia empresarial con el cielo como dato.',
    sub: 'Tus metas, tus empresas y el cielo real, convertidos en decisiones: cuándo vender, invertir, contratar y lanzar.',
    noAstro: 'No necesitas saber astrología.',
    disclaimer: 'Orientación de timing para reflexión y planeación. No es asesoría financiera, legal, fiscal, médica ni psicológica y no garantiza resultados. La IA traduce; tú decides.',
  },
};

/* Lo que todo CEO busca: los cuatro motores del dinero, con su timing */
export const PILLARS = [
  { k: 'vender', icon: 'currency-dollar', t: 'Vender', d: 'Días para cerrar, subir precio y negociar.', planet: 'Venus · Júpiter' },
  { k: 'invertir', icon: 'coins', t: 'Invertir', d: 'Ventanas para firmar, levantar capital y comprar.', planet: 'Júpiter · Saturno' },
  { k: 'contratar', icon: 'users-three', t: 'Contratar', d: 'Cuándo sumar talento y cuándo ordenar el equipo.', planet: 'Saturno · Luna' },
  { k: 'lanzar', icon: 'rocket-launch', t: 'Lanzar', d: 'El arranque correcto para productos y campañas.', planet: 'Sol · Marte' },
];

/* Herramientas (todas calculan con el cielo real en el navegador) */
export const TOOLS = [
  { k: 'escaner', icon: 'gauge', t: 'Escáner de timing', d: 'Tu empresa contra el cielo de hoy, en 10 segundos.' },
  { k: 'carta', icon: 'compass', t: 'Carta de empresa', d: 'Cómo crece, dónde se atora y qué la impulsa.' },
  { k: 'fechas', icon: 'calendar-check', t: 'Calendario electoral', d: 'Los mejores días para firmar, lanzar o negociar.' },
  { k: 'ola', icon: 'trend-up', t: 'Ola de 12 meses', d: 'Tus meses fuertes para cada meta del año.' },
  { k: 'revolucion', icon: 'target', t: 'Revolución solar', d: 'Tu año nuevo personal, al minuto.' },
  { k: 'sinastria', icon: 'hand-coins', t: 'CEO ↔ empresa', d: 'Dónde empujas tú y dónde empuja tu negocio.' },
];

/* Biblioteca de conocimiento: negocio + timing. Maiven recomienda desde aquí. */
export const LIB_CATS = ['Todo', 'Liderazgo', 'Ventas', 'Finanzas', 'Negociación', 'Comunicación', 'Planeación', 'Equipo', 'Estrategia', 'Energía', 'Timing', 'Astrología'];
export const LIBRARY = [
  { t: 'Decidir con información incompleta', c: 'Liderazgo', type: 'Lección', min: 4, s: 'El método 70 %: cuándo ya sabes suficiente para mover.' },
  { t: 'Liderar en semanas de presión', c: 'Liderazgo', type: 'Guía', min: 6, s: 'Qué delegar, qué cuidar y qué posponer cuando todo urge.' },
  { t: 'Tu estilo de mando según tu carta', c: 'Liderazgo', type: 'Lección', min: 5, s: 'Sol, Marte y Saturno: cómo decides, cómo empujas, cómo sostienes.' },
  { t: 'Reuniones de 1 a 1 que sí sirven', c: 'Liderazgo', type: 'Plantilla', min: 3, s: 'Cuatro preguntas que destraban a tu equipo.' },
  { t: 'Cerrar sin presionar', c: 'Ventas', type: 'Lección', min: 4, s: 'Pregunta, escucha, propone: el cierre consultivo.' },
  { t: 'Subir precios sin perder clientes', c: 'Ventas', type: 'Guía', min: 7, s: 'Cómo anunciarlo, a quién primero y en qué momento.' },
  { t: 'Pipeline en una hoja', c: 'Ventas', type: 'Plantilla', min: 3, s: 'Las 5 columnas que predicen tu mes.' },
  { t: 'Venus y Júpiter: tus días de cierre', c: 'Ventas', type: 'Timing', min: 3, s: 'Cuando el cielo acompaña las conversaciones de dinero.' },
  { t: 'Flujo de caja para CEOs', c: 'Finanzas', type: 'Lección', min: 6, s: 'Las 3 cifras que debes ver cada lunes.' },
  { t: 'Valuación sin humo', c: 'Finanzas', type: 'Guía', min: 8, s: 'Pre-money, dilución y lo que sí negocia un inversionista.' },
  { t: 'Presupuesto por trimestres', c: 'Finanzas', type: 'Plantilla', min: 4, s: 'Planea en ciclos de 90 días, no en años eternos.' },
  { t: 'Cuándo invertir y cuándo guardar', c: 'Finanzas', type: 'Timing', min: 4, s: 'Ciclos de expansión y de estructura en tu año.' },
  { t: 'Negociar desde tu BATNA', c: 'Negociación', type: 'Lección', min: 5, s: 'Tu mejor alternativa es tu verdadero poder.' },
  { t: 'Concesiones que suman', c: 'Negociación', type: 'Guía', min: 4, s: 'Da lo que te cuesta poco y vale mucho para el otro.' },
  { t: 'Firmar con Mercurio retrógrado', c: 'Negociación', type: 'Timing', min: 3, s: 'Qué revisar, qué renegociar y qué esperar.' },
  { t: 'Contar tu empresa en 60 segundos', c: 'Comunicación', type: 'Lección', min: 4, s: 'Problema, solución, prueba, pedido.' },
  { t: 'Hablar frente a tu consejo', c: 'Comunicación', type: 'Guía', min: 6, s: 'Datos primero, historia después, decisión al final.' },
  { t: 'Correos que se contestan', c: 'Comunicación', type: 'Plantilla', min: 2, s: 'Una pregunta, un plazo, un siguiente paso.' },
  { t: 'Mercurio: tu mente de negocios', c: 'Comunicación', type: 'Astrología', min: 4, s: 'Cómo piensas, cómo vendes ideas y cómo te conviene escribir.' },
  { t: 'OKRs que no mueren en marzo', c: 'Planeación', type: 'Lección', min: 5, s: 'Pocos objetivos, resultados medibles, revisión mensual.' },
  { t: 'Planear con la Luna', c: 'Planeación', type: 'Timing', min: 4, s: 'Siembra en creciente, cosecha en llena, ajusta en menguante.' },
  { t: 'Tu año empieza en tu cumpleaños', c: 'Planeación', type: 'Astrología', min: 5, s: 'La revolución solar como plan estratégico personal.' },
  { t: 'Contratar por valores', c: 'Equipo', type: 'Lección', min: 5, s: 'Las preguntas que revelan cómo trabaja alguien.' },
  { t: 'Delegar resultados, no tareas', c: 'Equipo', type: 'Guía', min: 4, s: 'Qué entregas, qué sueltas y cómo das seguimiento.' },
  { t: 'Saturno y tu equipo', c: 'Equipo', type: 'Timing', min: 3, s: 'Cuándo ordenar, cuándo sumar y cuándo cerrar ciclos.' },
  { t: 'Estrategia en una página', c: 'Estrategia', type: 'Plantilla', min: 5, s: 'Dónde jugar, cómo ganar y qué no hacer.' },
  { t: 'Ventaja injusta', c: 'Estrategia', type: 'Lección', min: 4, s: 'Lo que tienes que otros no pueden copiar rápido.' },
  { t: 'Júpiter: los años de expansión', c: 'Estrategia', type: 'Astrología', min: 5, s: 'Ciclos de 12 años para crecer con método.' },
  { t: 'Energía antes que agenda', c: 'Energía', type: 'Lección', min: 4, s: 'Diseña tu semana según tus horas fuertes.' },
  { t: 'Descanso que produce', c: 'Energía', type: 'Guía', min: 3, s: 'Pausas cortas que sostienen decisiones largas.' },
  { t: 'Marte y tu ritmo', c: 'Energía', type: 'Astrología', min: 3, s: 'Cuándo acelerar y cuándo cuidar tu energía.' },
  { t: 'Qué es el timing (en 3 minutos)', c: 'Timing', type: 'Lección', min: 3, s: 'Por qué el cuándo pesa tanto como el qué.' },
  { t: 'Horas planetarias para tu agenda', c: 'Timing', type: 'Herramienta', min: 2, s: 'La mejor hora del día para cada tipo de reunión.' },
  { t: 'Eclipses: semanas de giro', c: 'Timing', type: 'Timing', min: 4, s: 'Por qué conviene no arrancar cerca de un eclipse.' },
  { t: 'La carta de tu empresa', c: 'Astrología', type: 'Lección', min: 5, s: 'Tu empresa nació un día: así se lee su cielo.' },
  { t: 'Sol, Luna y Ascendente sin misterio', c: 'Astrología', type: 'Lección', min: 4, s: 'Lo esencial de tu carta en lenguaje de negocios.' },
  { t: 'Sinastría CEO–empresa', c: 'Astrología', type: 'Herramienta', min: 4, s: 'Dónde se impulsan y dónde chocan tú y tu negocio.' },
  { t: 'Los 12 arquetipos de empresa', c: 'Astrología', type: 'Guía', min: 7, s: 'De la pionera a la visionaria: ¿cuál es la tuya?' },
];

/* Maiven: guía IA que cruza tus metas, tu carta y el cielo con habilidades de negocio */
export const MAIVEN = {
  name: 'Maiven',
  tagline: 'Tu guía de inteligencia empresarial.',
  areas: ['Liderazgo', 'Ventas', 'Finanzas', 'Negociación', 'Comunicación', 'Planeación', 'Equipo', 'Estrategia', 'Energía'],
  demo: [
    { me: 'Quiero levantar 2 millones este año.' },
    { ai: 'Tu ventana fuerte es en marzo. Hasta entonces, tres frentes:', list: [['Aprende', 'Valuación sin humo · 8 min', 'Finanzas'], ['Busca', 'Dos fundadores que ya levantaron en tu sector', 'Red'], ['Practica', 'Tu pitch de 60 segundos', 'Comunicación']] },
    { me: '¿Y cuándo firmo con el inversionista?' },
    { ai: '{BEST}. Evita la semana del eclipse. Te aviso un día antes.', why: 'Calendario electoral · 30 días · tu carta' },
  ],
};

/* CAPRA Society: membresía (precios de referencia, USD/mes) */
export const SOCIETY = {
  t: 'CAPRA Society',
  d: 'Fundadores y CEOs que deciden con timing. Lecturas firmadas, sesiones en vivo y la biblioteca completa.',
  tiers: [
    { n: 'Founder', p: 87, d: 'Para quien empieza.', f: ['Metas y ola de 12 meses', 'Maiven semanal', 'Calendario de fechas clave', '1 empresa'] },
    { n: 'Advisor', p: 174, hot: true, d: 'Para quien ya escala.', f: ['Todo Founder', 'Hasta 3 empresas', 'Lecturas firmadas de la red', 'Biblioteca completa'] },
    { n: 'Holding', p: 464, d: 'Para grupos y family offices.', f: ['Todo Advisor', 'Empresas sin límite', 'Equipo directivo (10 cartas)', 'Una sesión al mes'] },
  ],
};

/* The CAPRA Codex: el universo artístico (ver codex.js) */
export const CODEX = [
  { k: 'capricornus', n: 'I', t: 'Capricornus', e: 'The Architect', biz: 'Estructura y visión de largo plazo', area: 'Estrategia' },
  { k: 'saturn', n: 'II', t: 'Saturn', e: 'The Master of Time', biz: 'Disciplina, plazos y ciclos', area: 'Planeación' },
  { k: 'jupiter', n: 'III', t: 'Jupiter', e: 'The Visionary', biz: 'Crecimiento, capital y expansión', area: 'Finanzas' },
  { k: 'mercury', n: 'IV', t: 'Mercury', e: 'The Messenger', biz: 'Ventas, contratos y comunicación', area: 'Ventas' },
  { k: 'sun', n: 'V', t: 'The Sun', e: 'The Leader', biz: 'Liderazgo, marca y propósito', area: 'Liderazgo' },
  { k: 'wheel', n: 'VI', t: 'The Wheel', e: 'The Cycle', biz: 'Timing: el cielo de hoy, en vivo', area: 'Timing' },
];

/* Paletas del brief */
export const PALETTE = {
  institutional: { carbon: '#111116', ivory: '#F4F0E6', saturn: '#252535', platinum: '#B8B8C5', antique: '#B6A17A' },
  spectrum: { amethyst: '#9871E8', solar: '#F2C65C', ether: '#7299F4', jade: '#75C9AD', coral: '#E97E87' },
};

/* Ciudades (ids compatibles con la app) */
export const CITIES = [
  ['cdmx', 'Ciudad de México', 19.4326, -99.1332, 'America/Mexico_City'], ['mty', 'Monterrey', 25.6866, -100.3161, 'America/Monterrey'], ['gdl', 'Guadalajara', 20.6597, -103.3496, 'America/Mexico_City'],
  ['slp', 'San Luis Potosí', 22.1565, -100.9855, 'America/Mexico_City'], ['qro', 'Querétaro', 20.5888, -100.3899, 'America/Mexico_City'], ['pue', 'Puebla', 19.0414, -98.2063, 'America/Mexico_City'],
  ['mid', 'Mérida', 20.9674, -89.5926, 'America/Merida'], ['cun', 'Cancún', 21.1619, -86.8515, 'America/Cancun'], ['tij', 'Tijuana', 32.5149, -117.0382, 'America/Tijuana'],
  ['bog', 'Bogotá', 4.711, -74.0721, 'America/Bogota'], ['lim', 'Lima', -12.0464, -77.0428, 'America/Lima'], ['scl', 'Santiago', -33.4489, -70.6693, 'America/Santiago'],
  ['bue', 'Buenos Aires', -34.6037, -58.3816, 'America/Argentina/Buenos_Aires'], ['mad', 'Madrid', 40.4168, -3.7038, 'Europe/Madrid'], ['mia', 'Miami', 25.7617, -80.1918, 'America/New_York'],
  ['nyc', 'Nueva York', 40.7128, -74.006, 'America/New_York'], ['lax', 'Los Ángeles', 34.0522, -118.2437, 'America/Los_Angeles'],
].map(([id, n, lat, lon, tz]) => ({ id, n, lat, lon, tz }));

/* Escáner de timing (estilo «exposure check»): pasos y cálculo real con window.Astro */
export function timingScan(A, { name, date, cityId, action = 'firmar' }) {
  const p = CITIES.find((c) => c.id === cityId) || CITIES[0];
  const [y, m, d] = date.split('-').map(Number);
  const natal = A.chart(A.zonedToUtc(y, m, d, 12, 0, p.tz), p, false);
  const areas = A.areaScores(natal, Date.now());
  const days = A.electional(natal, action, Date.now(), 30, p);
  const top = days.filter((x) => !x.veto).sort((a, b) => b.score - a.score).slice(0, 3).sort((a, b) => a.day - b.day);
  const SN = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'];
  const score = Math.round(areas.reduce((s, a) => s + a.score, 0) / areas.length);
  return {
    name, place: p, natal, sun: SN[natal.by.Sun.sign], score, areas, days, top,
    vetos: days.filter((x) => x.veto).length,
    steps: [
      ['Calculando la carta de ' + name, 'listo'],
      ['Sol en ' + SN[natal.by.Sun.sign] + ' · ' + natal.pts.length + ' puntos', 'listo'],
      ['Cruzando con el cielo de hoy', 'listo'],
      ['6 áreas del negocio evaluadas', 'listo'],
      ['Buscando ventanas para ' + action + ' (30 días)', top.length + ' encontradas'],
    ],
  };
}
