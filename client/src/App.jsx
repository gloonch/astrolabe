import React, { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { buildChart, formatDegrees } from './utils/astro';
import ChartWheel from './components/ChartWheel';
import Hero from './components/Hero';

const isoLocalNow = () =>
  DateTime.local().toISO({
    includeOffset: false,
    suppressSeconds: true,
    suppressMilliseconds: true,
  });

const defaultLocation = {
  lat: '35.6892',
  lon: '51.3890',
};

function App() {
  const [location, setLocation] = useState(defaultLocation);
  const [datetime, setDatetime] = useState(isoLocalNow());
  const [chart, setChart] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [geoStatus, setGeoStatus] = useState('');

  const refreshChart = (coords = location, dateValue = datetime) => {
    const latNum = Number.parseFloat(coords.lat);
    const lonNum = Number.parseFloat(coords.lon);
    if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
      setError('Latitude and longitude are required.');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      const result = buildChart({
        latitude: latNum,
        longitude: lonNum,
        datetime: dateValue,
      });
      setChart(result);
      setStatus('ready');
    } catch (err) {
      setStatus('idle');
      setError(err.message || 'Could not build chart.');
    }
  };

  const handleGeo = () => {
    if (!navigator.geolocation) {
      setGeoStatus('unsupported');
      return;
    }
    setGeoStatus('pending');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude.toFixed(5),
          lon: pos.coords.longitude.toFixed(5),
        };
        setLocation(coords);
        setGeoStatus('ok');
        refreshChart(coords, datetime);
      },
      () => setGeoStatus('error')
    );
  };

  useEffect(() => {
    refreshChart();
    handleGeo();
  }, []);

  const ascBlock = chart && (
    <div className="pixel-panel p-4 rounded-lg flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase text-slate-300">Ascendant</span>
        <span className="text-ghost font-semibold">House 1 cusp</span>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-base md:text-lg">
        <span className="font-pixel text-ghost text-[11px] md:text-xs">Sign: {chart.ascendant.sign}</span>
        <span className="text-slate-100">
          {formatDegrees(chart.ascendant.degreeInSign)} / {formatDegrees(chart.ascendant.longitude)}
        </span>
      </div>
      <p className="text-xs text-slate-300">
        Houses use whole-sign starting from the ascendant sign. Precise degrees show ecliptic longitudes.
      </p>
    </div>
  );

  const infoBar = (
    <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-slate-200">
      <span className="bg-slate-100/10 text-ghost px-3 py-2 rounded-md border border-ghost/40">
        Time: {datetime.replace('T', ' ')} (device zone)
      </span>
      <span className="bg-slate-100/10 text-ghost px-3 py-2 rounded-md border border-ghost/40">
        Lat {Number.parseFloat(location.lat).toFixed(4)}, Lon {Number.parseFloat(location.lon).toFixed(4)}
      </span>
      {chart && (
        <span className="bg-slate-100/10 text-ghost px-3 py-2 rounded-md border border-ghost/40">
          Ayanamsa (Lahiri): {formatDegrees(chart.ayanamsa)}
        </span>
      )}
      {geoStatus === 'pending' && <span className="text-slate-200">Detecting location...</span>}
      {geoStatus === 'error' && <span className="text-slate-200">Location denied; using manual coords.</span>}
      {geoStatus === 'unsupported' && <span className="text-slate-200">Geolocation unsupported.</span>}
    </div>
  );

  return (
    <>
      <main className="min-h-screen pb-12 bg-night">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 space-y-6">
          <header className="pixel-panel rounded-xl p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-300 uppercase tracking-[0.18em]">Jyotish / 8-bit</p>
                <h1 className="text-2xl md:text-3xl text-ghost font-pixel glow-text">Retro Vedic Chart</h1>
                <p className="text-slate-200 mt-2 text-sm md:text-base">
                  Whole-sign houses, Sun through Pluto, nodes, and Chiron — monochrome pixel look.
                </p>
              </div>
              <div className="flex flex-col text-right text-[10px] text-slate-300 uppercase tracking-[0.18em]">
                <span>Real-time</span>
                <span>Geocentric</span>
                <span>Sidereal flavor</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">{infoBar}</div>
          </header>

          <section className="pixel-panel rounded-xl p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                Latitude (N+, S-)
                <input
                  value={location.lat}
                  onChange={(e) => setLocation((prev) => ({ ...prev, lat: e.target.value }))}
                  className="pixel-panel border-2 border-ghost bg-night px-3 py-3 rounded text-slate-100 focus:outline-none focus:border-ghost"
                  type="number"
                  step="0.0001"
                  placeholder="35.6892"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                Longitude (E+, W-)
                <input
                  value={location.lon}
                  onChange={(e) => setLocation((prev) => ({ ...prev, lon: e.target.value }))}
                  className="pixel-panel border-2 border-ghost bg-night px-3 py-3 rounded text-slate-100 focus:outline-none focus:border-ghost"
                  type="number"
                  step="0.0001"
                  placeholder="51.3890"
                />
              </label>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                Date & time (device timezone)
                <input
                  value={datetime}
                  onChange={(e) => setDatetime(e.target.value)}
                  className="pixel-panel border-2 border-ghost bg-night px-3 py-3 rounded text-slate-100 focus:outline-none focus:border-ghost"
                  type="datetime-local"
                />
              </label>
              <div className="flex flex-col gap-2">
                <span className="text-xs text-slate-300">Quick actions</span>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      const now = isoLocalNow();
                      setDatetime(now);
                      refreshChart(location, now);
                    }}
                    className="pixel-button px-4 py-3 rounded hover:bg-slate-200"
                  >
                    Now
                  </button>
                  <button
                    onClick={handleGeo}
                    className="pixel-button px-4 py-3 rounded hover:bg-slate-200"
                  >
                    Use my location
                  </button>
                  <button
                    onClick={() => refreshChart()}
                    className="pixel-button px-4 py-3 rounded hover:bg-slate-200"
                  >
                    Refresh positions
                  </button>
                </div>
              </div>
            </div>
            {error && (
              <div className="bg-white/5 border border-white/30 text-ghost px-4 py-3 rounded">
                {error}
              </div>
            )}
          </section>

          {ascBlock}

          <ChartWheel chart={chart} />

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {chart?.bodies.map((body) => (
              <article key={body.key} className="pixel-panel rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-ghost font-pixel text-[10px] uppercase">{body.label}</div>
                  <div className="text-slate-200 text-xs font-semibold">House {body.house}</div>
                </div>
                <div className="text-slate-100 text-lg font-semibold">{body.sign}</div>
                <div className="text-slate-200 text-sm">{formatDegrees(body.degreeInSign)} ({formatDegrees(body.longitude)})</div>
              </article>
            ))}
          </section>

          {status === 'loading' && (
            <div className="text-center text-sm text-slate-300 animate-pulse">Calculating positions...</div>
          )}
        </div>
      </main>
    </>
  );
}

export default App;
