'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useWin11Theme } from '../..';

export type UnitGroup =
  | { id: 'length'; label: 'Length'; units: { id: string; label: string; toSI: (v: number) => number; fromSI: (v: number) => number }[] }
  | { id: 'weight'; label: 'Weight and mass'; units: { id: string; label: string; toSI: (v: number) => number; fromSI: (v: number) => number }[] }
  | { id: 'temperature'; label: 'Temperature'; units: { id: string; label: string; to: (v: number, to: string) => number }[] }
  | { id: 'volume'; label: 'Volume'; units: { id: string; label: string; toSI: (v: number) => number; fromSI: (v: number) => number }[] }
  | { id: 'speed'; label: 'Speed'; units: { id: string; label: string; toSI: (v: number) => number; fromSI: (v: number) => number }[] }
  | { id: 'area'; label: 'Area'; units: { id: string; label: string; toSI: (v: number) => number; fromSI: (v: number) => number }[] }
  | { id: 'power'; label: 'Power'; units: { id: string; label: string; toSI: (v: number) => number; fromSI: (v: number) => number }[] }
  | { id: 'pressure'; label: 'Pressure'; units: { id: string; label: string; toSI: (v: number) => number; fromSI: (v: number) => number }[] }
  | { id: 'data'; label: 'Data'; units: { id: string; label: string; factor: number }[] }
  | { id: 'angle'; label: 'Angle'; units: { id: string; label: string; factor: number }[] }
  | { id: 'time'; label: 'Time'; units: { id: string; label: string; factor: number }[] }
  | { id: 'energy'; label: 'Energy'; units: { id: string; label: string; toSI: (v:number)=>number; fromSI: (v:number)=>number }[] };

const metric = (factor: number) => ({ toSI: (v: number) => v * factor, fromSI: (v: number) => v / factor });

const GROUPS: UnitGroup[] = [
  { id: 'length', label: 'Length', units: [
    { id: 'm', label: 'Meter (m)', ...metric(1) },
    { id: 'km', label: 'Kilometer (km)', ...metric(1000) },
    { id: 'cm', label: 'Centimeter (cm)', ...metric(0.01) },
    { id: 'mm', label: 'Millimeter (mm)', ...metric(0.001) },
    { id: 'in', label: 'Inch (in)', ...metric(0.0254) },
    { id: 'ft', label: 'Foot (ft)', ...metric(0.3048) },
    { id: 'yd', label: 'Yard (yd)', ...metric(0.9144) },
    { id: 'mi', label: 'Mile (mi)', ...metric(1609.34) },
  ]},
  { id: 'weight', label: 'Weight and mass', units: [
    { id: 'kg', label: 'Kilogram (kg)', ...metric(1) },
    { id: 'g', label: 'Gram (g)', ...metric(0.001) },
    { id: 'lb', label: 'Pound (lb)', ...metric(0.453592) },
    { id: 'oz', label: 'Ounce (oz)', ...metric(0.0283495) },
  ]},
  { id: 'temperature', label: 'Temperature', units: [
    { id: 'C', label: 'Celsius (°C)', to: (v:number, to:string)=> to==='F'? v*9/5+32 : to==='K'? v+273.15 : v },
    { id: 'F', label: 'Fahrenheit (°F)', to: (v:number, to:string)=> to==='C'? (v-32)*5/9 : to==='K'? (v-32)*5/9+273.15 : v },
    { id: 'K', label: 'Kelvin (K)', to: (v:number, to:string)=> to==='C'? v-273.15 : to==='F'? (v-273.15)*9/5+32 : v },
  ]},
  { id: 'volume', label: 'Volume', units: [
    { id: 'L', label: 'Liter (L)', ...metric(1) },
    { id: 'mL', label: 'Milliliter (mL)', ...metric(0.001) },
    { id: 'gal', label: 'Gallon (US)', ...metric(3.78541) },
    { id: 'qt', label: 'Quart (US)', ...metric(0.946353) },
  ]},
  { id: 'speed', label: 'Speed', units: [
    { id: 'mps', label: 'm/s', ...metric(1) },
    { id: 'kmph', label: 'km/h', ...metric(1000/3600) },
    { id: 'mph', label: 'mph', ...metric(1609.34/3600) },
    { id: 'kn', label: 'knot', ...metric(1852/3600) },
  ]},
  { id: 'area', label: 'Area', units: [
    { id: 'm2', label: 'Square meter', ...metric(1) },
    { id: 'km2', label: 'Square kilometer', ...metric(1_000_000) },
    { id: 'ft2', label: 'Square foot', ...metric(0.092903) },
    { id: 'acre', label: 'Acre', ...metric(4046.86) },
  ]},
  { id: 'power', label: 'Power', units: [
    { id: 'W', label: 'Watt (W)', ...metric(1) },
    { id: 'kW', label: 'Kilowatt (kW)', ...metric(1000) },
    { id: 'hp', label: 'Horsepower (hp)', ...metric(745.7) },
  ]},
  { id: 'pressure', label: 'Pressure', units: [
    { id: 'Pa', label: 'Pascal (Pa)', ...metric(1) },
    { id: 'kPa', label: 'Kilopascal (kPa)', ...metric(1000) },
    { id: 'bar', label: 'Bar', ...metric(100000) },
    { id: 'psi', label: 'psi', ...metric(6894.76) },
  ]},
  { id: 'data', label: 'Data', units: [
    { id: 'b', label: 'bit', factor: 1 },
    { id: 'B', label: 'byte', factor: 8 },
    { id: 'KB', label: 'KB', factor: 8*1024 },
    { id: 'MB', label: 'MB', factor: 8*1024*1024 },
    { id: 'GB', label: 'GB', factor: 8*1024*1024*1024 },
  ]},
  { id: 'angle', label: 'Angle', units: [
    { id: 'deg', label: 'Degree', factor: 1 },
    { id: 'rad', label: 'Radian', factor: 180/Math.PI },
    { id: 'grad', label: 'Gradian', factor: 0.9 },
  ]},
  { id: 'time', label: 'Time', units: [
    { id: 's', label: 'Second (s)', factor: 1 },
    { id: 'min', label: 'Minute (min)', factor: 60 },
    { id: 'h', label: 'Hour (h)', factor: 3600 },
    { id: 'day', label: 'Day', factor: 86400 },
    { id: 'week', label: 'Week', factor: 604800 },
  ]},
  { id: 'energy', label: 'Energy', units: [
    { id: 'J', label: 'Joule (J)', ...metric(1) },
    { id: 'kJ', label: 'Kilojoule (kJ)', ...metric(1000) },
    { id: 'cal', label: 'Calorie (cal)', ...metric(4.184) },
    { id: 'kcal', label: 'Kilocalorie (kcal)', ...metric(4184) },
    { id: 'Wh', label: 'Watt-hour (Wh)', ...metric(3600) },
    { id: 'kWh', label: 'Kilowatt-hour (kWh)', ...metric(3_600_000) },
  ]},
];

