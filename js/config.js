/* CAPRA · datos del sitio. build.py cambia hola@astrocapra.com y astrocapra.com al publicar. */
export const SITE = {
  correo: 'hola@astrocapra.com',
  dominio: 'astrocapra.com',
  // Lanzamiento de la app: martes 9 de marzo de 2027, 14:53 h del centro de México (UTC-6, sin horario de verano).
  lanzamiento: Date.UTC(2027, 2, 9, 20, 53),
};

/* Correos que abre cada botón: [asunto, cuerpo] */
export const MAIL = {
  suscribir: ['Quiero suscribirme a CAPRA', 'Hola, quiero suscribirme a CAPRA y que me avisen del lanzamiento.\n\nNombre:\nEmpresa:\nPlan que me interesa (Founder, Advisor o Holding):\n'],
  avisame: ['Avísame cuando salga la app de CAPRA', 'Hola, quiero que me avisen cuando salga la app.\n\nNombre:\nEmpresa:\n'],
  sesion: ['Sesión 1:1 con un astrólogo', 'Hola, me interesa una sesión 1:1 para profundizar en:\n\nNombre:\nEmpresa:\n'],
  contacto: ['Contacto · CAPRA', 'Hola:\n\n'],
};

export const mailto = (subject, body) => 'mailto:' + SITE.correo + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body || '');
