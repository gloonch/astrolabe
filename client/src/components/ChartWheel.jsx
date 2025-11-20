import React, { useMemo, useState } from 'react';
import { ZODIAC_SIGNS, nakshatraFromLongitude, normalizeAngle, formatDegrees } from '../utils/astro';

const aspectDefs = [
  { name: 'Conjunction', angle: 0, orb: 6 },
  { name: 'Opposition', angle: 180, orb: 6 },
  { name: 'Trine', angle: 120, orb: 5 },
  { name: 'Square', angle: 90, orb: 5 },
  { name: 'Sextile', angle: 60, orb: 4 },
];

const symbol = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
  chiron: '⚷',
  mean_node: '☊',
  south_node: '☋',
};

const diffAngle = (a, b) => {
  const d = Math.abs(normalizeAngle(a) - normalizeAngle(b)) % 360;
  return d > 180 ? 360 - d : d;
};

const findAspect = (aLon, bLon) => {
  const delta = diffAngle(aLon, bLon);
  for (const def of aspectDefs) {
    const gap = Math.abs(delta - def.angle);
    if (gap <= def.orb) return { ...def, orbDiff: gap, separation: delta };
  }
  return null;
};

const seedPotentials = [
  { key: 'career', label: 'Career', tags: ['10', 'saturn', 'mars', 'trine'] },
  { key: 'relationship', label: 'Relationship', tags: ['7', 'venus', 'moon', 'conjunction'] },
  { key: 'spiritual', label: 'Spiritual', tags: ['12', 'ketu', 'south_node', 'neptune'] },
  { key: 'travel', label: 'Travel', tags: ['9', 'jupiter', 'sagittarius', 'sextile'] },
  { key: 'finance', label: 'Finance', tags: ['2', '8', 'venus', 'pluto', 'square'] },
  { key: 'learning', label: 'Learning', tags: ['3', 'mercury', 'gemini'] },
  { key: 'health', label: 'Health', tags: ['6', 'saturn', 'virgo'] },
  { key: 'home', label: 'Home', tags: ['4', 'moon', 'cancer'] },
  { key: 'recognition', label: 'Recognition', tags: ['sun', 'leo', '10'] },
  { key: 'healing', label: 'Healing', tags: ['chiron', 'pisces', 'water'] },
  { key: 'community', label: 'Community', tags: ['11', 'aquarius', 'uranus'] },
  { key: 'creativity', label: 'Creativity', tags: ['5', 'venus', 'leo'] },
  { key: 'discipline', label: 'Discipline', tags: ['saturn', 'capricorn', 'earth'] },
  { key: 'innovation', label: 'Innovation', tags: ['uranus', 'air', 'gemini'] },
  { key: 'research', label: 'Research', tags: ['8', 'pluto', 'scorpio'] },
  { key: 'communication', label: 'Communication', tags: ['3', 'mercury', 'virgo'] },
  { key: 'study', label: 'Formal Study', tags: ['9', 'jupiter', 'pisces'] },
  { key: 'service', label: 'Service', tags: ['6', 'virgo', 'mercury'] },
  { key: 'confidence', label: 'Confidence', tags: ['sun', 'leo', 'fire'] },
  { key: 'legacy', label: 'Legacy', tags: ['4', '10', 'saturn'] },
];

const POTENTIALS = (() => {
  const variants = ['spark', 'focus', 'breakthrough', 'challenge', 'harvest'];
  const result = [];
  seedPotentials.forEach((seed) => {
    variants.forEach((variant, i) => {
      result.push({
        id: `${seed.key}-${variant}`,
        label: `${seed.label} • ${variant}`,
        detail: `${seed.label} ${variant} with emphasis on ${seed.tags.join(', ')}`,
        tags: [...seed.tags, variant, `${seed.key}${i + 1}`],
      });
    });
  });
  return result; // 20 seeds * 5 variants = 100
})();