const Converter: React.FC<{ initialGroup?: UnitGroup['id']; mode?: 'single' | 'all' }> = ({ initialGroup, mode = 'all' }) => {
  const { themeMode } = useWin11Theme();
  const [groupId, setGroupId] = useState<UnitGroup['id']>(initialGroup || 'length');
  const group = useMemo(()=> GROUPS.find(g=>g.id===groupId)!, [groupId]);
  const [from, setFrom] = useState(group.units[0].id);
  const [to, setTo] = useState(group.units[1].id);
  const [amount, setAmount] = useState(1);

  useEffect(()=>{ setFrom(group.units[0].id); setTo(group.units[1].id); setAmount(1); },[groupId]);

  let result = 0;
  if (group.id === 'temperature') {
    const uFrom = group.units.find(u=>u.id===from)! as any;
    result = uFrom.to(amount, to);
  } else if (group.id === 'data' || group.id === 'angle') {
    const f = (group.units.find(u=>u.id===from) as any).factor;
    const t = (group.units.find(u=>u.id===to) as any).factor;
    result = amount * f / t;
  } else {
    const uFrom = (group as any).units.find((u:any)=>u.id===from);
    const uTo = (group as any).units.find((u:any)=>u.id===to);
    const si = uFrom.toSI(amount); result = uTo.fromSI(si);
  }

  return (
    <div className={`w-full h-full grid grid-cols-1 ${mode==='all' ? 'md:grid-cols-[220px_1fr]' : ''} gap-3 p-2 text-sm`}>
      {mode==='all' && (
        <div className="space-y-1">
          {GROUPS.map(g => (
            <button key={g.id} onClick={()=>setGroupId(g.id)} className={`w-full text-left px-2 py-2 rounded border ${g.id===groupId?'bg-white/10':''}`}>{g.label}</button>
          ))}
        </div>
      )}
      <div className="rounded p-3 border" style={{ background: themeMode==='dark'?'#0b1220':'#fff' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1">From</label>
            <select className="w-full px-2 py-1 rounded border" value={from} onChange={e=>setFrom(e.target.value)}>
              {group.units.map(u=> (<option key={u.id} value={u.id}>{u.label}</option>))}
            </select>
            <input className="w-full px-2 py-1 rounded border mt-2" type="number" value={amount} onChange={e=>setAmount(parseFloat(e.target.value)||0)} />
          </div>
          <div>
            <label className="block mb-1">To</label>
            <select className="w-full px-2 py-1 rounded border" value={to} onChange={e=>setTo(e.target.value)}>
              {group.units.map(u=> (<option key={u.id} value={u.id}>{u.label}</option>))}
            </select>
            <div className="w-full px-2 py-1 rounded border mt-2 bg-black/5 dark:bg-white/10">{result}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Converter;


