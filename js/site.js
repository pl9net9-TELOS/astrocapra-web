/* ============================================================
   CAPRA · sitio de producción
   Intro (el arco se dibuja y lo atravesamos) → la cabra-pez en luz → manifiesto →
   calendario de lunas → el cielo ahora → escáner → app (capturas) → Maiven → Society →
   lanzamiento con cuenta regresiva. Suscripción por correo (mailto).
   ============================================================ */
import { CITIES, timingScan, MAIVEN, SOCIETY } from './content.js';
import { ico } from './icons.js';
import { SITE, MAIL, mailto } from './config.js';

const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const A = window.Astro;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOB = () => innerWidth < 860;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const VS = '︎';
const PG = { Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇' };
const PN = { Sun: 'Sol', Moon: 'Luna', Mercury: 'Mercurio', Venus: 'Venus', Mars: 'Marte', Jupiter: 'Júpiter', Saturn: 'Saturno', Uranus: 'Urano', Neptune: 'Neptuno', Pluto: 'Plutón' };
const SG = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const SN = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'];
const BODIES = Object.keys(PG);
const tzL = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Mexico_City';
const fmt = (ts, o, tz) => new Intl.DateTimeFormat('es-MX', Object.assign({ timeZone: tz || tzL }, o)).format(ts).replace(/\./g, '');
const hm = (ts, tz) => fmt(ts, { hour: '2-digit', minute: '2-digit', hour12: false }, tz);
const dm = (lon) => { const x = ((lon % 30) + 30) % 30; return String(Math.floor(x)).padStart(2, '0') + '°' + String(Math.floor((x % 1) * 60)).padStart(2, '0') + '′'; };
const plain = (r) => { const t = (r && r.t) || ''; if (/retrógrado/.test(t)) return 'Día para revisar, no para firmar'; if (/Eclipse/.test(t)) return 'Semana de giro: evita arranques'; if (/creciente/.test(t)) return 'Energía en aumento'; if (/a favor/.test(t)) return 'El ambiente acompaña'; if (/Hora de/.test(t)) return 'Hay una hora clara para decidir'; if (/menguante/.test(t)) return 'Mejor revisar que iniciar'; return r && r.ok ? 'Viento a favor' : 'Día neutral'; };

/* ---------- empresa base (muestra hasta que escaneas la tuya) ---------- */
let CO = { name: 'Norte Logística', date: '2018-04-23', city: 'mty', sample: true };
const ACTS = [['lanzar', 'lanzar'], ['firmar', 'firmar'], ['contratar', 'contratar'], ['invertir', 'invertir'], ['negociar', 'negociar']];
let DAYS = {};
function computeDays() {
  const p = CITIES.find((c) => c.id === CO.city) || CITIES[0]; const [y, m, d] = CO.date.split('-').map(Number);
  const natal = A.chart(A.zonedToUtc(y, m, d, 12, 0, p.tz), p, false);
  DAYS = {}; ACTS.forEach(([k]) => { const days = A.electional(natal, k, Date.now(), 30, p); const top = days.filter((x) => !x.veto).sort((a, b) => b.score - a.score).slice(0, 3); DAYS[k] = { days, top, p }; });
}

/* ---------- intro ---------- */
const intro = $('#intro');
let introDone = false;
function finishIntro() { if (introDone) return; introDone = true; document.body.classList.add('ready'); intro.classList.add('skip'); }
function runIntro() {
  let seen = false; try { seen = sessionStorage.getItem('capra-intro') === '1'; sessionStorage.setItem('capra-intro', '1'); } catch (e) { /* sin almacenamiento */ }
  if (RM || seen) { intro.classList.add('skip'); document.body.classList.add('ready'); introDone = true; return 0; }
  setTimeout(() => intro.classList.add('go'), 2500);
  setTimeout(() => document.body.classList.add('ready'), 2900);
  setTimeout(finishIntro, 3700);
  return 2500;
}

/* ---------- 3D ---------- */
let OBS = null, REVEAL_T0 = 0;
async function init3d(delay) {
  try {
    const t = document.createElement('canvas'); if (!(t.getContext('webgl2') || t.getContext('webgl'))) throw new Error('sin WebGL');
    const m = await import('./scene.js'); OBS = m.createObservatory($('#gl'), { mobile: MOB(), goat: 'img/cabra.webp' });
    REVEAL_T0 = performance.now() + delay; skyNow(); onScroll(); tick();
  } catch (e) { console.warn('3D no disponible', e); }
}
function tick() {
  requestAnimationFrame(tick);
  if (!OBS) return;
  const intro = RM ? 1 : clamp((performance.now() - REVEAL_T0) / 3600);
  OBS.state.reveal = Math.max(OBS.state._scrollReveal ?? 0, ease(intro));
  OBS.state.artReveal = Math.max(OBS.state._scrollReveal ?? 0, RM ? 1 : ease(clamp((performance.now() - REVEAL_T0) / 6200)));
}

/* ---------- cielo en vivo ---------- */
let SKY = [];
function skyNow() {
  const d = new Date(); SKY = BODIES.map((k) => { const lon = A.lonAt(k, d); return { k, lon, sign: Math.floor(lon / 30), rx: k !== 'Sun' && k !== 'Moon' && A.speedAt(k, d) < 0 }; });
  if (OBS) OBS.setSky(SKY);
  $('#console').innerHTML = SKY.map((b) => '<li><span class="g">' + PG[b.k] + VS + '</span><span>' + PN[b.k] + '</span><b>' + SG[b.sign] + VS + ' ' + dm(b.lon) + (b.rx ? '<span class="rx">RX</span>' : '') + '</b></li>').join('');
}
const p2 = (n) => String(n).padStart(2, '0');
function left() {
  let ms = Math.max(0, SITE.lanzamiento - Date.now());
  const d = Math.floor(ms / 864e5); ms -= d * 864e5; const h = Math.floor(ms / 36e5); ms -= h * 36e5; const m = Math.floor(ms / 6e4); const s = Math.floor((ms - m * 6e4) / 1000);
  return { d, h, m, s };
}
function hud() {
  const now = Date.now(), m = A.moonInfo(now), L = left();
  $('#hudL').innerHTML = 'UTC <b>' + new Date(now).toISOString().slice(11, 19) + '</b><br>Luna <b>' + Math.round(m.ill * 100) + ' % · ' + SN[m.sign] + '</b><br>App <b>T– ' + L.d + ' d ' + p2(L.h) + ':' + p2(L.m) + ':' + p2(L.s) + '</b>';
  const c = $('#cD'); if (c) { c.textContent = L.d; $('#cH').textContent = p2(L.h); $('#cM').textContent = p2(L.m); $('#cS').textContent = p2(L.s); }
}

/* ---------- suscripción por correo ---------- */
function bindMail() {
  $$('[data-mail]').forEach((a) => { const M = MAIL[a.dataset.mail]; if (M) a.href = mailto(M[0], M[1]); });
  const T = $('#mailToast'); let tm = 0;
  const show = () => { T.hidden = false; clearTimeout(tm); tm = setTimeout(() => { T.hidden = true; }, 9000); };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="mailto:"]');
    if (a) { setTimeout(() => { if (document.visibilityState === 'visible' && document.hasFocus()) show(); }, 1300); return; }
    const c = e.target.closest('[data-copy]');
    if (c) {
      const lab = $('span', c), old = lab.textContent;
      const done = () => { lab.textContent = 'Copiado'; setTimeout(() => { lab.textContent = old; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(SITE.correo).then(done, () => { lab.textContent = SITE.correo; });
      else lab.textContent = SITE.correo;
      return;
    }
    if (e.target.closest('.mt-x')) T.hidden = true;
  });
}

/* ---------- manifiesto ---------- */
const man = $('#manifesto');
man.innerHTML = man.textContent.split(' ').map((w) => '<span class="w">' + esc(w) + ' </span>').join('');
const words = $$('.w', man);

/* ---------- cuándo: calendario de lunas (cada día es una luna; más luz = mejor momento) ---------- */
let ACT = 'lanzar', SEL = null;
const ACT_N = { lanzar: 'Lanzar', firmar: 'Firmar', contratar: 'Contratar', invertir: 'Invertir', negociar: 'Negociar' };
function moonPath(f, r = 10) {
  f = clamp(f, 0.02, 1); if (f >= 0.98) return `M0 ${-r} A${r} ${r} 0 1 1 0 ${r} A${r} ${r} 0 1 1 0 ${-r}Z`;
  const k = Math.abs(1 - 2 * f) * r, sweep = f < 0.5 ? 0 : 1;
  return `M0 ${-r} A${r} ${r} 0 0 1 0 ${r} A${k.toFixed(2)} ${r} 0 0 ${sweep} 0 ${-r}Z`;
}
function renderActs() {
  $('#acts').innerHTML = ACTS.map(([k]) => '<button type="button" role="tab" aria-selected="' + (k === ACT) + '" data-k="' + k + '">' + ACT_N[k] + '</button>').join('');
}
function renderCal() {
  const D = DAYS[ACT]; if (!D) return;
  const tz = D.p.tz, first = D.days[0].day + 12 * 36e5;
  const wd = (ts) => (['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'].indexOf(fmt(ts, { weekday: 'short' }, tz).toLowerCase()) + 7) % 7;
  const lead = Math.max(0, wd(first));
  $('#calHead').innerHTML = ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d) => '<span>' + d + '</span>').join('');
  const today = D.days[0].day;
  const ok = D.days.filter((x) => !x.veto).map((x) => x.score), mn = Math.min(...ok), mx = Math.max(...ok);
  D.lum = (x) => x.veto ? 0 : 0.1 + 0.9 * (mx > mn ? (x.score - mn) / (mx - mn) : 0.5);
  let h = ''; for (let i = 0; i < lead; i++) h += '<span class="day pad"></span>';
  h += D.days.map((x, i) => {
    const top = D.top.includes(x), f = D.lum(x), o = (0.35 + 0.65 * f).toFixed(2);
    return '<button type="button" class="day' + (top ? ' top' : '') + (x.veto ? ' veto' : '') + (x.day === today ? ' today' : '') + '" data-i="' + i + '" style="--i:' + i + ';--o:' + o + '" aria-label="' + esc(fmt(x.day + 12 * 36e5, { weekday: 'long', day: 'numeric', month: 'long' }, tz)) + ' · ' + x.score + ' de 100' + (x.veto ? ' · veto' : '') + '">' +
      '<b>' + fmt(x.day + 12 * 36e5, { day: 'numeric' }, tz) + '</b><svg viewBox="-12 -12 24 24" aria-hidden="true"><circle class="rim" r="10"/><path class="lit" d="' + moonPath(f) + '"/>' + (x.veto ? '<line class="x" x1="-9" y1="9" x2="9" y2="-9"/>' : '') + '</svg></button>';
  }).join('');
  $('#calGrid').innerHTML = h;
  requestAnimationFrame(() => $$('#calGrid .day').forEach((d) => d.classList.add('on')));
  const best = D.top.slice().sort((p, q) => q.score - p.score)[0];
  selectDay(SEL != null && D.days[SEL] ? SEL : D.days.indexOf(best));
}
function selectDay(i) {
  const D = DAYS[ACT]; const x = D.days[i]; if (!x) return; SEL = i;
  $$('#calGrid .day').forEach((d) => d.classList.toggle('sel', +d.dataset.i === i));
  const tz = D.p.tz, r = x.reasons.find((q) => q.ok) || x.reasons[0];
  $('#dayCard').innerHTML = '<svg class="mo" viewBox="-12 -12 24 24" aria-hidden="true"><circle r="10" fill="none" stroke="' + (D.top.includes(x) ? '#D9C08A' : 'rgba(242,240,234,.3)') + '"/><path d="' + moonPath(D.lum ? D.lum(x) : x.score / 100) + '" fill="' + (D.top.includes(x) ? '#D9C08A' : '#F2F0EA') + '"/></svg>' +
    '<span class="d">' + esc(fmt(x.day + 12 * 36e5, { weekday: 'long', day: 'numeric', month: 'short' }, tz)) + '</span>' +
    '<span class="h">' + (x.veto ? 'Veto · mejor no ' + ACT : (x.best ? hm(x.best.start, tz) + '–' + hm(x.best.end, tz) + ' · ' : '') + x.score + ' de 100') + '</span>' +
    '<span class="r">' + esc(x.veto ? 'El cielo pide revisar, no arrancar.' : plain(r)) + ' · ' + esc(CO.sample ? 'empresa de muestra' : CO.name) + '</span>' +
    '<a class="lnk" href="' + esc(mailto('Mis fechas para ' + ACT, 'Hola, quiero mis mejores fechas para ' + ACT + '.\n\nEmpresa: ' + (CO.sample ? '' : CO.name) + (CO.sample ? '' : '\nFecha de fundación: ' + CO.date) + '\nMi nombre:\n')) + '"><i></i>Quiero mis fechas<i></i></a>';
}
function bindCal() {
  $('#acts').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; ACT = b.dataset.k; SEL = null; renderActs(); $$('#calGrid .day').forEach((d) => d.classList.remove('on')); setTimeout(renderCal, RM ? 0 : 180); });
  $('#calGrid').addEventListener('click', (e) => { const d = e.target.closest('.day:not(.pad)'); if (d) selectDay(+d.dataset.i); });
}

