'use client';

import React from 'react';

const SettingsPane: React.FC<{
  angleMode: 'DEG' | 'RAD';
  setAngleMode: (m: 'DEG' | 'RAD') => void;
  clearHistory: () => void;
}> = ({ angleMode, setAngleMode, clearHistory }) => {
  return (
    <div className="p-3 text-sm space-y-4">
      <div>
        <div className="font-medium mb-1">Angle units</div>
        <div className="flex items-center gap-2">
          <button className={`px-2 py-1 rounded border ${angleMode==='DEG'?'bg-white/10':''}`} onClick={()=>setAngleMode('DEG')}>Degrees (DEG)</button>
          <button className={`px-2 py-1 rounded border ${angleMode==='RAD'?'bg-white/10':''}`} onClick={()=>setAngleMode('RAD')}>Radians (RAD)</button>
        </div>
      </div>
      <div>
        <div className="font-medium mb-1">History</div>
        <button className="px-2 py-1 rounded border" onClick={clearHistory}>Clear history</button>
      </div>
    </div>
  );
};

export default SettingsPane;


