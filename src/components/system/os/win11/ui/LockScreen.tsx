'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Weather = {
  city: string;
  timezone: string;
  current: {
    temperatureC: number;
    weatherCode: number;
    description: string;
    isDay: boolean;
    humidity: number;
    windKph: number;
  };
  today: {
    tempMaxC: number;
    tempMinC: number;
    weatherCode: number;
    description: string;
  };
};

const codeToGlyph = (code: number, isDay: boolean) => {
  // Minimal set that covers most conditions
  if ([0, 1].includes(code)) return isDay ? '☀️' : '🌙';
  if ([2].includes(code)) return isDay ? '🌤️' : '☁️';
  if ([3].includes(code)) return '☁️';
  if ([45, 48].includes(code)) return '🌫️';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 80, 81, 82].includes(code)) return '🌧️';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
  if ([95, 96, 99].includes(code)) return '⛈️';
  return '🌡️';
};

const useClock = () => {
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  return { time, date };
};

const WeatherCard: React.FC = () => {
  const [data, setData] = useState<Weather | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    const fetchWeather = async () => {
      try {
        const res = await fetch('/api/weather?city=Jakarta');
        if (!res.ok) throw new Error('Failed to load weather');
        const j = await res.json();
        if (mounted) setData(j);
      } catch (e: any) {
        if (mounted) setErr(e?.message || 'Weather error');
      }
    };
    fetchWeather();
    const id = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  if (err) {
    return (
      <div className="w-[360px] h-[120px] rounded-xl p-4 text-white/90" style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.2)' }}>
        <div className="text-sm">Weather</div>
        <div className="text-xs opacity-80 mt-2">{err}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-[360px] h-[120px] rounded-xl p-4 animate-pulse" style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.15)' }}>
        <div className="h-4 w-24 bg-white/20 rounded" />
        <div className="flex items-end gap-3 mt-4">
          <div className="h-14 w-14 bg-white/20 rounded-full" />
          <div className="h-10 w-28 bg-white/20 rounded" />
        </div>
        <div className="h-3 w-32 bg-white/20 rounded mt-3" />
      </div>
    );
  }

  const glyph = codeToGlyph(data.current.weatherCode, data.current.isDay);

  return (
    <div className="w-[360px] rounded-xl p-4 text-white" style={{ backdropFilter: 'blur(10px)', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.18)' }}>
      <div className="text-sm opacity-90">{data.city}</div>
      <div className="flex items-center gap-4 mt-1">
        <div className="text-4xl leading-none">{glyph}</div>
        <div className="flex items-end gap-3">
          <div className="text-5xl font-light">{data.current.temperatureC}°C</div>
          <div className="text-sm opacity-85 mb-1">{data.current.description}</div>
        </div>
      </div>
      <div className="text-xs opacity-80 mt-2">
        H: {data.today.tempMaxC}° • L: {data.today.tempMinC}° • Humidity {data.current.humidity}% • Wind {data.current.windKph} km/h
      </div>
    </div>
  );
};

type Flyout = 'network' | 'accessibility' | 'power' | 'battery' | null;
type Network = { id: string; ssid: string; strength: number; secure: boolean; connected?: boolean };

