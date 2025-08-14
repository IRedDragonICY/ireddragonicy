'use client';

import React, { CSSProperties, useMemo, useState } from 'react';
import { useWin11Theme } from './Win11ThemeContext';

interface SettingsAppProps { onClose?: () => void }

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const { themeMode, transparency } = useWin11Theme();
  const panelStyle: CSSProperties = {
    background: themeMode === 'dark' ? (transparency ? 'rgba(255,255,255,0.06)' : 'rgba(17,24,39,1)') : (transparency ? 'rgba(255,255,255,0.7)' : '#ffffff'),
    border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.1)'
  };
  const titleStyle: CSSProperties = { color: themeMode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' };
  return (
    <div className="mb-4">
      <div className="text-sm mb-2" style={titleStyle}>{title}</div>
      <div className="rounded-xl p-3" style={panelStyle}>
        {children}
      </div>
    </div>
  );
};

const ColorSwatch: React.FC<{ color: string; active: boolean; onClick: () => void }> = ({ color, active, onClick }) => (
  <button
    className={`w-8 h-8 rounded-md border ${active ? 'ring-2 ring-offset-2 ring-blue-500 border-transparent' : 'border-black/20 dark:border-white/20'}`}
    style={{ backgroundColor: color }}
    onClick={onClick}
    aria-label={`accent ${color}`}
  />
);

type Page = 'Home' | 'System' | 'Bluetooth & devices' | 'Network & internet' | 'Personalization' | 'Apps' | 'Accounts' | 'Time & language' | 'Gaming' | 'Accessibility' | 'Privacy & security' | 'Windows Update';

const HomePage: React.FC = () => (
  <div className="grid md:grid-cols-2 gap-4">
    <Section title="Recommended settings">
      <div className="grid grid-cols-2 gap-2 text-sm">
        {['Installed apps','Display','Sound','Network'].map(item => (
          <div key={item} className="px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5">{item}</div>
        ))}
      </div>
    </Section>
    <Section title="Cloud storage">
      <div className="text-sm opacity-80">Make sure OneDrive is installed on your PC to see your storage details here.</div>
    </Section>
  </div>
);

const SystemPage: React.FC = () => (
  <div className="grid md:grid-cols-2 gap-4 text-sm">
    <Section title="About">
      <div>Device name: Emulated-PC</div>
      <div>Processor: AMD Ryzen 9 7950X3D</div>
      <div>Installed RAM: 64.0 GB</div>
      <div>Device ID: DEMO-0000</div>
      <div>OS build: 11.0 (emulated)</div>
    </Section>
    <Section title="Display">
      <div>Resolution: 1920 × 1080</div>
      <div>Scale: 100%</div>
      <div>Graphics: NVIDIA RTX 4090</div>
    </Section>
  </div>
);

const NetworkPage: React.FC = () => (
  <Section title="Wi‑Fi">
    <div className="flex items-center justify-between text-sm">
      <div>
        <div className="font-medium">Febi_Net</div>
        <div className="opacity-70">Connected, secured</div>
      </div>
      <button className="px-3 py-1.5 rounded border border-black/20 dark:border-white/20">Disconnect</button>
    </div>
  </Section>
);

const SettingsApp: React.FC<SettingsAppProps> = () => {
  const { themeMode, setThemeMode, accentColor, setAccentColor, transparency, setTransparency } = useWin11Theme();
  const palette = useMemo(() => [
    '#3b82f6', '#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#84cc16', '#f59e0b', '#ef4444', '#ec4899', '#22d3ee', '#14b8a6', '#0ea5e9'
  ], []);
  const [page, setPage] = useState<Page>('Home');

  const baseBG: CSSProperties = {
    // Match other app windows surface color for consistency
    background: themeMode === 'dark' ? '#111827' : '#ffffff',
    color: themeMode === 'dark' ? 'white' : 'black'
  };

  return (
    <div className="w-full h-full p-4 overflow-auto" style={baseBG}>
      <div className="grid grid-cols-[240px_1fr] gap-4">
        {/* Sidebar */}
        <div className="space-y-1 text-sm">
          {(['Home','System','Bluetooth & devices','Network & internet','Personalization','Apps','Accounts','Time & language','Gaming','Accessibility','Privacy & security','Windows Update'] as Page[]).map((it) => (
            <button key={it} onClick={()=>setPage(it)} className="w-full text-left px-3 py-2 rounded-lg" style={{
              background: page===it ? (themeMode==='dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'transparent'
            }}>{it}</button>
          ))}
        </div>

        {/* Content */}
        <div>
          {page==='Home' && <HomePage />}
          {page==='System' && <SystemPage />}
          {page==='Network & internet' && <NetworkPage />}
          {page==='Personalization' && (
            <>
              <div className="text-xl font-semibold mb-4">Personalization › Colors</div>
              <Section title="Choose your mode">
                <div className="flex items-center gap-3 text-sm">
                  <button className={`px-3 py-1.5 rounded border ${themeMode==='light'?'bg-black/5 dark:bg-white/10 border-black/30 dark:border-white/20':'border-black/20 dark:border-white/20'}`} onClick={() => setThemeMode('light')}>Light</button>
                  <button className={`px-3 py-1.5 rounded border ${themeMode==='dark'?'bg-black/5 dark:bg-white/10 border-black/30 dark:border-white/20':'border-black/20 dark:border-white/20'}`} onClick={() => setThemeMode('dark')}>Dark</button>
                </div>
              </Section>
              <Section title="Transparency effects">
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={transparency} onChange={e => setTransparency(e.target.checked)} />
                  <span>Windows and surfaces appear translucent</span>
                </label>
              </Section>
              <Section title="Accent color">
                <div className="flex flex-wrap gap-2">
                  {palette.map(c => (
                    <ColorSwatch key={c} color={c} active={accentColor===c} onClick={()=>setAccentColor(c)} />
                  ))}
                </div>
              </Section>
            </>
          )}
          {page!=='Home' && page!=='System' && page!=='Personalization' && page!=='Network & internet' && (
            <div className="text-sm opacity-70">{page} settings page is coming soon. The layout is ready and navigable.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsApp;


