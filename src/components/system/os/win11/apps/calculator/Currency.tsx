'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useWin11Theme } from '../..';

type Rates = Record<string, number>;

const Currency: React.FC = () => {
  const { themeMode } = useWin11Theme();
  const [base, setBase] = useState('USD');
  const [amount, setAmount] = useState(1);
  const [rates, setRates] = useState<Rates>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = async (b: string) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/currency?base=${encodeURIComponent(b)}`);
      const data = await res.json();
      setRates(data.rates || {});
    } catch (e:any) {
      setError('Failed to fetch rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ fetchRates(base); }, [base]);

  const targets = useMemo(()=> Object.keys(rates).slice(0, 12), [rates]);

  return (
    <div className="w-full h-full p-3 text-sm">
      <div className="flex items-center gap-2 mb-3">
        <label>Base</label>
        <input className="px-2 py-1 rounded border w-24" value={base} onChange={e=>setBase(e.target.value.toUpperCase().slice(0,3))} />
        <input className="px-2 py-1 rounded border w-32" type="number" value={amount} onChange={e=>setAmount(parseFloat(e.target.value)||0)} />
      </div>
      {loading && <div>Loading rates…</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && (
        <div className="grid md:grid-cols-3 gap-2">
          {targets.map(code => (
            <div key={code} className="rounded border p-2" style={{ background: themeMode==='dark'?'#0b1220':'#fff' }}>
              <div className="text-xs opacity-70">{code}</div>
              <div className="text-xl">{(amount * (rates[code] || 0)).toFixed(4)}</div>
              <div className="text-[11px] opacity-60">1 {base} = {(rates[code] || 0).toFixed(6)} {code}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Currency;