/* ---------- escáner ---------- */
function bindScanner() {
  $('#sCity').innerHTML = CITIES.map((c) => '<option value="' + c.id + '">' + c.n + '</option>').join('');
  const g = CITIES.findIndex((c) => c.tz === tzL); if (g > 0) $('#sCity').value = CITIES[g].id;
  $('#sDate').max = new Date().toISOString().slice(0, 10);
  $('#scanForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#sName').value.trim() || 'Tu empresa', date = $('#sDate').value, city = $('#sCity').value;
    if (!date) return;
    const term = $('#term'), res = $('#result'), st = $('#termState');
    res.hidden = true; res.innerHTML = ''; term.innerHTML = ''; st.textContent = 'escaneando'; st.classList.add('run');
    let R; try { R = timingScan(A, { name, date, cityId: city, action: 'firmar' }); } catch (err) { term.innerHTML = '<p class="dim">› No pude calcular esa fecha.</p>'; st.textContent = 'error'; return; }
    for (let i = 0; i < R.steps.length; i++) { await new Promise((r) => setTimeout(r, RM ? 0 : 420)); term.insertAdjacentHTML('beforeend', '<p class="ok"><span>› ' + esc(R.steps[i][0]) + '</span><span>' + esc(R.steps[i][1]) + '</span></p>'); }
    await new Promise((r) => setTimeout(r, RM ? 0 : 350));
    st.textContent = 'listo'; st.classList.remove('run');
    const C2 = 2 * Math.PI * 52, AN = { ventas: 'Ventas', producto: 'Producto', operaciones: 'Operación', finanzas: 'Finanzas', talento: 'Talento', comms: 'Comunicación' };
    res.innerHTML = '<div class="dial"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="rgba(242,240,234,.1)" stroke-width="4"/><circle cx="60" cy="60" r="52" fill="none" stroke="#D9C08A" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + (C2 * R.score / 100).toFixed(1) + ' 999"/></svg><b>' + R.score + '</b><small>HOY</small></div>' +
      '<div class="ar">' + R.areas.map((a) => '<div class="' + (a.score >= 70 ? 'hi' : '') + '">' + AN[a.k] + ' · ' + a.score + '<i style="--v:' + a.score + '%"></i></div>').join('') + '</div>' +
      '<div class="best">' + R.top.map((x) => { const r = x.reasons.find((q) => q.ok) || x.reasons[0]; return '<div><b>' + esc(fmt(x.day + 12 * 36e5, { weekday: 'short', day: 'numeric', month: 'short' }, R.place.tz)) + '</b><small>' + (x.best ? hm(x.best.start, R.place.tz) + '–' + hm(x.best.end, R.place.tz) : 'Todo el día') + '</small><p>' + esc(plain(r)) + '</p></div>'; }).join('') + '</div>' +
      '<a class="lnk" href="' + esc(mailto('Reporte de timing · ' + name, 'Hola, quiero el reporte completo de mi empresa.\n\nEmpresa: ' + name + '\nFecha de fundación: ' + date + '\nCiudad: ' + ((CITIES.find((c) => c.id === city) || {}).n || city) + '\nÍndice de hoy en el sitio: ' + R.score + ' de 100\n\nMi nombre:\n')) + '"><i></i>Recibe el reporte de ' + esc(name) + '<i></i></a>';
    res.hidden = false;
    CO = { name, date, city, sample: false }; computeDays(); SEL = null; renderCal(); renderChat();
  });
}