function ChartWheel({ chart }) {
  const [expandedId, setExpandedId] = useState(null);
  const [selection, setSelection] = useState(null); // {id,label,type,y}
  const [showPotentials, setShowPotentials] = useState(true);

  const houses = useMemo(() => {
    if (!chart) return [];
    const start = chart.ascendant.longitude;
    return Array.from({ length: 12 }, (_, i) => {
      const startLon = start + i * 30;
      const signIndex = Math.floor(normalizeAngle(startLon) / 30) % 12;
      return {
        id: `house-${i + 1}`,
        house: i + 1,
        start: startLon,
        end: startLon + 30,
        sign: ZODIAC_SIGNS[signIndex].name,
      };
    });
  }, [chart]);

  const bodiesByHouse = useMemo(() => {
    const map = {};
    houses.forEach((h) => {
      map[h.house] = [];
    });
    if (chart) {
      chart.bodies.forEach((b) => {
        const list = map[b.house] || [];
        list.push(b);
        map[b.house] = list;
      });
    }
    return map;
  }, [chart, houses]);

  const aspects = useMemo(() => {
    if (!chart) return [];
    const out = [];
    const b = chart.bodies;
    for (let i = 0; i < b.length; i += 1) {
      for (let j = i + 1; j < b.length; j += 1) {
        const asp = findAspect(b[i].longitude, b[j].longitude);
        if (asp) {
          out.push({
            id: `asp-${b[i].key}-${b[j].key}`,
            from: b[i],
            to: b[j],
            type: asp.name,
            exact: asp.angle,
            separation: asp.separation,
            orbDiff: asp.orbDiff,
          });
        }
      }
    }
    return out.sort((a, b) => a.orbDiff - b.orbDiff);
  }, [chart]);

  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));
  const select = (obj) => setSelection(obj);

  const detail = (() => {
    if (!chart) return null;
    if (!expandedId) return null;
    if (expandedId.startsWith('house-')) {
      const houseNum = Number(expandedId.split('-')[1]);
      const h = houses[houseNum - 1];
      const cuspNak = nakshatraFromLongitude(h.start);
      const bodies = bodiesByHouse[houseNum] || [];
      return (
        <div className="pixel-panel border-ghost/70 bg-white/5 rounded-xl p-4 space-y-2">
          <div className="font-pixel text-[10px] uppercase text-ghost tracking-[0.18em]">House {h.house}</div>
          <div className="text-sm font-semibold">Sign: {h.sign}</div>
          <div className="text-xs text-slate-200">
            Range: {formatDegrees(normalizeAngle(h.start))} – {formatDegrees(normalizeAngle(h.end))}
          </div>
          <div className="text-[11px]">
            <div className="font-semibold">Cusp nakshatra</div>
            <div>
              {cuspNak.name} (Pada {cuspNak.pada}) • {formatDegrees(cuspNak.degreeInNakshatra)}
            </div>
          </div>
          <div className="text-[11px] space-y-1">
            <div className="font-semibold">Planets here</div>
            {bodies.length === 0 && <div className="text-slate-300">None in this house.</div>}
            {bodies.map((body) => {
              const nak = nakshatraFromLongitude(body.longitude);
              return (
                <div key={body.key} className="flex items-center justify-between gap-2">
                  <span className="font-pixel text-[10px] uppercase text-ghost">
                    {symbol[body.key] || '•'} {body.label}
                  </span>
                  <span className="text-slate-200 text-right">
                    {formatDegrees(body.longitude)} • {nak.name} p{nak.pada}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    if (expandedId.startsWith('asp-')) {
      const asp = aspects.find((x) => x.id === expandedId);
      if (!asp) return null;
      const nakFrom = nakshatraFromLongitude(asp.from.longitude);
      const nakTo = nakshatraFromLongitude(asp.to.longitude);
      return (
        <div className="pixel-panel border-ghost/70 bg-white/5 rounded-xl p-4 space-y-2">
          <div className="font-pixel text-[10px] uppercase text-ghost tracking-[0.18em]">{asp.type}</div>
          <div className="text-sm font-semibold">
            {asp.from.label} {symbol[asp.from.key] || ''} ↔ {asp.to.label} {symbol[asp.to.key] || ''}
          </div>
          <div className="text-xs text-slate-200">
            Separation {asp.separation.toFixed(2)}° (target {asp.exact}°, orb {asp.orbDiff.toFixed(2)}°)
          </div>
          <div className="text-[11px] space-y-1">
            <div>
              {asp.from.label}: {formatDegrees(asp.from.longitude)} • {nakFrom.name} p{nakFrom.pada}
            </div>
            <div>
              {asp.to.label}: {formatDegrees(asp.to.longitude)} • {nakTo.name} p{nakTo.pada}
            </div>
          </div>
        </div>
      );
    }
    return null;
  })();

  if (!chart) {
    return (
      <div className="pixel-panel rounded-xl p-4 w-full">
        <div className="text-sm text-slate-300">No chart loaded.</div>
      </div>
    );
  }

  return (
    <div className="pixel-panel rounded-xl p-4 w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-pixel text-xs text-ghost tracking-[0.18em] uppercase">Linear Chart</h2>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-300">Equal 30° houses from asc</span>
          <button
            type="button"
            className="text-[10px] font-pixel px-2 py-1 border border-ghost/60 rounded bg-white/5"
            onClick={() => setShowPotentials((p) => !p)}
          >
            {showPotentials ? 'Hide potentials' : 'Show potentials'}
          </button>
        </div>
      </div>

      <div className="relative flex flex-col lg:flex-row gap-4">
        {(() => {
          const svgWidth = 1000;
          const rowHeight = 110;
          const houseStartY = 40;
          const potRowHeight = 70;
          const potStartY = 40;
          const leftX = 220;
          const rightX = 760;

          const houseNodes = houses.map((h, idx) => ({
            id: h.id,
            label: `H${h.house}`,
            y: houseStartY + idx * rowHeight,
          }));

          const potentialNodes = POTENTIALS.map((p, idx) => ({
            ...p,
            y: potStartY + idx * potRowHeight,
          }));

          const activeSelection = selection
            ? selection
            : houseNodes.length
              ? { id: houseNodes[0].id, label: houseNodes[0].label, type: 'house', y: houseNodes[0].y }
              : null;

          // Currently not drawing lines; keeping empty array.
          const highlightedLines = [];

          return (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${svgWidth} ${houseStartY + (houses.length + POTENTIALS.length) * rowHeight}`}
            >
              {showPotentials &&
                highlightedLines &&
                highlightedLines.map((line) => (
                  <path
                    key={line.id}
                    d={`M ${line.from.x} ${line.from.y} C ${(line.from.x + line.to.x) / 2} ${line.from.y}, ${
                      (line.from.x + line.to.x) / 2
                    } ${line.to.y}, ${line.to.x} ${line.to.y}`}
                    fill="none"
                    stroke="rgba(232,232,237,0.35)"
                    strokeWidth="1.5"
                  />
                ))}
            </svg>
          );
        })()}

        {/* Left column: houses vertical */}
        <div className="w-full lg:w-1/2 space-y-3">
          {houses.map((h, idx) => {
            const bodies = bodiesByHouse[h.house] || [];
            const isOpen = expandedId === h.id;
            const nodeY = 40 + idx * 110;
            return (
              <div
                key={h.id}
                className={`pixel-panel rounded-lg p-3 bg-night text-slate-100 border border-ghost/40 cursor-pointer ${
                  isOpen ? 'shadow-[0_0_0_2px_rgba(232,232,237,0.4)]' : ''
                }`}
                onClick={() => {
                  toggle(h.id);
                  select({ id: `${h.house}`, label: `H${h.house}`, type: 'house', y: nodeY });
                }}
              >
                <div className="flex items-center justify-between text-[10px] font-pixel uppercase text-ghost">
                  <span>House {h.house}</span>
                  <span>{h.sign}</span>
                </div>
                <div className="text-[11px] text-slate-200 mt-1">
                  {formatDegrees(normalizeAngle(h.start))} – {formatDegrees(normalizeAngle(h.end))}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {bodies.length === 0 && <span className="text-[10px] text-slate-400">Empty</span>}
                  {bodies.map((body, pi) => (
                    <button
                      key={`${h.id}-${body.key}`}
                      className="text-[10px] font-pixel px-2 py-1 border border-ghost/50 rounded bg-white/5"
                      onClick={(e) => {
                        e.stopPropagation();
                        select({
                          id: body.key,
                          label: body.label,
                          type: 'planet',
                          y: nodeY + 24 + pi * 14,
                        });
                        setExpandedId(h.id);
                      }}
                    >
                      {symbol[body.key] || '•'} {body.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right column: potentials list */}
        <div className="w-full lg:w-1/2 space-y-2">
          <div className="text-[11px] font-pixel uppercase text-ghost tracking-[0.18em]">Potentials</div>
          {showPotentials ? (
            (() => {
              const matchPotentials =
                selection && POTENTIALS.filter((p) =>
                  p.tags.some(
                    (t) =>
                      t.toLowerCase() === selection.id ||
                      t.toLowerCase() === selection.label.toLowerCase() ||
                      t.toLowerCase() === selection.type
                  )
                );
              if (!selection || !matchPotentials || matchPotentials.length === 0) {
                return <div className="text-[11px] text-slate-400">No potentials linked to this selection.</div>;
              }
              return (
                <div className="space-y-2 relative max-h-[640px] overflow-y-auto pr-1">
                  {matchPotentials.map((p, idx) => {
                    const py = 40 + idx * 70;
                    return (
                      <div
                        key={p.id}
                        className="pixel-panel rounded-lg p-3 bg-night border border-ghost/70"
                        onMouseEnter={() => select({ id: p.id, label: p.label, type: 'potential', y: py })}
                      >
                        <div className="text-sm font-semibold">{p.label}</div>
                        <div className="text-[10px] text-slate-400">Tags: {p.tags.join(', ')}</div>
                        <div className="text-[11px] text-slate-200 mt-1">{p.detail}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          ) : (
            <div className="text-[11px] text-slate-400">Potentials hidden.</div>
          )}
        </div>
      </div>

      {/* Aspects list */}
      <div className="pixel-panel rounded-lg border border-ghost/40 p-3">
        <div className="text-[11px] font-pixel uppercase text-ghost tracking-[0.18em] mb-2">Aspects</div>
        {aspects.length === 0 && <div className="text-[11px] text-slate-300">No major aspects within orb.</div>}
        <div className="flex flex-wrap gap-2">
          {aspects.map((asp, ai) => {
            const active = expandedId === asp.id;
            return (
              <button
                key={asp.id}
                onClick={() => {
                  toggle(asp.id);
                  select({
                    id: asp.type.toLowerCase(),
                    label: asp.type,
                    type: 'aspect',
                    y: 20 + ai * 10,
                  });
                }}
                className={`px-3 py-2 rounded border text-[11px] ${
                  active ? 'border-ghost bg-white/10' : 'border-ghost/50 bg-white/5'
                }`}
              >
                {asp.type}: {asp.from.label} {symbol[asp.from.key] || ''} / {asp.to.label}{' '}
                {symbol[asp.to.key] || ''} ({asp.orbDiff.toFixed(2)}° orb)
              </button>
            );
          })}
        </div>
      </div>

      {detail}
    </div>
  );
}

export default ChartWheel;