const LockScreen: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const { time, date } = useClock();
  const [wifiOn, setWifiOn] = useState(true);
  const [btOn, setBtOn] = useState(false);
  const [airplaneOn, setAirplaneOn] = useState(false);
  const [flyout, setFlyout] = useState<Flyout>(null);
  const [networks, setNetworks] = useState<Network[]>([
    { id: '1', ssid: 'Cafe-Jakarta', strength: 4, secure: true },
    { id: '2', ssid: 'Kos-BlockA', strength: 3, secure: true },
    { id: '3', ssid: 'Public-WiFi', strength: 2, secure: false },
  ]);
  const [connectedId, setConnectedId] = useState<string | null>('1');
  const batteryLevel = 0.98;

  // Fluent acrylic helpers
  const acrylicStyle = (opacity = 0.38): React.CSSProperties => ({
    backdropFilter: 'blur(16px) saturate(140%)',
    background: `rgba(20,20,20,${opacity})`,
    border: '1px solid rgba(255,255,255,0.18)',
    boxShadow: '0 10px 28px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
  });
  const iconButtonClass = 'w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-[1.04] active:scale-[0.98]';

  const WifiIcon: React.FC<{ on?: boolean; className?: string }> = ({ on = true, className }) => (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity={on ? 1 : 0.35}>
        <path d="M10 22c9-8 19-8 28 0"/>
        <path d="M15 27c7-6 11-6 18 0"/>
        <path d="M20 32c4-3 4-3 8 0"/>
      </g>
      <circle cx="24" cy="38" r="2.6" fill="currentColor" opacity={on ? 1 : 0.35} />
    </svg>
  );
  const BatteryIcon: React.FC<{ level?: number; className?: string }> = ({ level = 0.98, className }) => (
    <svg viewBox="0 0 64 32" className={className} aria-hidden>
      <rect x="2" y="6" width="54" height="20" rx="4" fill="none" stroke="currentColor" strokeWidth="2"/>
      <rect x="58" y="12" width="4" height="8" rx="1" fill="currentColor"/>
      <rect x="4" y="8" width={50 * Math.max(0, Math.min(1, level))} height="16" rx="3" fill="currentColor" opacity={0.6}/>
    </svg>
  );
  const AccessibilityIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="8.5" r="3" fill="currentColor"/>
      <path d="M10 16h28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M24 16v12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <path d="M24 28l-8 11" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <path d="M24 28l8 11" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
  const PowerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 48 48" className={className}><path d="M23 6h2v16h-2z" fill="currentColor"/><path d="M24 44C14.06 44 6 35.94 6 26c0-6.1 3.08-11.5 7.77-14.75l1.13 1.64C11.66 15.7 9 20.5 9 26c0 8.28 6.72 15 15 15s15-6.72 15-15c0-5.5-2.66-10.3-5.9-13.11l1.13-1.64C38.92 14.5 42 19.9 42 26c0 9.94-8.06 18-18 18z" fill="currentColor"/></svg>
  );

  useEffect(() => {
    const onKey = () => onUnlock();
    window.addEventListener('keydown', onKey, { once: true });
    return () => { window.removeEventListener('keydown', onKey); };
  }, [onUnlock]);

  useEffect(() => {
    const id = setInterval(() => {
      setNetworks(prev => prev.map(n => ({ ...n, strength: Math.max(1, Math.min(4, n.strength + (Math.random() > 0.5 ? 1 : -1))) })));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const connect = (id: string) => {
    if (!wifiOn || airplaneOn) return;
    setConnectedId(id);
    setNetworks(prev => prev.map(n => ({ ...n, connected: n.id === id })));
  };
  const disconnect = () => {
    setConnectedId(null);
    setNetworks(prev => prev.map(n => ({ ...n, connected: false })));
  };

  return (
    <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1964&auto=format&fit=crop')] bg-cover bg-center" onMouseDown={()=> setFlyout(null)}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute left-10 top-1/4 -translate-y-1/4 text-white select-none" style={{ fontFamily: `'Segoe UI Variable', 'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif`, letterSpacing: 0.2 }}>
        <div className="text-7xl font-light drop-shadow-lg" style={{ transform: 'scale(var(--lock-font-zoom, 1))' }}>{time}</div>
        <div className="text-2xl mt-2 opacity-95 drop-shadow" style={{ transform: 'scale(var(--lock-font-zoom, 1))' }}>{date}</div>
      </div>
      <div className="absolute bottom-6 left-8">
        <WeatherCard />
      </div>
      <div className="absolute bottom-6 right-8 flex items-center gap-2 text-white select-none" onMouseDown={(e)=> e.stopPropagation()}>
        <div className="px-2 py-1 rounded text-sm opacity-80">Press any key to sign in</div>
        <div className="flex items-center gap-2">
          <button aria-label="Network" className={iconButtonClass} style={acrylicStyle()} onClick={()=> setFlyout(flyout==='network'? null : 'network')}>
            <WifiIcon on={wifiOn} className="w-6 h-6" />
          </button>
          <button aria-label="Accessibility" className={iconButtonClass} style={acrylicStyle()} onClick={()=> setFlyout(flyout==='accessibility'? null : 'accessibility')}>
            <AccessibilityIcon className="w-6 h-6" />
          </button>
          <div className="relative">
            <button aria-label="Power" className={iconButtonClass} style={acrylicStyle()} onClick={()=> setFlyout(flyout==='power'? null : 'power')}>
              <PowerIcon className="w-6 h-6" />
            </button>
            {flyout==='power' && (
              <div className="absolute right-0 bottom-12 w-40 rounded-lg p-2 text-sm origin-bottom-right animate-[fadeIn_.12s_ease-out]" style={acrylicStyle(0.7)}>
                <div className="px-2 py-1 hover:bg-white/10 rounded cursor-default">Sleep</div>
                <div className="px-2 py-1 hover:bg-white/10 rounded cursor-default">Restart</div>
                <div className="px-2 py-1 hover:bg-white/10 rounded cursor-default">Shut down</div>
              </div>
            )}
          </div>
          <div className="relative">
            <button aria-label="Battery" className={`${iconButtonClass} w-12`} style={acrylicStyle()} onClick={()=> setFlyout(flyout==='battery'? null : 'battery')}>
              <BatteryIcon level={batteryLevel} className="w-9 h-5" />
            </button>
          </div>
        </div>
      </div>

      {flyout==='network' && (
        <div className="absolute right-[126px] bottom-20 w-[360px] rounded-xl p-3 text-white text-sm origin-bottom-right animate-[fadeIn_.12s_ease-out]" style={acrylicStyle(0.8)} onMouseDown={(e)=> e.stopPropagation()}>
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Network</div>
            <label className="flex items-center gap-2">
              <span className="opacity-80">Wi‑Fi</span>
              <input type="checkbox" checked={wifiOn && !airplaneOn} onChange={()=> setWifiOn(v=>!v)} />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button className={`h-10 rounded transition-colors ${wifiOn && !airplaneOn ? 'bg-white/20' : 'bg-white/10'} hover:bg-white/20`}>Wi‑Fi</button>
            <button className={`h-10 rounded transition-colors ${btOn ? 'bg-white/20' : 'bg-white/10'} hover:bg-white/20`} onClick={()=> setBtOn(v=>!v)}>Bluetooth</button>
            <button className={`h-10 rounded transition-colors ${airplaneOn ? 'bg-white/20' : 'bg-white/10'} hover:bg-white/20`} onClick={()=> setAirplaneOn(v=>!v)}>Airplane</button>
          </div>
          <div className="space-y-1 max-h-64 overflow-auto pr-1">
            {(!wifiOn || airplaneOn) && (
              <div className="opacity-80 text-xs pb-2">Turn on Wi‑Fi to see available networks</div>
            )}
            {wifiOn && !airplaneOn && networks.map(n => (
              <div key={n.id} className="flex items-center justify-between px-2 py-2 rounded hover:bg-white/10">
                <div>
                  <div className="text-sm">{n.ssid} {n.secure ? '🔒' : ''}</div>
                  <div className="text-xs opacity-75">{n.connected ? 'Connected' : `Signal ${'▮'.repeat(n.strength)}${'▯'.repeat(4-n.strength)}`}</div>
                </div>
                {n.connected ? (
                  <button className="px-2 py-1 rounded bg-white/20 hover:bg-white/30" onClick={disconnect}>Disconnect</button>
                ) : (
                  <button className="px-2 py-1 rounded bg-white/20 hover:bg-white/30" onClick={()=> connect(n.id)}>Connect</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {flyout==='accessibility' && (
        <div className="absolute right-[82px] bottom-20 w-[320px] rounded-xl p-3 text-white text-sm space-y-2 origin-bottom-right animate-[fadeIn_.12s_ease-out]" style={acrylicStyle(0.8)} onMouseDown={(e)=> e.stopPropagation()}>
          <div className="font-medium mb-1">Accessibility</div>
          <label className="flex items-center justify-between"><span>High contrast</span><input type="checkbox" onChange={(e)=>{ document.documentElement.style.filter = e.target.checked? 'contrast(1.1) saturate(1.1)' : ''; }}/></label>
          <label className="flex items-center justify-between"><span>Large text</span><input type="checkbox" onChange={(e)=>{ document.documentElement.style.setProperty('--lock-font-zoom', e.target.checked? '1.15' : '1'); }}/></label>
          <label className="flex items-center justify-between"><span>On‑screen keyboard</span><input type="checkbox" /></label>
          <label className="flex items-center justify-between"><span>Narrator</span><input type="checkbox" /></label>
        </div>
      )}

      {flyout==='battery' && (
        <div className="absolute right-[22px] bottom-20 w-52 rounded-lg p-3 text-sm origin-bottom-right animate-[fadeIn_.12s_ease-out]" style={acrylicStyle(0.7)} onMouseDown={(e)=> e.stopPropagation()}>
          <div className="text-white/90">Battery {Math.round(batteryLevel*100)}%</div>
          <div className="text-xs text-white/70">Estimated time remaining: 6h 20m</div>
          <label className="flex items-center gap-2 text-white/90 mt-2"><input type="checkbox" className="accent-white" /> Battery saver</label>
        </div>
      )}
    </div>
  );
};

export default LockScreen;