/* ---------- app, Maiven, Society ---------- */
function renderStatic() {
  const F = [['gauge', 'Hoy', 'Tu día en una cifra y la mejor hora.'], ['target', 'Metas', 'Del año y del mes, con sus meses fuertes.'], ['calendar-check', 'Fechas', 'Los días exactos para cada decisión.'], ['chat-circle-dots', 'Maiven', 'Tu guía de inteligencia empresarial.'], ['compass', 'Empresas', 'Cada una con su carta y su semáforo.']];
  $('#feats').innerHTML = F.map(([i, t, d]) => '<li>' + ico(i) + '<b>' + t + '</b><span>' + d + '</span></li>').join('');
  const IC = { Liderazgo: 'flag-banner', Ventas: 'trend-up', Finanzas: 'coins', Negociación: 'hand-coins', Comunicación: 'megaphone', Planeación: 'calendar-check', Equipo: 'users-three', Estrategia: 'target', Energía: 'lightning' };
  $('#areas').innerHTML = MAIVEN.areas.map((a) => '<div>' + ico(IC[a] || 'compass') + a + '</div>').join('');
  const DEEP = [['flower-lotus', 'Meditación'], ['waveform', 'Música · frecuencias'], ['sun-horizon', 'Espiritualidad'], ['house-line', 'Familia'], ['link-simple', 'Conexión'], ['plant', 'Desarrollo personal']];
  $('#deep').innerHTML = DEEP.map(([i, a]) => '<div>' + ico(i) + a + '</div>').join('');
  $('#tiers').innerHTML = SOCIETY.tiers.map((t) => '<article class="tier rv' + (t.hot ? ' hot' : '') + '"><h3>' + t.n + '</h3><p class="pd">' + t.d + '</p><p class="pr">' + t.p + '<small>USD</small></p><ul>' + t.f.map((x) => '<li>' + x + '</li>').join('') + '</ul><a class="btn btn-s" href="' + esc(mailto('Plan ' + t.n + ' · CAPRA Society', 'Hola, me interesa el plan ' + t.n + ' (' + t.p + ' USD al mes) y quiero suscribirme.\n\nNombre:\nEmpresa:\n')) + '"><span class="btn-l">Suscríbete</span><span class="btn-b"><svg><use href="#arrow"/></svg></span></a></article>').join('');
}
function renderChat() {
  const D = DAYS.firmar, b = D && D.top.slice().sort((a, c) => a.day - c.day)[0];
  const best = b ? fmt(b.day + 12 * 36e5, { weekday: 'long', day: 'numeric', month: 'long' }, D.p.tz) + (b.best ? ', de ' + hm(b.best.start, D.p.tz) + ' a ' + hm(b.best.end, D.p.tz) : '') : 'esta semana';
  const L = MAIVEN.demo;
  $('#chat').innerHTML =
    '<div class="msg me">' + esc(L[0].me) + '</div>' +
    '<div class="msg ai"><small>Maiven</small>' + esc(L[1].ai) + '<ul>' + L[1].list.map(([k, t, a]) => '<li><b>' + k + '</b><span>' + esc(t) + '<em>' + a + '</em></span></li>').join('') + '</ul></div>' +
    '<div class="msg me">' + esc(L[2].me) + '</div>' +
    '<div class="msg ai"><small>Maiven</small><span class="d">' + esc(best.charAt(0).toUpperCase() + best.slice(1)) + '</span>. Evita la semana del eclipse. Te aviso un día antes.<span class="why">' + esc(L[3].why) + '</span></div>';
  if (chatShown) $$('#chat .msg').forEach((m) => m.classList.add('on'));
}
let chatShown = false;

