/* ============================================================
   Capra · motor de cálculo
   Efemérides reales con astronomy-engine (MIT, Don Cross), en el navegador.
   Zodiaco tropical, casas Plácidus (Porfirio por encima de 66°), Nodo medio.
   Todo se calcula en UTC; las horas se muestran en la zona de la ciudad elegida.
   ============================================================ */
(function () {
  'use strict';
  const A = window.Astronomy;
  const BODIES = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const TRANSITING = ['Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const SLOW = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const RX_BODIES = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const NATAL_TARGETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'ASC', 'MC', 'Node'];
  const CHALDEAN = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
  const WEEK_RULER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const ASPECTS = [
    { k: 'conj', a: 0, orb: 8, g: '☌', n: 'Conjunción' },
    { k: 'sext', a: 60, orb: 4, g: '⚹', n: 'Sextil' },
    { k: 'sq', a: 90, orb: 6, g: '□', n: 'Cuadratura' },
    { k: 'tri', a: 120, orb: 6, g: '△', n: 'Trígono' },
    { k: 'opp', a: 180, orb: 8, g: '☍', n: 'Oposición' },
  ];
  const T_ORB = { Sun: 1.5, Mercury: 1.5, Venus: 1.5, Mars: 2, Jupiter: 2.5, Saturn: 2.5, Uranus: 2, Neptune: 2, Pluto: 2 };
  const WEIGHT = { Sun: .8, Moon: .6, Mercury: .85, Venus: .9, Mars: .9, Jupiter: 1.2, Saturn: 1.25, Uranus: 1, Neptune: .95, Pluto: 1.05 };
  const DAY = 864e5, HOUR = 36e5, rad = Math.PI / 180, deg = 180 / Math.PI;
  const norm = (x) => ((x % 360) + 360) % 360;
  const wrap180 = (x) => { x = norm(x); return x > 180 ? x - 360 : x; };
  const sep = (a, b) => Math.abs(wrap180(a - b));
  const signOf = (lon) => Math.floor(norm(lon) / 30);
  const ELEMENT = ['fuego', 'tierra', 'aire', 'agua'];
  const elementOf = (sign) => ELEMENT[sign % 4];
  const MODALITY = ['cardinal', 'fijo', 'mutable'];
  const modalityOf = (sign) => MODALITY[sign % 3];

  /* ---------- zonas horarias ---------- */
  const FMT = new Map();
  function tzParts(ts, tz) {
    let f = FMT.get(tz);
    if (!f) { f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short' }); FMT.set(tz, f); }
    const o = {};
    f.formatToParts(new Date(ts)).forEach((p) => { o[p.type] = p.value; });
    return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour % 24, mi: +o.minute, s: +o.second, wd: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday) };
  }
  function tzOffset(ts, tz) { const p = tzParts(ts, tz); return Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s) - Math.floor(ts / 1000) * 1000; }
  function zonedToUtc(y, m, d, hh, mm, tz) {
    const guess = Date.UTC(y, m - 1, d, hh, mm);
    let ts = guess - tzOffset(guess, tz);
    ts = guess - tzOffset(ts, tz);
    return new Date(ts);
  }
  function dayKey(ts, tz) { const p = tzParts(ts, tz); return p.y + '-' + String(p.m).padStart(2, '0') + '-' + String(p.d).padStart(2, '0'); }
  function startOfDay(ts, tz) { const p = tzParts(ts, tz); return zonedToUtc(p.y, p.m, p.d, 0, 0, tz); }

  /* ---------- posiciones ---------- */
  function lonAt(body, date) {
    const t = A.MakeTime(date);
    if (body === 'Moon') return norm(A.EclipticGeoMoon(t).lon);
    if (body === 'Sun') return norm(A.SunPosition(t).elon);
    if (body === 'Node') return meanNode(date);
    return norm(A.Ecliptic(A.GeoVector(body, t, true)).elon);
  }
  function speedAt(body, date) {
    if (body === 'Node') return -0.053;
    const a = new Date(+date - 6 * HOUR), b = new Date(+date + 6 * HOUR);
    return wrap180(lonAt(body, b) - lonAt(body, a)) * 2;
  }
  function meanNode(date) {
    const T = A.MakeTime(date).tt / 36525;
    return norm(125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000);
  }

  /* ---------- ángulos y casas ---------- */
  function angles(date, lat, lon) {
    const t = A.MakeTime(date);
    const eps = A.e_tilt(t).tobl * rad;
    const ramc = norm(A.SiderealTime(t) * 15 + lon);
    const r = ramc * rad, phi = lat * rad;
    const mc = norm(Math.atan2(Math.sin(r), Math.cos(r) * Math.cos(eps)) * deg);
    const asc = norm(Math.atan2(Math.cos(r), -(Math.sin(r) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))) * deg);
    return { ramc, eps, phi, mc, asc };
  }
  const raToLon = (ra, eps) => norm(Math.atan2(Math.sin(ra * rad), Math.cos(ra * rad) * Math.cos(eps)) * deg);
  function porphyry(g) {
    const c = new Array(12);
    c[0] = g.asc; c[9] = g.mc; c[3] = norm(g.mc + 180); c[6] = norm(g.asc + 180);
    const q1 = norm(g.asc - g.mc), q2 = norm(c[3] - g.asc);
    c[10] = norm(g.mc + q1 / 3); c[11] = norm(g.mc + 2 * q1 / 3);
    c[1] = norm(g.asc + q2 / 3); c[2] = norm(g.asc + 2 * q2 / 3);
    c[4] = norm(c[10] + 180); c[5] = norm(c[11] + 180); c[7] = norm(c[1] + 180); c[8] = norm(c[2] + 180);
    return { cusps: c, system: 'Porfirio' };
  }
  function placidus(g) {
    if (Math.abs(g.phi * deg) > 66) return porphyry(g);
    const cusp = (f, below) => {
      let ra = below ? g.ramc + 180 - f * 90 : g.ramc + f * 90;
      for (let i = 0; i < 40; i++) {
        const lon = raToLon(ra, g.eps);
        const dec = Math.asin(Math.sin(g.eps) * Math.sin(lon * rad));
        const x = Math.tan(dec) * Math.tan(g.phi);
        if (Math.abs(x) >= 1) return null;
        const ad = Math.asin(x) * deg;
        const nra = below ? g.ramc + 180 - f * (90 - ad) : g.ramc + f * (90 + ad);
        const done = Math.abs(wrap180(nra - ra)) < 1e-7;
        ra = nra;
        if (done) break;
      }
      return raToLon(ra, g.eps);
    };
    const c = new Array(12);
    c[0] = g.asc; c[9] = g.mc;
    c[10] = cusp(1 / 3, false); c[11] = cusp(2 / 3, false); c[1] = cusp(2 / 3, true); c[2] = cusp(1 / 3, true);
    if ([c[10], c[11], c[1], c[2]].some((v) => v == null)) return porphyry(g);
    c[3] = norm(c[9] + 180); c[4] = norm(c[10] + 180); c[5] = norm(c[11] + 180);
    c[6] = norm(c[0] + 180); c[7] = norm(c[1] + 180); c[8] = norm(c[2] + 180);
    return { cusps: c, system: 'Plácidus' };
  }
  function houseOf(lon, cusps) {
    for (let i = 0; i < 12; i++) {
      const a = cusps[i], b = cusps[(i + 1) % 12];
      if (norm(lon - a) < norm(b - a)) return i + 1;
    }
    return 1;
  }

  /* ---------- aspectos ---------- */
  function aspectBetween(a, b, orbScale) {
    const d = sep(a, b);
    let best = null;
    for (const asp of ASPECTS) {
      const off = Math.abs(d - asp.a), orb = asp.orb * (orbScale || 1);
      if (off <= orb && (!best || off < best.off)) best = { ...asp, off, orb };
    }
    return best;
  }
  function natalAspects(pts) {
    const list = [], use = pts.filter((p) => p.k !== 'Node');
    for (let i = 0; i < use.length; i++) for (let j = i + 1; j < use.length; j++) {
      const p = use[i], q = use[j];
      if ((p.k === 'ASC' && q.k === 'MC') || (p.k === 'MC' && q.k === 'ASC')) continue;
      const lum = ['Sun', 'Moon'].includes(p.k) || ['Sun', 'Moon'].includes(q.k);
      const asp = aspectBetween(p.lon, q.lon, lum ? 1.15 : 0.9);
      if (asp) list.push({ a: p.k, b: q.k, asp, off: asp.off });
    }
    return list.sort((x, y) => x.off - y.off);
  }

  /* ---------- carta ---------- */
  function chart(date, place, timeKnown) {
    const pts = BODIES.map((k) => ({ k, lon: lonAt(k, date), spd: speedAt(k, date) }));
    pts.forEach((p) => { p.rx = !['Sun', 'Moon'].includes(p.k) && p.spd < 0; });
    pts.push({ k: 'Node', lon: meanNode(date), spd: -0.053, rx: true });
    const g = angles(date, place.lat, place.lon);
    const hs = placidus(g);
    pts.push({ k: 'ASC', lon: g.asc }, { k: 'MC', lon: g.mc });
    pts.forEach((p) => { p.sign = signOf(p.lon); p.deg = norm(p.lon) % 30; p.house = houseOf(p.lon, hs.cusps); });
    const by = {}; pts.forEach((p) => { by[p.k] = p; });
    const usable = pts.filter((p) => timeKnown || !['ASC', 'MC'].includes(p.k));
    return { date, place, timeKnown, pts, by, cusps: hs.cusps, houseSystem: hs.system, aspects: natalAspects(usable), elements: elementBalance(by, timeKnown) };
  }
  function elementBalance(by, timeKnown) {
    const w = { Sun: 2, Moon: 2, ASC: 2, Mercury: 1, Venus: 1, Mars: 1, Jupiter: 1, Saturn: 1, MC: 1 };
    const el = { fuego: 0, tierra: 0, aire: 0, agua: 0 }, mo = { cardinal: 0, fijo: 0, mutable: 0 };
    let total = 0;
    for (const k in w) {
      if (!timeKnown && (k === 'ASC' || k === 'MC')) continue;
      const s = by[k].sign; el[elementOf(s)] += w[k]; mo[modalityOf(s)] += w[k]; total += w[k];
    }
    const dom = Object.keys(el).sort((a, b) => el[b] - el[a])[0];
    const domMod = Object.keys(mo).sort((a, b) => mo[b] - mo[a])[0];
    const count = {}; Object.keys(el).forEach((k) => { count[k] = 0; });
    BODIES.forEach((k) => { count[elementOf(by[k].sign)]++; });
    return { el, mo, total, dom, domMod, count };
  }

  /* ---------- tabla diaria de efemérides (12:00 UTC) ---------- */
  const Eph = { t0: 0, n: 0, lon: {} };
  function ensureEphem(from, to) {
    const t0 = Date.UTC(new Date(from).getUTCFullYear(), new Date(from).getUTCMonth(), new Date(from).getUTCDate(), 12);
    const n = Math.ceil((to - t0) / DAY) + 2;
    if (Eph.n && t0 >= Eph.t0 && t0 + n * DAY <= Eph.t0 + Eph.n * DAY) return;
    Eph.t0 = t0; Eph.n = n; Eph.lon = {};
    for (const b of TRANSITING) {
      const arr = new Float64Array(n);
      for (let i = 0; i < n; i++) arr[i] = lonAt(b, new Date(t0 + i * DAY));
      Eph.lon[b] = arr;
    }
  }
  function lonT(body, ts) {
    const x = (ts - Eph.t0) / DAY;
    const i = Math.floor(x);
    const arr = Eph.lon[body];
    if (!arr || i < 0 || i >= Eph.n - 1) return lonAt(body, new Date(ts));
    const a = arr[i], b = arr[i + 1];
    return norm(a + wrap180(b - a) * (x - i));
  }
  function spdT(body, ts) { return wrap180(lonT(body, ts + DAY / 2) - lonT(body, ts - DAY / 2)); }

  function refineMin(fn, lo, hi) {
    const gr = (Math.sqrt(5) - 1) / 2;
    let a = lo, b = hi, c = b - gr * (b - a), d = a + gr * (b - a);
    for (let i = 0; i < 28; i++) {
      if (fn(c) < fn(d)) b = d; else a = c;
      c = b - gr * (b - a); d = a + gr * (b - a);
    }
    return (a + b) / 2;
  }
  function bisect(fn, lo, hi, it) {
    let flo = fn(lo);
    for (let i = 0; i < (it || 30); i++) {
      const mid = (lo + hi) / 2, fm = fn(mid);
      if ((fm > 0) === (flo > 0)) { lo = mid; flo = fm; } else hi = mid;
    }
    return (lo + hi) / 2;
  }

  /* ---------- tránsitos sobre la carta ---------- */
  function classify(P, asp, N, rx) {
    const soft = asp.k === 'tri' || asp.k === 'sext', hard = asp.k === 'sq' || asp.k === 'opp', conj = asp.k === 'conj';
    const key = ['Sun', 'Moon', 'ASC', 'MC'].includes(N);
    if (P === 'Jupiter') return hard ? 'ATENCIÓN' : 'OPORTUNIDAD';
    if (P === 'Venus') return hard ? 'ATENCIÓN' : (rx ? 'REVISAR' : 'OPORTUNIDAD');
    if (P === 'Saturn') return hard || conj ? (key ? 'CRÍTICO' : 'ATENCIÓN') : 'ESTRUCTURA';
    if (P === 'Mars') return hard || conj ? 'ATENCIÓN' : 'IMPULSO';
    if (P === 'Uranus' || P === 'Neptune' || P === 'Pluto') return (hard || conj) && key ? 'CRÍTICO' : 'TRANSFORMACIÓN';
    if (P === 'Mercury') return rx ? 'REVISAR' : (hard ? 'ATENCIÓN' : 'OPORTUNIDAD');
    return hard ? 'ATENCIÓN' : 'OPORTUNIDAD';
  }
  function transitsAt(natal, ts, opts) {
    opts = opts || {};
    const list = [];
    const targets = NATAL_TARGETS.filter((k) => natal.timeKnown || !['ASC', 'MC'].includes(k));
    for (const P of opts.planets || TRANSITING) {
      const lp = lonT(P, ts);
      for (const N of targets) {
        const ln = natal.by[N].lon;
        const d = sep(lp, ln);
        for (const asp of ASPECTS) {
          const orb = T_ORB[P] * (opts.orbScale || 1);
          const off = Math.abs(d - asp.a);
          if (off > orb) continue;
          if (opts.light) {
            list.push({ P, N, asp, off, orb, rx: spdT(P, ts) < 0, cls: classify(P, asp, N, spdT(P, ts) < 0), closeness: 1 - off / orb });
            continue;
          }
          const g = (t) => Math.abs(sep(lonT(P, t), ln) - asp.a);
          const step = SLOW.includes(P) ? DAY : DAY / 2, maxSpan = SLOW.includes(P) ? 520 * DAY : 60 * DAY;
          let s = ts; while (ts - s < maxSpan && g(s - step) <= orb) s -= step;
          let e = ts; while (e - ts < maxSpan && g(e + step) <= orb) e += step;
          const exact = [];
          for (let t = s; t <= e; t += step) {
            const v = g(t);
            if (v <= g(t - step) && v < g(t + step) && v < 0.6) {
              const tt = refineMin((x) => Math.abs(sep(lonAt(P, new Date(x)), ln) - asp.a), t - step, t + step);
              if (!exact.some((x) => Math.abs(x - tt) < 2 * DAY)) exact.push(tt);
            }
          }
          const rx = spdT(P, ts) < 0;
          const applying = g(ts + HOUR * 6) < off;
          const closeness = 1 - off / orb;
          const intensity = Math.max(1, Math.min(5, Math.round((WEIGHT[P] * (0.55 + 0.45 * closeness) * (['Sun', 'Moon', 'ASC', 'MC'].includes(N) ? 1.15 : 0.95)) * 4.2)));
          list.push({ P, N, asp, off, orb, start: s, end: e, exact, rx, applying, cls: classify(P, asp, N, rx), intensity, closeness });
        }
      }
    }
    return list.sort((a, b) => (b.intensity - a.intensity) || (a.off - b.off));
  }

  /* ---------- retrogradaciones, ingresos, lunaciones, eclipses ---------- */
  function retroPeriods(from, to) {
    const out = [];
    for (const P of RX_BODIES) {
      let t = from - 160 * DAY, prev = spdT(P, t), start = prev < 0 ? null : undefined;
      if (prev < 0) start = t;
      for (t += DAY; t <= to + 160 * DAY; t += DAY) {
        const v = spdT(P, t);
        if (prev >= 0 && v < 0) start = bisect((x) => speedAt(P, new Date(x)), t - DAY, t, 22);
        if (prev < 0 && v >= 0 && start !== undefined) {
          const end = bisect((x) => speedAt(P, new Date(x)), t - DAY, t, 22);
          if (start !== null && end >= from && start <= to) out.push({ P, start, end, lonStart: lonAt(P, new Date(start)), lonEnd: lonAt(P, new Date(end)) });
          start = undefined;
        }
        prev = v;
      }
      if (start !== undefined && start !== null && start <= to) out.push({ P, start, end: null, lonStart: lonAt(P, new Date(start)) });
    }
    return out.sort((a, b) => a.start - b.start);
  }
  function retroNow(ts) { return RX_BODIES.filter((P) => spdT(P, ts) < 0); }
  function ingresses(from, to, planets) {
    const out = [];
    for (const P of planets) {
      let prev = signOf(lonT(P, from));
      for (let t = from + DAY; t <= to; t += DAY) {
        const s = signOf(lonT(P, t));
        if (s !== prev) {
          const target = s, tt = bisect((x) => (signOf(lonAt(P, new Date(x))) === target ? 1 : -1), t - DAY, t, 24);
          out.push({ P, t: tt, sign: s, from: prev, rx: spdT(P, t) < 0 });
          prev = s;
        }
      }
    }
    return out.sort((a, b) => a.t - b.t);
  }
  function lunations(from, to) {
    const out = [];
    for (const [ph, name] of [[0, 'nueva'], [180, 'llena']]) {
      let t = A.MakeTime(new Date(from));
      for (let i = 0; i < 20; i++) {
        const r = A.SearchMoonPhase(ph, t, 40);
        if (!r || +r.date > to) break;
        out.push({ kind: name, t: +r.date, sign: signOf(lonAt('Moon', r.date)), lon: lonAt('Moon', r.date) });
        t = r.AddDays(5);
      }
    }
    return out.sort((a, b) => a.t - b.t);
  }
  function eclipses(from, to) {
    const out = [];
    let e = A.SearchLunarEclipse(new Date(from));
    for (let i = 0; i < 8 && +e.peak.date <= to; i++) { out.push({ type: 'lunar', kind: e.kind, t: +e.peak.date, sign: signOf(lonAt('Moon', e.peak.date)) }); e = A.NextLunarEclipse(e.peak); }
    let s = A.SearchGlobalSolarEclipse(new Date(from));
    for (let i = 0; i < 8 && +s.peak.date <= to; i++) { out.push({ type: 'solar', kind: s.kind, t: +s.peak.date, sign: signOf(lonAt('Sun', s.peak.date)) }); s = A.NextGlobalSolarEclipse(s.peak); }
    return out.sort((a, b) => a.t - b.t);
  }

  /* ---------- Luna: fase, ingresos y fuera de curso ---------- */
  function moonInfo(ts) {
    const t = A.MakeTime(new Date(ts));
    const phase = A.MoonPhase(t);
    const ill = A.Illumination('Moon', t).phase_fraction;
    const lon = lonAt('Moon', new Date(ts));
    const idx = phase < 10 || phase >= 350 ? 0 : phase < 80 ? 1 : phase < 100 ? 2 : phase < 170 ? 3 : phase < 190 ? 4 : phase < 260 ? 5 : phase < 280 ? 6 : 7;
    return { phase, ill, lon, sign: signOf(lon), deg: lon % 30, phaseIdx: idx, waxing: phase < 180 };
  }
  /* Luna fuera de curso: desde su último aspecto mayor (Sol a Plutón) hasta que cambia de signo.
     Se calcula una sola vez sobre una malla de 2 h y se guarda; las consultas filtran la lista. */
  const VOC = { from: 0, to: 0, list: [] };
  function computeVoc(start, end) {
    const STEP = 2 * HOUR, n = Math.ceil((end - start) / STEP) + 1;
    const ml = new Float64Array(n);
    for (let i = 0; i < n; i++) ml[i] = lonAt('Moon', new Date(start + i * STEP));
    const ing = [];
    for (let i = 1; i < n; i++) {
      const s = signOf(ml[i]);
      if (s !== signOf(ml[i - 1])) {
        const tt = bisect((x) => (signOf(lonAt('Moon', new Date(x))) === s ? 1 : -1), start + (i - 1) * STEP, start + i * STEP, 16);
        ing.push({ t: tt, sign: s, i });
      }
    }
    const planets = ['Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    const targets = [0, 60, -60, 90, -90, 120, -120, 180];
    const out = [];
    for (let k = 1; k < ing.length; k++) {
      const a = ing[k - 1].t, b = ing[k].t, i0 = ing[k - 1].i - 1, i1 = ing[k].i;
      let last = null;
      for (const P of planets) {
        const pl = []; for (let i = i0; i <= i1; i++) pl.push(lonT(P, start + i * STEP));
        for (const tg of targets) {
          for (let i = i0 + 1; i <= i1; i++) {
            const pv = wrap180(ml[i - 1] - pl[i - 1 - i0] - tg), v = wrap180(ml[i] - pl[i - i0] - tg);
            if (pv <= 0 && v > 0 && v - pv < 90) {
              const f = (x) => wrap180(lonAt('Moon', new Date(x)) - lonT(P, x) - tg);
              const tt = bisect(f, start + (i - 1) * STEP, start + i * STEP, 16);
              if (tt > a - 1 && tt <= b && (!last || tt > last.t)) last = { t: tt, P, asp: ASPECTS.find((x) => x.a === Math.abs(tg)) };
            }
          }
        }
      }
      out.push({ start: last ? last.t : a, end: b, nextSign: ing[k].sign, last });
    }
    return out;
  }
  function voidPeriods(from, to) {
    if (!(VOC.list.length && from >= VOC.from && to <= VOC.to)) {
      const s = Math.min(from, VOC.list.length ? VOC.from : from) - 3.2 * DAY;
      const e = Math.max(to, VOC.list.length ? VOC.to : to) + 3 * DAY;
      VOC.list = computeVoc(s, e); VOC.from = s + 3.2 * DAY; VOC.to = e - 3 * DAY;
    }
    return VOC.list.filter((v) => v.end >= from && v.start <= to);
  }
  function exactHits(natal, from, to, planets) {
    const out = [];
    const targets = NATAL_TARGETS.filter((k) => natal.timeKnown || !['ASC', 'MC'].includes(k));
    for (const P of planets) for (const N of targets) {
      const ln = natal.by[N].lon;
      for (const asp of ASPECTS) {
        const g = (t) => Math.abs(sep(lonT(P, t), ln) - asp.a);
        for (let t = from; t <= to; t += DAY) {
          const v = g(t);
          if (v < 0.8 && v <= g(t - DAY) && v < g(t + DAY)) {
            const tt = refineMin((x) => Math.abs(sep(lonAt(P, new Date(x)), ln) - asp.a), t - DAY, t + DAY);
            if (tt >= from && tt <= to) out.push({ P, N, asp, t: tt, rx: spdT(P, tt) < 0, cls: classify(P, asp, N, spdT(P, tt) < 0) });
          }
        }
      }
    }
    return out.sort((a, b) => a.t - b.t);
  }

  /* ---------- horas planetarias ---------- */
  function planetaryHours(ts, place) {
    const obs = new A.Observer(place.lat, place.lon, 0);
    let sr = A.SearchRiseSet('Sun', obs, +1, A.MakeTime(new Date(ts - 1.6 * DAY)), 2);
    if (!sr) return null;
    let next = A.SearchRiseSet('Sun', obs, +1, sr.AddDays(0.05), 2);
    while (next && +next.date <= ts) { sr = next; next = A.SearchRiseSet('Sun', obs, +1, sr.AddDays(0.05), 2); }
    const ss = A.SearchRiseSet('Sun', obs, -1, sr, 1);
    if (!next || !ss) return null;
    const rise = +sr.date, set = +ss.date, nrise = +next.date;
    const wd = tzParts(rise, place.tz).wd;
    const dayRuler = WEEK_RULER[wd];
    const i0 = CHALDEAN.indexOf(dayRuler);
    const dl = (set - rise) / 12, nl = (nrise - set) / 12;
    const hours = [];
    for (let i = 0; i < 24; i++) {
      const s = i < 12 ? rise + i * dl : set + (i - 12) * nl;
      hours.push({ i, start: s, end: s + (i < 12 ? dl : nl), ruler: CHALDEAN[(i0 + i) % 7], day: i < 12 });
    }
    return { rise, set, nrise, dayRuler, wd, hours, current: hours.find((h) => ts >= h.start && ts < h.end) || null };
  }

  /* ---------- semáforo por área (tránsitos de hoy sobre la carta) ---------- */
  const AREAS = [
    { k: 'ventas', n: 'Ventas', pts: ['Venus', 'Jupiter', 'MC'], houses: [7, 10] },
    { k: 'producto', n: 'Producto', pts: ['Mercury', 'Mars', 'Sun'], houses: [5] },
    { k: 'operaciones', n: 'Operaciones', pts: ['Saturn', 'Moon'], houses: [6] },
    { k: 'finanzas', n: 'Finanzas', pts: ['Venus', 'Jupiter'], houses: [2, 8] },
    { k: 'talento', n: 'Talento', pts: ['Moon', 'Saturn'], houses: [6, 11] },
    { k: 'comms', n: 'Comunicación', pts: ['Mercury', 'ASC'], houses: [3] },
  ];
  function aspectValue(P, asp) {
    const benefic = P === 'Jupiter' || P === 'Venus', malefic = P === 'Saturn' || P === 'Mars';
    if (asp.k === 'tri') return 10; if (asp.k === 'sext') return 7;
    if (asp.k === 'conj') return benefic ? 11 : malefic ? -7 : P === 'Moon' ? 3 : 2;
    if (asp.k === 'sq') return benefic ? -3 : -9;
    return benefic ? -2 : -8;
  }
  /* las 6 dimensiones del líder: mismo motor, otros puntos y casas */
  const LEADER = [
    { k: 'liderazgo', n: 'Liderazgo', pts: ['Sun', 'MC'], houses: [1, 10] },
    { k: 'decision', n: 'Decisiones', pts: ['Mercury', 'Saturn'], houses: [3, 9] },
    { k: 'negociacion', n: 'Negociación', pts: ['Venus', 'Jupiter'], houses: [2, 7] },
    { k: 'energia', n: 'Energía', pts: ['Mars', 'Sun'], houses: [1, 6] },
    { k: 'equipo', n: 'Equipo', pts: ['Moon', 'Venus'], houses: [4, 11] },
    { k: 'vision', n: 'Visión', pts: ['Jupiter', 'Node'], houses: [9, 12] },
  ];
  function areaScores(natal, ts, defs) {
    const tr = transitsAt(natal, ts, { orbScale: 1.2, light: true });
    const moon = moonInfo(ts);
    const rx = retroNow(ts);
    const voc = voidPeriods(ts - HOUR, ts + HOUR).some((v) => ts >= v.start && ts < v.end);
    const moonAsp = [];
    NATAL_TARGETS.filter((k) => natal.timeKnown || !['ASC', 'MC'].includes(k)).forEach((N) => {
      const a = aspectBetween(moon.lon, natal.by[N].lon, 0.7);
      if (a) moonAsp.push({ P: 'Moon', N, asp: a, closeness: 1 - a.off / a.orb });
    });
    return (defs || AREAS).map((ar) => {
      let s = 62; const why = [];
      const inArea = (N) => ar.pts.includes(N) || (natal.timeKnown && ar.houses.includes(natal.by[N].house));
      for (const t of tr.concat(moonAsp)) {
        if (!inArea(t.N)) continue;
        const v = aspectValue(t.P, t.asp) * WEIGHT[t.P] * (0.5 + 0.5 * t.closeness);
        s += v; why.push({ t, v });
      }
      if (rx.includes('Mercury')) { if (ar.k === 'comms') s -= 16; if (ar.k === 'producto') s -= 7; if (ar.k === 'finanzas') s -= 9; if (ar.k === 'ventas') s -= 6; }
      if (rx.includes('Venus')) { if (ar.k === 'ventas' || ar.k === 'finanzas') s -= 10; }
      if (rx.includes('Mars')) { if (ar.k === 'producto') s -= 8; if (ar.k === 'operaciones') s -= 5; }
      if (rx.includes('Mercury')) { if (ar.k === 'decision') s -= 12; if (ar.k === 'negociacion') s -= 6; }
      if (rx.includes('Venus') && ar.k === 'negociacion') s -= 8;
      if (rx.includes('Mars') && ar.k === 'energia') s -= 8;
      if (voc) s -= 5;
      const el = elementOf(moon.sign);
      if (el === 'fuego' && (ar.k === 'ventas' || ar.k === 'producto')) s += 5;
      if (el === 'tierra' && (ar.k === 'operaciones' || ar.k === 'finanzas')) s += 5;
      if (el === 'aire' && (ar.k === 'comms' || ar.k === 'ventas')) s += 5;
      if (el === 'agua' && (ar.k === 'talento')) s += 6;
      if (el === 'fuego' && (ar.k === 'energia' || ar.k === 'liderazgo')) s += 5;
      if (el === 'tierra' && ar.k === 'decision') s += 5;
      if (el === 'aire' && (ar.k === 'negociacion' || ar.k === 'vision')) s += 4;
      if (el === 'agua' && ar.k === 'equipo') s += 6;
      s = Math.max(8, Math.min(97, Math.round(s)));
      why.sort((a, b) => Math.abs(b.v) - Math.abs(a.v));
      return { ...ar, score: s, status: s >= 70 ? 'g' : s >= 50 ? 'a' : 'r', why };
    });
  }

  /* ---------- calendario electoral ---------- */
  const ACTIONS = {
    lanzar: { n: 'Lanzar', verb: 'lanzar', hours: ['Sun', 'Jupiter', 'Mars'], signs: [0, 4, 8, 1, 9], rx: { Mercury: -26, Venus: -14, Mars: -20 }, waxing: 12 },
    firmar: { n: 'Firmar', verb: 'firmar', hours: ['Jupiter', 'Saturn', 'Mercury'], signs: [1, 9, 6, 5], rx: { Mercury: -48, Venus: -8, Mars: -8 }, waxing: 6 },
    contratar: { n: 'Contratar', verb: 'contratar', hours: ['Saturn', 'Mercury', 'Jupiter'], signs: [5, 9, 1, 3], rx: { Mercury: -14, Mars: -8 }, waxing: 6 },
    invertir: { n: 'Invertir', verb: 'invertir', hours: ['Jupiter', 'Venus'], signs: [1, 9, 3, 7], rx: { Mercury: -16, Venus: -24 }, waxing: 8 },
    negociar: { n: 'Negociar', verb: 'negociar', hours: ['Venus', 'Jupiter', 'Mercury'], signs: [6, 1, 4, 2], rx: { Mercury: -22, Venus: -16, Mars: -10 }, waxing: 5 },
    comunicar: { n: 'Comunicar', verb: 'comunicar', hours: ['Mercury', 'Venus', 'Sun'], signs: [2, 6, 8, 10], rx: { Mercury: -28 }, waxing: 6 },
  };
  let ECL = null;
  function electionalDay(natal, action, dayStart, place, ctx) {
    const cfg = ACTIONS[action];
    const noon = +dayStart + 13 * HOUR;
    const reasons = [];
    let s = 56;
    const rx = retroNow(noon);
    for (const P in cfg.rx) if (rx.includes(P)) { s += cfg.rx[P]; reasons.push({ ok: false, t: PL(P) + ' retrógrado' + (P === 'Mercury' && action === 'firmar' ? ': no firmar' : '') }); }
    for (const P of ['Mercury', 'Venus', 'Mars']) {
      const sp = Math.abs(spdT(P, noon)), norm = { Mercury: 1.2, Venus: 1.1, Mars: 0.6 }[P];
      if (sp < norm * 0.12 && cfg.rx[P]) { s -= 8; reasons.push({ ok: false, t: PL(P) + ' estacionario' }); }
    }
    const m = moonInfo(noon);
    if (m.phase < 12) { if (action === 'lanzar') s -= 4; reasons.push({ ok: null, t: 'Luna nueva: siembra la intención y lanza 1–2 días después' }); }
    else if (m.waxing) { s += cfg.waxing; reasons.push({ ok: true, t: 'Luna creciente (' + Math.round(m.ill * 100) + ' % iluminada)' }); }
    else if (m.phase > 315) { s -= 12; reasons.push({ ok: false, t: 'Luna balsámica: cierre de ciclo' }); }
    else reasons.push({ ok: null, t: 'Luna menguante: mejor revisar que iniciar' });
    if (cfg.signs.includes(m.sign)) { s += 9; reasons.push({ ok: true, t: 'Luna en ' + SIGN(m.sign) + ', a favor de ' + cfg.verb }); }
    const ecl = (ctx.eclipses || []).find((e) => Math.abs(e.t - noon) < 3.5 * DAY);
    if (ecl) { s -= action === 'lanzar' ? 34 : 24; reasons.push({ ok: false, t: 'Eclipse ' + (ecl.type === 'solar' ? 'solar' : 'lunar') + ' cerca: alta volatilidad' }); }
    const tr = transitsAt(natal, noon, { planets: ['Jupiter', 'Venus', 'Saturn', 'Sun'], orbScale: 0.9, light: true });
    for (const t of tr) {
      if (!['Sun', 'MC', 'ASC', 'Venus', 'Jupiter', 'Moon'].includes(t.N)) continue;
      const v = aspectValue(t.P, t.asp) * 0.7;
      s += v;
      if (Math.abs(v) >= 4) reasons.push({ ok: v > 0, t: PL(t.P) + ' ' + t.asp.n.toLowerCase() + ' ' + PL(t.N) + ' natal' });
    }
    const ph = planetaryHours(noon, place);
    const vocs = voidPeriods(+dayStart, +dayStart + DAY);
    const open = +dayStart + 8 * HOUR, close = +dayStart + 20 * HOUR;
    let best = null;
    if (ph) for (const h of ph.hours) {
      if (h.end <= open || h.start >= close) continue;
      const a = Math.max(h.start, open), b = Math.min(h.end, close);
      const inVoc = vocs.some((v) => a < v.end && b > v.start);
      if (inVoc) continue;
      let hs = cfg.hours.includes(h.ruler) ? 10 - cfg.hours.indexOf(h.ruler) * 2 : 0;
      const lh = tzParts((a + b) / 2, place.tz).h;
      if (lh < 9 || lh >= 18) hs -= 3;
      const mm = lonAt('Moon', new Date((a + b) / 2));
      for (const N of ['Sun', 'MC', 'ASC', 'Venus', 'Jupiter']) {
        if (!natal.timeKnown && (N === 'MC' || N === 'ASC')) continue;
        const asp = aspectBetween(mm, natal.by[N].lon, 0.55);
        if (asp) hs += asp.k === 'tri' || asp.k === 'sext' ? 3 : asp.k === 'conj' ? 2 : -3;
      }
      if (!best || hs > best.hs) best = { start: a, end: b, ruler: h.ruler, hs };
    }
    const vocHours = vocs.reduce((acc, v) => acc + Math.max(0, Math.min(v.end, close) - Math.max(v.start, open)), 0) / HOUR;
    if (!best) { s -= 22; reasons.push({ ok: false, t: 'Luna fuera de curso en todo el horario hábil' }); }
    else {
      s += Math.max(-4, Math.min(10, best.hs - 2));
      if (vocHours >= 4) { s -= 6; reasons.push({ ok: false, t: 'Luna fuera de curso ' + Math.round(vocHours) + ' h del horario hábil' }); }
      if (cfg.hours.includes(best.ruler)) reasons.push({ ok: true, t: 'Hora de ' + PL(best.ruler) + ' disponible' });
    }
    const wd = tzParts(noon, place.tz).wd;
    if ((wd === 0 || wd === 6) && action !== 'comunicar') { s -= 8; reasons.push({ ok: null, t: wd === 0 ? 'Domingo' : 'Sábado' }); }
    const veto = (action === 'firmar' && rx.includes('Mercury')) || (ecl && Math.abs(ecl.t - noon) < 1.5 * DAY);
    s = Math.max(4, Math.min(98, Math.round(s)));
    return { day: +dayStart, key: dayKey(noon, place.tz), score: veto ? Math.min(s, 30) : s, veto, best, moon: m, reasons, vocHours };
  }
  function electional(natal, action, from, days, place) {
    ensureEphem(from - 40 * DAY, from + (days + 40) * DAY);
    if (!ECL) ECL = eclipses(from - 30 * DAY, from + 400 * DAY);
    voidPeriods(from - DAY, from + (days + 1) * DAY);
    const out = [];
    let ds = startOfDay(from, place.tz);
    for (let i = 0; i < days; i++) {
      out.push(electionalDay(natal, action, ds, place, { eclipses: ECL }));
      const p = tzParts(+ds + 30 * HOUR, place.tz);
      ds = zonedToUtc(p.y, p.m, p.d, 0, 0, place.tz);
    }
    return out;
  }

  /* ---------- sinastría CEO ↔ empresa ---------- */
  const AXES = [
    { k: 'proposito', n: 'Propósito', a: ['Sun', 'Node'], b: ['MC', 'Sun'] },
    { k: 'identidad', n: 'Identidad', a: ['Sun'], b: ['Sun', 'ASC'] },
    { k: 'expansion', n: 'Expansión', a: ['Jupiter'], b: ['Jupiter', 'MC', 'Sun'] },
    { k: 'estructura', n: 'Estructura', a: ['Saturn'], b: ['Saturn', 'Sun'] },
    { k: 'cultura', n: 'Cultura', a: ['Moon'], b: ['Moon', 'Venus'] },
    { k: 'accion', n: 'Acción', a: ['Mars'], b: ['Mars', 'Sun'] },
    { k: 'imagen', n: 'Imagen', a: ['Venus', 'ASC'], b: ['ASC', 'Venus'] },
    { k: 'valor', n: 'Valor', a: ['Venus'], b: ['Venus', 'Jupiter'] },
  ];
  const SYN_ORB = { conj: 8, opp: 7, tri: 7, sq: 6, sext: 5 };
  function synAspect(a, b) {
    const d = sep(a, b);
    let best = null;
    for (const asp of ASPECTS) { const off = Math.abs(d - asp.a); if (off <= SYN_ORB[asp.k] && (!best || off < best.off)) best = { ...asp, off, orb: SYN_ORB[asp.k] }; }
    return best;
  }
  function synValue(x, y, asp) {
    const hardP = ['Saturn', 'Mars'].includes(x) || ['Saturn', 'Mars'].includes(y);
    const c = 0.5 + 0.5 * (1 - asp.off / asp.orb);
    const base = asp.k === 'conj' ? (hardP ? 6 : 20) : asp.k === 'tri' ? 16 : asp.k === 'sext' ? 11 : asp.k === 'sq' ? -14 : -8;
    return base * c;
  }
  function elementFit(s1, s2) {
    const e1 = s1 % 4, e2 = s2 % 4;
    if (e1 === e2) return 10;
    if ((e1 === 0 && e2 === 2) || (e1 === 2 && e2 === 0) || (e1 === 1 && e2 === 3) || (e1 === 3 && e2 === 1)) return 6;
    if (s1 % 3 === s2 % 3) return -5;
    return 0;
  }
  /* aspectos del cielo de hoy entre planetas en tránsito (para la lectura de ciclos colectivos) */
  function skyAspects(ts) {
    const out = [];
    for (let i = 0; i < BODIES.length; i++) for (let j = i + 1; j < BODIES.length; j++) {
      const a = BODIES[i], b = BODIES[j];
      if (a === 'Moon') continue;
      const asp = aspectBetween(lonT(a, ts), lonT(b, ts), 0.6);
      if (asp) out.push({ a, b, asp, applying: Math.abs(sep(lonT(a, ts + DAY), lonT(b, ts + DAY)) - asp.a) < asp.off });
    }
    return out.sort((x, y) => x.asp.off - y.asp.off);
  }
  /* el próximo aspecto mayor que hará la Luna (hasta 3 días) */
  function moonNext(ts) {
    for (let t = ts; t < ts + 3 * DAY; t += HOUR) {
      const lm = lonT('Moon', t);
      for (const P of TRANSITING) {
        const asp = aspectBetween(lm, lonT(P, t), 0.08);
        if (asp) return { t, P, asp };
      }
    }
    return null;
  }
  function synastry(ceo, co) {
    const has = (c, k) => c.by[k] && (c.timeKnown || !['ASC', 'MC'].includes(k));
    const axes = AXES.map((ax) => {
      let s = 55; const hits = [];
      for (const x of ax.a) for (const y of ax.b) {
        if (!has(ceo, x) || !has(co, y)) continue;
        const asp = synAspect(ceo.by[x].lon, co.by[y].lon);
        if (asp) { const v = synValue(x, y, asp); s += v; hits.push({ x, y, asp, v }); }
      }
      const ax0 = ax.a.find((k) => has(ceo, k)), bx0 = ax.b.find((k) => has(co, k));
      if (ax0 && bx0) s += elementFit(ceo.by[ax0].sign, co.by[bx0].sign);
      return { ...ax, score: Math.max(18, Math.min(97, Math.round(s))), hits };
    });
    const MAIN = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'ASC', 'MC'];
    const pairs = [];
    for (const x of MAIN) for (const y of MAIN) {
      if (!has(ceo, x) || !has(co, y)) continue;
      const asp = synAspect(ceo.by[x].lon, co.by[y].lon);
      if (asp) pairs.push({ x, y, asp, v: synValue(x, y, asp) });
    }
    pairs.sort((a, b) => b.v - a.v);
    const composite = Math.round(axes.reduce((a, b) => a + b.score, 0) / axes.length);
    return { axes, composite, synergies: pairs.filter((p) => p.v > 0).slice(0, 3), tensions: pairs.filter((p) => p.v < 0).sort((a, b) => a.v - b.v).slice(0, 3) };
  }

  /* nombres cortos que usa el propio motor en sus razones */
  const PLN = { Sun: 'Sol', Moon: 'Luna', Mercury: 'Mercurio', Venus: 'Venus', Mars: 'Marte', Jupiter: 'Júpiter', Saturn: 'Saturno', Uranus: 'Urano', Neptune: 'Neptuno', Pluto: 'Plutón', Node: 'Nodo Norte', ASC: 'Ascendente', MC: 'Medio Cielo' };
  const SGN = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'];
  function PL(k) { return PLN[k] || k; }
  function SIGN(i) { return SGN[i]; }

  window.Astro = {
    BODIES, TRANSITING, SLOW, ASPECTS, AREAS, LEADER, ACTIONS, AXES, DAY, HOUR, skyAspects, moonNext,
    norm, wrap180, sep, signOf, elementOf, modalityOf,
    tzParts, zonedToUtc, dayKey, startOfDay,
    lonAt, speedAt, chart, ensureEphem, lonT, spdT, transitsAt, retroPeriods, retroNow, ingresses, lunations, eclipses,
    moonInfo, voidPeriods, exactHits, planetaryHours, areaScores, electional, synastry, aspectBetween,
    eclipsesCached: (from) => { if (!ECL) ECL = eclipses(from - 30 * DAY, from + 400 * DAY); return ECL; },
  };
})();
