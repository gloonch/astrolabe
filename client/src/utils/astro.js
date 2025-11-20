import * as Astronomy from 'astronomy-engine';
import { DateTime } from 'luxon';

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const OBLIQUITY = 23.43929111; // Mean obliquity for ascendant calculation
const OBLIQ_RAD = OBLIQUITY * DEG2RAD;

export const normalizeAngle = (value) => (Number.isFinite(value) ? ((value % 360) + 360) % 360 : NaN);
const normalize = normalizeAngle;

export const ZODIAC_SIGNS = [
  { name: 'Aries' },
  { name: 'Taurus' },
  { name: 'Gemini' },
  { name: 'Cancer' },
  { name: 'Leo' },
  { name: 'Virgo' },
  { name: 'Libra' },
  { name: 'Scorpio' },
  { name: 'Sagittarius' },
  { name: 'Capricorn' },
  { name: 'Aquarius' },
  { name: 'Pisces' },
];

export const NAKSHATRAS = [
  'Ashwini',
  'Bharani',
  'Krittika',
  'Rohini',
  'Mrigashirsha',
  'Ardra',
  'Punarvasu',
  'Pushya',
  'Ashlesha',
  'Magha',
  'Purva Phalguni',
  'Uttara Phalguni',
  'Hasta',
  'Chitra',
  'Swati',
  'Vishakha',
  'Anuradha',
  'Jyeshtha',
  'Mula',
  'Purva Ashadha',
  'Uttara Ashadha',
  'Shravana',
  'Dhanishta',
  'Shatabhisha',
  'Purva Bhadrapada',
  'Uttara Bhadrapada',
  'Revati',
];
const NAKSHATRA_SPAN = 360 / 27;
const PADA_SPAN = NAKSHATRA_SPAN / 4;

// Mean elements for Chiron sourced from JPL SBDB (epoch JD 2461000.5)
const CHIRON_ELEMENTS = {
  a: 13.7, // AU
  e: 0.379,
  i: 6.93, // deg
  omega: 209, // ascending node Ω deg
  w: 339, // argument of perihelion ω deg
  M0: 213, // mean anomaly at epoch deg
  n: 0.0195, // deg per day
  epochJd: 2461000.5,
};

const BODY_MAP = [
  { key: 'sun', label: 'Sun', body: Astronomy.Body.Sun },
  { key: 'moon', label: 'Moon', body: Astronomy.Body.Moon },
  { key: 'mercury', label: 'Mercury', body: Astronomy.Body.Mercury },
  { key: 'venus', label: 'Venus', body: Astronomy.Body.Venus },
  { key: 'mars', label: 'Mars', body: Astronomy.Body.Mars },
  { key: 'jupiter', label: 'Jupiter', body: Astronomy.Body.Jupiter },
  { key: 'saturn', label: 'Saturn', body: Astronomy.Body.Saturn },
  { key: 'uranus', label: 'Uranus', body: Astronomy.Body.Uranus },
  { key: 'neptune', label: 'Neptune', body: Astronomy.Body.Neptune },
  { key: 'pluto', label: 'Pluto', body: Astronomy.Body.Pluto },
  { key: 'mean_node', label: 'Rahu (Mean Node)', compute: (date) => meanLunarNode(date) },
  { key: 'south_node', label: 'Ketu (South Node)', compute: (date) => normalize(meanLunarNode(date) + 180) },
  { key: 'chiron', label: 'Chiron', compute: (date) => chironLongitude(date) },
];

export const formatDegrees = (deg) => (Number.isFinite(deg) ? `${deg.toFixed(2)}°` : '--');

function toZodiac(longitude) {
  const normalized = normalize(longitude);
  if (!Number.isFinite(normalized)) {
    console.warn('toZodiac: received non-finite longitude', longitude);
    return { index: 0, sign: 'Unknown', degreeInSign: 0 };
  }
  const index = Math.floor(normalized / 30) % 12;
  const degreeInSign = normalized - index * 30;
  if (!ZODIAC_SIGNS[index]) {
    console.warn('toZodiac: zodiac index out of range', { longitude, normalized, index });
    return { index: 0, sign: 'Unknown', degreeInSign };
  }
  return {
    index,
    sign: ZODIAC_SIGNS[index].name,
    degreeInSign,
  };
}

function calculateAscendant(date, observer) {
  const gst = Astronomy.SiderealTime(date); // Greenwich Sidereal Time in hours
  const lstHours = (gst + observer.longitude / 15 + 24) % 24;
  const lst = lstHours * 15 * DEG2RAD;
  const phi = observer.latitude * DEG2RAD;
  const epsilon = OBLIQUITY * DEG2RAD;

  // Formula for ascendant ecliptic longitude
  const numerator = Math.sin(lst);
  const denominator = Math.cos(lst) * Math.cos(epsilon) - Math.tan(phi) * Math.sin(epsilon);
  const lambda = Math.atan2(numerator, denominator);
  const asc = normalize(lambda * RAD2DEG);
  if (!Number.isFinite(asc)) {
    console.warn('calculateAscendant: non-finite ascendant', { lstHours, lst, phi, epsilon, numerator, denominator, lambda });
    throw new Error('Ascendant could not be computed for the given coordinates.');
  }
  return asc;
}

function eclipticLongitude(bodyConfig, date) {
  if (bodyConfig.key === 'moon') {
    const moon = Astronomy.EclipticGeoMoon(date);
    return normalize(moon.lon);
  }
  const vec = Astronomy.GeoVector(bodyConfig.body, date, true);
  const eclip = Astronomy.Ecliptic(vec);
  return normalize(eclip.elon);
}