/* ---------- teléfono: capturas de la app que cambian solas ---------- */
function phone() {
  const ph = $('#phone'); if (!ph) return;
  const imgs = $$('#phoneIn img'), tabs = $$('#phTabs button'); let k = 0, timer = 0;
  const show = (i) => { k = (i + imgs.length) % imgs.length; imgs.forEach((im, j) => im.classList.toggle('on', j === k)); tabs.forEach((t, j) => t.setAttribute('aria-selected', String(j === k))); };
  const auto = () => { clearInterval(timer); if (!RM) timer = setInterval(() => show(k + 1), 4200); };
  tabs.forEach((t, j) => t.addEventListener('click', () => { show(j); auto(); }));
  if ('IntersectionObserver' in window) new IntersectionObserver((es) => { if (es[0].isIntersecting) auto(); else clearInterval(timer); }).observe(ph);
  if (!matchMedia('(pointer:fine)').matches) return;
  ph.addEventListener('pointermove', (e) => { const r = ph.getBoundingClientRect(); ph.style.setProperty('--ry', ((e.clientX - r.left) / r.width - 0.5) * 10 + 'deg'); ph.style.setProperty('--rx', (0.5 - (e.clientY - r.top) / r.height) * 8 + 'deg'); });
  ph.addEventListener('pointerleave', () => { ph.style.removeProperty('--ry'); ph.style.removeProperty('--rx'); });
}

/* ---------- scroll: escenas y cámara ---------- */
const scenes = $$('.scene');
const prog = (el) => { const r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, el.offsetHeight - innerHeight)); };
function onScroll() {
  $('#nav').classList.toggle('solid', scrollY > 40);
  let pm = 0, pc = 0, ps = 0;
  scenes.forEach((s) => {
    const p = prog(s); s.style.setProperty('--p', p.toFixed(4));
    if (s.dataset.scene === 'manifiesto') { pm = p; const n = Math.round(clamp((p - 0.05) / 0.7) * words.length); words.forEach((w, i) => w.classList.toggle('on', i < n)); $$('.layers span').forEach((x, i) => x.classList.toggle('on', p > 0.78 + i * 0.06)); }
    if (s.dataset.scene === 'cielo') ps = p;
  });
  const ch = $('#chat'); if (!chatShown && ch.getBoundingClientRect().top < innerHeight * 0.7) { chatShown = true; $$('.msg', ch).forEach((m, i) => setTimeout(() => m.classList.add('on'), RM ? 0 : i * 650)); }
  if (!OBS) return;
  const S = OBS.state, mob = MOB(), vh = innerHeight;
  const hero = { goatX: mob ? 0.1 : 3.35, goatY: mob ? 2.45 : 0.1, goatZ: 0, goatS: mob ? 0.46 : 0.94, goatFade: 1, artFade: 1, camX: 0, camY: 0, camZ: 9, lookX: mob ? 0 : 1.15, lookY: mob ? 0.7 : 0, lookZ: 0, sky: 0 };
  const man = Object.assign({}, hero, { goatY: hero.goatY + 1.2, goatFade: 0, artFade: 0, camZ: 9.6, lookX: 0, lookY: 0 });
  const when = Object.assign({}, man);
  const skyS = { goatX: -2.2, goatY: 0.4, goatZ: 0, goatS: 1, goatFade: 0, artFade: 0, camX: 0, camY: mob ? 2.8 : 2, camZ: mob ? 5 : 3.2, lookX: 0, lookY: -1.2, lookZ: -9, sky: 1 };
  const after = Object.assign({}, skyS, { sky: 0.28 });
  const foot = { goatX: 0, goatY: mob ? 1.7 : 1.4, goatZ: 0, goatS: mob ? 0.42 : 0.62, goatFade: 1, artFade: 0.55, camX: 0, camY: 0, camZ: 9, lookX: 0, lookY: 0.4, lookZ: 0, sky: 0 };
  const sec = (id) => $(id), y = scrollY;
  const mT = sec('#metodo').offsetTop, cT = sec('#fechas').offsetTop, sT = sec('#cielo').offsetTop, sH = sec('#cielo').offsetHeight, fT = sec('#foot').offsetTop;
  let a, b, t;
  if (y < mT) { a = hero; b = man; t = clamp((y - (mT - vh * 0.85)) / (vh * 0.7)); }
  else if (y < sT - vh) { a = man; b = man; t = 0; }
  else if (y < sT) { a = when; b = skyS; t = clamp((y - (sT - vh)) / vh); }
  else if (y < sT + sH - vh) { a = skyS; b = skyS; t = 0; }
  else if (y < fT - vh) { a = skyS; b = after; t = clamp((y - (sT + sH - vh)) / (vh * 0.8)); }
  else { a = after; b = foot; t = clamp((y - (fT - vh)) / (vh * 0.9)); }
  const e = ease(t); for (const k in hero) S[k] = lerp(a[k], b[k], e);
  S.skyRot = ps * 0.8;
  S._scrollReveal = y > fT - vh * 1.2 ? 1 : 0;
  const dim = y > sT + sH - vh && y < fT - vh * 0.6 ? 0.55 : 1;
  document.documentElement.style.setProperty('--glo', dim);
}
let ticking = false;
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; onScroll(); }); } }, { passive: true });
addEventListener('resize', onScroll);

/* luz que sigue al cursor */
if (!RM && matchMedia('(pointer:fine)').matches) addEventListener('pointermove', (e) => { const lc = $('#lc'); lc.style.setProperty('--cx', e.clientX + 'px'); lc.style.setProperty('--cy', e.clientY + 'px'); }, { passive: true });

/* aparición */
function reveals() {
  $$('.panel .kick, .panel .h2, .panel .lead, .sform, .term, .feats, .areas, .qa, .count, .launch-c').forEach((x) => x.classList.add('rv'));
  if (RM || !('IntersectionObserver' in window)) { $$('.rv').forEach((x) => x.classList.add('in')); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
  $$('.rv').forEach((x) => io.observe(x));
}

/* arranque */
if (!A) { document.body.classList.add('ready'); intro.classList.add('skip'); bindMail(); }
else {
  const delay = runIntro();
  computeDays(); hud(); setInterval(hud, 1000); setInterval(skyNow, 60000);
  renderStatic(); renderChat(); bindScanner(); phone(); renderActs(); renderCal(); bindCal(); skyNow(); reveals(); onScroll();
  bindMail(); const yr = $('#yr'); if (yr) yr.textContent = Math.max(2026, new Date().getFullYear());
  init3d(delay);
}