const houseForLongitude = (lon, ascLongitude) => {
  // Equal 30° houses starting at the actual ascendant degree (allows houses to span sign borders).
  const delta = normalize(lon - ascLongitude);
  return Math.floor(delta / 30) + 1;
};

function meanLunarNode(date) {
  const time = Astronomy.MakeTime(date);
  const jd = 2451545 + time.tt;
  const T = (jd - 2451545.0) / 36525; // Julian centuries from J2000 TT
  // Meeus formula for mean ascending node of lunar orbit (deg)
  const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  return normalize(omega);
}

function lahiriAyanamsa(date) {
  const time = Astronomy.MakeTime(date);
  const jd = 2451545 + time.tt;
  const yearsFromJ2000 = (jd - 2451545.0) / 365.2425;
  // Approximate Lahiri ayanamsha; base at J2000 with linear precession term.
  const ayan = 23.856111 + 0.013968886 * yearsFromJ2000;
  return normalize(ayan);
}

export function nakshatraFromLongitude(lon) {
  const normalized = normalize(lon);
  const idx = Math.floor(normalized / NAKSHATRA_SPAN) % 27;
  const degreeInNakshatra = normalized - idx * NAKSHATRA_SPAN;
  const pada = Math.floor(degreeInNakshatra / PADA_SPAN) + 1;
  const degreeInPada = degreeInNakshatra - (pada - 1) * PADA_SPAN;
  return {
    index: idx,
    name: NAKSHATRAS[idx],
    pada,
    degreeInNakshatra,
    degreeInPada,
  };
}

function keplerSolve(meanAnomalyRad, eccentricity) {
  let E = meanAnomalyRad;
  for (let i = 0; i < 12; i += 1) {
    const delta = (E - eccentricity * Math.sin(E) - meanAnomalyRad) / (1 - eccentricity * Math.cos(E));
    E -= delta;
    if (Math.abs(delta) < 1e-10) break;
  }
  return E;
}

function eqToEcl(vec) {
  const ce = Math.cos(OBLIQ_RAD);
  const se = Math.sin(OBLIQ_RAD);
  return {
    x: vec.x,
    y: vec.y * ce + vec.z * se,
    z: -vec.y * se + vec.z * ce,
  };
}

function chironLongitude(date) {
  const { a, e, i, omega, w, M0, n, epochJd } = CHIRON_ELEMENTS;
  const time = Astronomy.MakeTime(date);
  const jd = 2451545 + time.tt;
  const deltaDays = jd - epochJd;
  const meanAnomalyDeg = normalize(M0 + n * deltaDays);
  const meanAnomalyRad = meanAnomalyDeg * DEG2RAD;
  const E = keplerSolve(meanAnomalyRad, e);
  const v = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  const r = a * (1 - e * Math.cos(E));

  const iRad = i * DEG2RAD;
  const omegaRad = omega * DEG2RAD;
  const wRad = w * DEG2RAD;
  const cosO = Math.cos(omegaRad);
  const sinO = Math.sin(omegaRad);
  const cosi = Math.cos(iRad);
  const sini = Math.sin(iRad);

  const arg = wRad + v;
  const cosArg = Math.cos(arg);
  const sinArg = Math.sin(arg);

  const xh = r * (cosO * cosArg - sinO * sinArg * cosi);
  const yh = r * (sinO * cosArg + cosO * sinArg * cosi);
  const zh = r * (sini * sinArg);

  const earthHelioEq = Astronomy.HelioVector(Astronomy.Body.Earth, date);
  const earthHelioEcl = eqToEcl(earthHelioEq);
  const geoEcl = {
    x: xh - earthHelioEcl.x,
    y: yh - earthHelioEcl.y,
    z: zh - earthHelioEcl.z,
  };

  const lon = normalize(Math.atan2(geoEcl.y, geoEcl.x) * RAD2DEG);
  if (!Number.isFinite(lon)) {
    console.warn('chironLongitude: non-finite result', { jd, deltaDays, meanAnomalyDeg, r, geoEcl });
  }
  return lon;
}

export function buildChart({ latitude, longitude, datetime }) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('Lat/Lon needed');
  }
  const dt = DateTime.fromISO(datetime, { zone: 'local' });
  if (!dt.isValid) {
    throw new Error('Invalid date/time');
  }
  const when = dt.toJSDate();
  const ayanamsa = lahiriAyanamsa(when);
  const observer = new Astronomy.Observer(latitude, longitude, 0);
  const ascLongitudeTropical = calculateAscendant(when, observer);
  const ascLongitude = normalize(ascLongitudeTropical - ayanamsa);
  const ascZodiac = toZodiac(ascLongitude);

  const bodies = BODY_MAP.map((item) => {
    const lonTropical = item.compute ? item.compute(when, observer) : eclipticLongitude(item, when);
    const lon = normalize(lonTropical - ayanamsa);
    const zodiac = toZodiac(lon);
    const house = houseForLongitude(lon, ascLongitude);
    return {
      ...item,
      longitude: lon,
      tropicalLongitude: lonTropical,
      sign: zodiac.sign,
      signIndex: zodiac.index,
      degreeInSign: zodiac.degreeInSign,
      house,
    };
  });

  return {
    ascendant: {
      longitude: ascLongitude,
      tropicalLongitude: ascLongitudeTropical,
      sign: ascZodiac.sign,
      degreeInSign: ascZodiac.degreeInSign,
    },
    ayanamsa,
    datetime: dt,
    observer,
    bodies,
  };
}
