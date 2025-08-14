'use client';

import React, { useEffect, useState } from 'react';

interface BiosSetupProps {
  onExit: (action: 'save-exit' | 'discard-exit') => void;
}

type Tab = 'main' | 'advanced' | 'chipset' | 'security' | 'boot' | 'tools' | 'exit';

const BiosSetup: React.FC<BiosSetupProps> = ({ onExit }) => {
  const [tab, setTab] = useState<Tab>('main');
  const [mode, setMode] = useState<'ez' | 'advanced'>('advanced');
  const [bootOrder, setBootOrder] = useState<string[]>([
    'Windows Boot Manager',
    'Ubuntu (NVMe: WDC SN850X)',
    'UEFI: BD-RE HL-DT-ST',
    'USB Key',
    'Network (PXE)'
  ]);
  const [secureBoot, setSecureBoot] = useState(true);
  const [tpmEnabled, setTpmEnabled] = useState(true);
  const [xmpEnabled, setXmpEnabled] = useState(true);
  const [sataMode, setSataMode] = useState<'AHCI' | 'RAID'>('AHCI');
  const [timeStr, setTimeStr] = useState<string>(() => new Date().toLocaleTimeString());
  const [biosVersion, setBiosVersion] = useState<string>('V6.00PG');

  // Advanced categories and tuning state (simulated; does not affect real hardware)
  type AdvancedCategory = 'oc' | 'oc-advanced' | 'curve' | 'cores' | 'cpu' | 'memory' | 'memory-adv' | 'voltage' | 'rails' | 'fan' | 'thermal' | 'power' | 'pcie' | 'monitor';
  const advancedCategories: { id: AdvancedCategory; label: string }[] = [
    { id: 'oc', label: 'OC Tweaker' },
    { id: 'oc-advanced', label: 'OC Advanced' },
    { id: 'curve', label: 'Curve Optimizer' },
    { id: 'cores', label: 'CPU Cores' },
    { id: 'cpu', label: 'CPU Configuration' },
    { id: 'memory', label: 'DRAM Timings' },
    { id: 'memory-adv', label: 'DRAM Timings (Adv)' },
    { id: 'voltage', label: 'Voltage Control' },
    { id: 'rails', label: 'Voltage Rails' },
    { id: 'fan', label: 'Fan Control' },
    { id: 'thermal', label: 'Thermal' },
    { id: 'power', label: 'Power Management' },
    { id: 'pcie', label: 'PCIe' },
    { id: 'monitor', label: 'Hardware Monitor' },
  ];
  const [advancedIndex, setAdvancedIndex] = useState<number>(0);

  // OC / GPU / DRAM settings
  const [cpuMultiplier, setCpuMultiplier] = useState<number>(55); // 55 × 100 = 5.5 GHz
  const [baseClock, setBaseClock] = useState<number>(100.0); // MHz
  const [cpuVoltageOffset, setCpuVoltageOffset] = useState<number>(0.0); // V
  const [pboMode, setPboMode] = useState<'Auto' | 'Enabled' | 'Disabled'>('Auto');
  const [gpuCoreOffset, setGpuCoreOffset] = useState<number>(0); // MHz
  const [gpuMemOffset, setGpuMemOffset] = useState<number>(0); // MHz
  const [gpuPowerLimit, setGpuPowerLimit] = useState<number>(100); // %
  const [llcCacheRatio, setLlcCacheRatio] = useState<number>(45); // ring/cache
  const [socVoltage, setSocVoltage] = useState<number>(1.05); // V
  const [vddioMemVoltage, setVddioMemVoltage] = useState<number>(1.35); // V
  const [dramFreqMtz, setDramFreqMtz] = useState<number>(6000); // MT/s
  const [tCL, setTCL] = useState<number>(30);
  const [tRCD, setTRCD] = useState<number>(38);
  const [tRP, setTRP] = useState<number>(38);
  const [tRAS, setTRAS] = useState<number>(96);
  const [fanProfile, setFanProfile] = useState<'Silent' | 'Balanced' | 'Performance' | 'Full Speed' | 'Custom'>('Balanced');
  const [ecoMode, setEcoMode] = useState<boolean>(false);
  const [erpReady, setErpReady] = useState<boolean>(false);
  const [globalCState, setGlobalCState] = useState<'Auto' | 'Enabled' | 'Disabled'>('Auto');
  const [cpb, setCpb] = useState<'Auto' | 'Enabled' | 'Disabled'>('Auto');

  // Per-core enable and per-core max ratio (simulated)
  const [coresEnabled, setCoresEnabled] = useState<boolean[]>(Array.from({ length: 16 }, () => true));
  const [coreMaxRatio, setCoreMaxRatio] = useState<number[]>(Array.from({ length: 16 }, () => 55));

  // Voltage rails advanced
  const [vcoreMode, setVcoreMode] = useState<'Auto' | 'Offset' | 'Override'>('Auto');
  const [vcoreOffset, setVcoreOffset] = useState<number>(0.000);
  const [vcoreOverride, setVcoreOverride] = useState<number>(1.250);
  const [llcLevel, setLlcLevel] = useState<'Auto' | 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4' | 'Level 5'>('Auto');
  const [vddgCcd, setVddgCcd] = useState<number>(1.050);
  const [vddgIod, setVddgIod] = useState<number>(1.050);
  const [vddp, setVddp] = useState<number>(0.900);
  const [dramVoltage, setDramVoltage] = useState<number>(1.350);

  // Memory advanced timings and features
  const [xmpProfile, setXmpProfile] = useState<'Auto' | 'Profile 1' | 'Profile 2'>('Auto');
  const [commandRate, setCommandRate] = useState<'1T' | '2T'>('2T');
  const [gearDownMode, setGearDownMode] = useState<boolean>(true);
  const [tFAW, setTFAW] = useState<number>(32);
  const [tRFC, setTRFC] = useState<number>(560);
  const [tRRDS, setTRRDS] = useState<number>(6);
  const [tRRDL, setTRRDL] = useState<number>(8);
  const [tWR, setTWR] = useState<number>(24);
  const [tWTRS, setTWTRS] = useState<number>(4);
  const [tWTRL, setTWTRL] = useState<number>(12);
  const [tCWL, setTCWL] = useState<number>(30);

  // Thermal controls
  const [cpuTempTarget, setCpuTempTarget] = useState<number>(75);
  const [cpuThrottleTemp, setCpuThrottleTemp] = useState<number>(90);
  const [fanStopBelowEnabled, setFanStopBelowEnabled] = useState<boolean>(false);
  const [fanStopTempCpu, setFanStopTempCpu] = useState<number>(35);
  const [fanStopTempGpu, setFanStopTempGpu] = useState<number>(35);
  const [fanHysteresisC, setFanHysteresisC] = useState<number>(3);

  // PCIe per-slot speed
  const [pcieSlot1Speed, setPcieSlot1Speed] = useState<'Auto' | 'Gen3' | 'Gen4' | 'Gen5'>('Auto');
  const [pcieSlot2Speed, setPcieSlot2Speed] = useState<'Auto' | 'Gen3' | 'Gen4' | 'Gen5'>('Auto');

  // Monitors (simulated)
  const [cpuTempC, setCpuTempC] = useState<number>(46);
  const [gpuTempC, setGpuTempC] = useState<number>(44);
  const [cpuFanRpm, setCpuFanRpm] = useState<number>(900);
  const [gpuFanRpm, setGpuFanRpm] = useState<number>(800);
  // Curve optimizer (per-core offsets)
  const [curveOffsets, setCurveOffsets] = useState<number[]>(Array.from({ length: 16 }, () => 0));
  // Fan curve (custom profile): list of points (temperature °C, PWM %)
  type FanCurvePoint = { t: number; p: number };
  const [fanCurvePoints, setFanCurvePoints] = useState<FanCurvePoint[]>([
    { t: 30, p: 20 },
    { t: 45, p: 35 },
    { t: 60, p: 55 },
    { t: 75, p: 75 },
    { t: 85, p: 95 },
  ]);

  // Helpers
  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
  const step = (v: number, delta: number, min: number, max: number) => clamp(parseFloat((v + delta).toFixed(3)), min, max);
  const cpuFrequencyGhz = () => ((cpuMultiplier * baseClock) / 1000).toFixed(2);
  const gpuEffectiveCore = () => 2520 + gpuCoreOffset; // demo base boost
  const gpuEffectiveMem = () => 21000 + gpuMemOffset; // demo effective
  const interpolatePwm = (points: FanCurvePoint[], temperatureC: number) => {
    const pts = [...points].sort((a, b) => a.t - b.t);
    if (temperatureC <= pts[0].t) return pts[0].p;
    if (temperatureC >= pts[pts.length - 1].t) return pts[pts.length - 1].p;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      if (temperatureC >= a.t && temperatureC <= b.t) {
        const ratio = (temperatureC - a.t) / (b.t - a.t);
        return Math.round(a.p + ratio * (b.p - a.p));
      }
    }
    return pts[0].p;
  };

  // Boot tab options
  const [fastBoot, setFastBoot] = useState<boolean>(true);
  const [csm, setCsm] = useState<boolean>(false);
  const [bootLogo, setBootLogo] = useState<boolean>(true);
  const [bootBeep, setBootBeep] = useState<boolean>(false);
  const [bootTimeout, setBootTimeout] = useState<number>(5);

  // Security
  const [supervisorPasswordSet, setSupervisorPasswordSet] = useState<boolean>(false);
  const [userPasswordSet, setUserPasswordSet] = useState<boolean>(false);

  // Chipset
  const [above4G, setAbove4G] = useState<boolean>(true);
  const [resizeBar, setResizeBar] = useState<boolean>(true);
  const [aspm, setAspm] = useState<'Auto' | 'Off' | 'L1'>('Auto');
  const [pcieLinkSpeed, setPcieLinkSpeed] = useState<'Auto' | 'Gen3' | 'Gen4' | 'Gen5'>('Auto');
  const [igpuMode, setIgpuMode] = useState<'Auto' | 'Disabled' | 'Enabled'>('Auto');
  const [igpuMem, setIgpuMem] = useState<'Auto' | '512M' | '1G' | '2G'>('Auto');
  const [srIov, setSrIov] = useState<boolean>(true);

  // Persist settings
  const saveToLocalStorage = () => {
    try {
      const payload = {
        cpuMultiplier,
        baseClock,
        cpuVoltageOffset,
        pboMode,
        gpuCoreOffset,
        gpuMemOffset,
        gpuPowerLimit,
        llcCacheRatio,
        socVoltage,
        vddioMemVoltage,
        curveOffsets,
        fanCurvePoints,
        dramFreqMtz,
        tCL,
        tRCD,
        tRP,
        tRAS,
        fanProfile,
        ecoMode,
        erpReady,
        globalCState,
        cpb,
        xmpEnabled,
        sataMode,
        secureBoot,
        tpmEnabled,
        fastBoot,
        csm,
        bootLogo,
        bootBeep,
        bootTimeout,
        supervisorPasswordSet,
        userPasswordSet,
        above4G,
        resizeBar,
        aspm,
        pcieLinkSpeed,
        igpuMode,
        igpuMem,
        srIov,
        biosVersion,
        coresEnabled,
        coreMaxRatio,
        vcoreMode,
        vcoreOffset,
        vcoreOverride,
        llcLevel,
        vddgCcd,
        vddgIod,
        vddp,
        dramVoltage,
        xmpProfile,
        commandRate,
        gearDownMode,
        tFAW,
        tRFC,
        tRRDS,
        tRRDL,
        tWR,
        tWTRS,
        tWTRL,
        tCWL,
        cpuTempTarget,
        cpuThrottleTemp,
        fanStopBelowEnabled,
        fanStopTempCpu,
        fanStopTempGpu,
        fanHysteresisC,
        pcieSlot1Speed,
        pcieSlot2Speed,
      };
      window.localStorage.setItem('bios.settings', JSON.stringify(payload));
    } catch {}
  };

  useEffect(() => {
    const i = setInterval(() => setTimeStr(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleExit('discard-exit');
      if ((e.key.toLowerCase() === 'f10')) handleExit('save-exit');
      if (e.key.toLowerCase() === 'f7') { e.preventDefault(); setMode((m) => m === 'advanced' ? 'ez' : 'advanced'); }
      if (e.key.toLowerCase() === 'f5') {
        e.preventDefault();
        // Load Optimized Defaults
        setCpuMultiplier(55);
        setBaseClock(100.0);
        setCpuVoltageOffset(0.0);
        setPboMode('Auto');
        setGpuCoreOffset(0);
        setGpuMemOffset(0);
        setGpuPowerLimit(100);
        setDramFreqMtz(6000);
        setTCL(30);
        setTRCD(38);
        setTRP(38);
        setTRAS(96);
        setFanProfile('Balanced');
        setEcoMode(false);
        setErpReady(false);
        setXmpEnabled(true);
        setSataMode('AHCI');
        setFastBoot(true);
        setCsm(false);
        setBootLogo(true);
        setBootBeep(false);
        setBootTimeout(5);
        setSupervisorPasswordSet(false);
        setUserPasswordSet(false);
        setAbove4G(true);
        setResizeBar(true);
        setAspm('Auto');
        setPcieLinkSpeed('Auto');
        setIgpuMode('Auto');
        setIgpuMem('Auto');
        setSrIov(true);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setTab((prev) => {
          const order: Tab[] = ['main', 'advanced', 'chipset', 'security', 'boot', 'tools', 'exit'];
          const idx = order.indexOf(prev);
          return order[(idx + order.length - 1) % order.length];
        });
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setTab((prev) => {
          const order: Tab[] = ['main', 'advanced', 'chipset', 'security', 'boot', 'tools', 'exit'];
          const idx = order.indexOf(prev);
          return order[(idx + 1) % order.length];
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onExit]);

  // Advanced category keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (tab !== 'advanced') return;
      if (e.key === 'ArrowUp') { e.preventDefault(); setAdvancedIndex((i) => (i + advancedCategories.length - 1) % advancedCategories.length); }
      if (e.key === 'ArrowDown') { e.preventDefault(); setAdvancedIndex((i) => (i + 1) % advancedCategories.length); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [tab]);

  // Load saved settings on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('bios.settings');
      if (!raw) return;
      const s = JSON.parse(raw);
      if (typeof s.cpuMultiplier === 'number') setCpuMultiplier(s.cpuMultiplier);
      if (typeof s.baseClock === 'number') setBaseClock(s.baseClock);
      if (typeof s.cpuVoltageOffset === 'number') setCpuVoltageOffset(s.cpuVoltageOffset);
      if (typeof s.pboMode === 'string') setPboMode(s.pboMode);
      if (typeof s.gpuCoreOffset === 'number') setGpuCoreOffset(s.gpuCoreOffset);
      if (typeof s.gpuMemOffset === 'number') setGpuMemOffset(s.gpuMemOffset);
      if (typeof s.gpuPowerLimit === 'number') setGpuPowerLimit(s.gpuPowerLimit);
      if (typeof s.llcCacheRatio === 'number') setLlcCacheRatio(s.llcCacheRatio);
      if (typeof s.socVoltage === 'number') setSocVoltage(s.socVoltage);
      if (typeof s.vddioMemVoltage === 'number') setVddioMemVoltage(s.vddioMemVoltage);
      if (Array.isArray(s.curveOffsets)) setCurveOffsets(s.curveOffsets.map((n: any) => typeof n === 'number' ? Math.max(-30, Math.min(30, Math.round(n))) : 0).slice(0, 16));
      if (Array.isArray(s.fanCurvePoints)) {
        const cleaned = s.fanCurvePoints
          .map((p: any) => ({ t: Number(p.t), p: Number(p.p) }))
          .filter((p: any) => Number.isFinite(p.t) && Number.isFinite(p.p))
          .map((p: any) => ({ t: Math.max(20, Math.min(95, Math.round(p.t))), p: Math.max(0, Math.min(100, Math.round(p.p))) }))
          .sort((a: FanCurvePoint, b: FanCurvePoint) => a.t - b.t);
        if (cleaned.length >= 2) setFanCurvePoints(cleaned);
      }
      if (typeof s.dramFreqMtz === 'number') setDramFreqMtz(s.dramFreqMtz);
      if (typeof s.tCL === 'number') setTCL(s.tCL);
      if (typeof s.tRCD === 'number') setTRCD(s.tRCD);
      if (typeof s.tRP === 'number') setTRP(s.tRP);
      if (typeof s.tRAS === 'number') setTRAS(s.tRAS);
      if (typeof s.fanProfile === 'string') setFanProfile(s.fanProfile);
      if (typeof s.ecoMode === 'boolean') setEcoMode(s.ecoMode);
      if (typeof s.erpReady === 'boolean') setErpReady(s.erpReady);
      if (typeof s.globalCState === 'string') setGlobalCState(s.globalCState);
      if (typeof s.cpb === 'string') setCpb(s.cpb);
      if (typeof s.xmpEnabled === 'boolean') setXmpEnabled(s.xmpEnabled);
      if (typeof s.sataMode === 'string') setSataMode(s.sataMode);
      if (typeof s.secureBoot === 'boolean') setSecureBoot(s.secureBoot);
      if (typeof s.tpmEnabled === 'boolean') setTpmEnabled(s.tpmEnabled);
      if (typeof s.fastBoot === 'boolean') setFastBoot(s.fastBoot);
      if (typeof s.csm === 'boolean') setCsm(s.csm);
      if (typeof s.bootLogo === 'boolean') setBootLogo(s.bootLogo);
      if (typeof s.bootBeep === 'boolean') setBootBeep(s.bootBeep);
      if (typeof s.bootTimeout === 'number') setBootTimeout(s.bootTimeout);
      if (typeof s.supervisorPasswordSet === 'boolean') setSupervisorPasswordSet(s.supervisorPasswordSet);
      if (typeof s.userPasswordSet === 'boolean') setUserPasswordSet(s.userPasswordSet);
      if (typeof s.above4G === 'boolean') setAbove4G(s.above4G);
      if (typeof s.resizeBar === 'boolean') setResizeBar(s.resizeBar);
      if (typeof s.aspm === 'string') setAspm(s.aspm);
      if (typeof s.pcieLinkSpeed === 'string') setPcieLinkSpeed(s.pcieLinkSpeed);
      if (typeof s.igpuMode === 'string') setIgpuMode(s.igpuMode);
      if (typeof s.igpuMem === 'string') setIgpuMem(s.igpuMem);
      if (typeof s.srIov === 'boolean') setSrIov(s.srIov);
      if (typeof s.biosVersion === 'string') setBiosVersion(s.biosVersion);
      if (Array.isArray(s.coresEnabled)) setCoresEnabled(s.coresEnabled.map((v: any) => Boolean(v)).slice(0, 16));
      if (Array.isArray(s.coreMaxRatio)) setCoreMaxRatio(s.coreMaxRatio.map((n: any) => typeof n === 'number' ? Math.max(35, Math.min(60, Math.round(n))) : 55).slice(0, 16));
      if (typeof s.vcoreMode === 'string') setVcoreMode(s.vcoreMode);
      if (typeof s.vcoreOffset === 'number') setVcoreOffset(s.vcoreOffset);
      if (typeof s.vcoreOverride === 'number') setVcoreOverride(s.vcoreOverride);
      if (typeof s.llcLevel === 'string') setLlcLevel(s.llcLevel);
      if (typeof s.vddgCcd === 'number') setVddgCcd(s.vddgCcd);
      if (typeof s.vddgIod === 'number') setVddgIod(s.vddgIod);
      if (typeof s.vddp === 'number') setVddp(s.vddp);
      if (typeof s.dramVoltage === 'number') setDramVoltage(s.dramVoltage);
      if (typeof s.xmpProfile === 'string') setXmpProfile(s.xmpProfile);
      if (typeof s.commandRate === 'string') setCommandRate(s.commandRate);
      if (typeof s.gearDownMode === 'boolean') setGearDownMode(s.gearDownMode);
      if (typeof s.tFAW === 'number') setTFAW(s.tFAW);
      if (typeof s.tRFC === 'number') setTRFC(s.tRFC);
      if (typeof s.tRRDS === 'number') setTRRDS(s.tRRDS);
      if (typeof s.tRRDL === 'number') setTRRDL(s.tRRDL);
      if (typeof s.tWR === 'number') setTWR(s.tWR);
      if (typeof s.tWTRS === 'number') setTWTRS(s.tWTRS);
      if (typeof s.tWTRL === 'number') setTWTRL(s.tWTRL);
      if (typeof s.tCWL === 'number') setTCWL(s.tCWL);
      if (typeof s.cpuTempTarget === 'number') setCpuTempTarget(s.cpuTempTarget);
      if (typeof s.cpuThrottleTemp === 'number') setCpuThrottleTemp(s.cpuThrottleTemp);
      if (typeof s.fanStopBelowEnabled === 'boolean') setFanStopBelowEnabled(s.fanStopBelowEnabled);
      if (typeof s.fanStopTempCpu === 'number') setFanStopTempCpu(s.fanStopTempCpu);
      if (typeof s.fanStopTempGpu === 'number') setFanStopTempGpu(s.fanStopTempGpu);
      if (typeof s.fanHysteresisC === 'number') setFanHysteresisC(s.fanHysteresisC);
      if (typeof s.pcieSlot1Speed === 'string') setPcieSlot1Speed(s.pcieSlot1Speed);
      if (typeof s.pcieSlot2Speed === 'string') setPcieSlot2Speed(s.pcieSlot2Speed);
    } catch {}
  }, []);

  // Simulated sensors periodic update
  useEffect(() => {
    const t = setInterval(() => {
      const nextCpu = Math.min(85, Math.max(35, Math.round(cpuTempC + (Math.random() * 4 - 2))));
      const nextGpu = Math.min(84, Math.max(32, Math.round(gpuTempC + (Math.random() * 4 - 2))));
      setCpuTempC(nextCpu);
      setGpuTempC(nextGpu);
      let cpuPwm = 50;
      let gpuPwm = 45;
      if (fanProfile === 'Custom') {
        cpuPwm = interpolatePwm(fanCurvePoints, nextCpu);
        gpuPwm = interpolatePwm(fanCurvePoints, nextGpu);
      } else {
        const base = fanProfile === 'Silent' ? 25 : fanProfile === 'Balanced' ? 45 : fanProfile === 'Performance' ? 65 : 100;
        cpuPwm = Math.max(base, Math.min(100, Math.round((nextCpu - 30) * 1.5)));
        gpuPwm = Math.max(base - 5, Math.min(100, Math.round((nextGpu - 30) * 1.4)));
      }
      const cpuRpm = Math.round(600 + (cpuPwm / 100) * (2300 - 600));
      const gpuRpm = Math.round(600 + (gpuPwm / 100) * (2400 - 600));
      setCpuFanRpm(cpuRpm);
      setGpuFanRpm(gpuRpm);
    }, 1200);
    return () => clearInterval(t);
  }, [fanProfile, fanCurvePoints, cpuTempC, gpuTempC]);

  const handleExit = (action: 'save-exit' | 'discard-exit') => {
    if (action === 'save-exit') saveToLocalStorage();
    onExit(action);
  };

  const moveBootItem = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= bootOrder.length) return;
    const copy = [...bootOrder];
    const [item] = copy.splice(index, 1);
    copy.splice(target, 0, item);
    setBootOrder(copy);
  };

  return (
    <div className="w-full h-full bg-[#001428] text-[#cde8ff] font-mono text-[13px]">
      <div className="h-10 flex items-center justify-between px-4 bg-[#003a73] text-[#d7ecff]">
        <div className="font-bold tracking-wide">Phoenix SecureCore Setup Utility</div>
        <div className="text-xs">{timeStr}</div>
      </div>
      <div className="h-8 flex items-center gap-6 px-4 bg-[#002a52] text-[#a8d8ff]">
        {(['main','advanced','chipset','security','boot','tools','exit'] as Tab[]).map((t) => (
          <div key={t} className={
            'uppercase text-xs tracking-wider ' + (tab === t ? 'text-white underline underline-offset-4' : '')
          }>{t}</div>
        ))}
      </div>

      <div className="p-6 grid grid-cols-3 gap-4">
        <div className="col-span-2 border border-[#1f4f80] rounded">
          <div className="px-3 py-2 bg-[#002a52] text-[#a8d8ff] uppercase text-xs">{tab}</div>
          <div className="p-4 space-y-3">
            {tab === 'main' && (
              <>
                <div className="flex items-center justify-between">
                  <span>Mode</span>
                  <button className="px-2 py-1 bg-[#003a73] rounded" onClick={() => setMode(m => m === 'advanced' ? 'ez' : 'advanced')}>{mode === 'advanced' ? 'Advanced Mode (F7)' : 'EZ Mode (F7)'}</button>
                </div>
                <div>System Time: <span className="text-white">{timeStr}</span></div>
                <div>System Date: <span className="text-white">{new Date().toLocaleDateString()}</span></div>
                <div>BIOS Version: <span className="text-white">{biosVersion}</span></div>
                <div>CPU Type: <span className="text-white">AMD Ryzen 9 7950X3D</span></div>
                <div>Total Memory: <span className="text-white">65536 MB</span></div>
              </>
            )}
            {tab === 'chipset' && (
              <>
                <RowToggle label="Above 4G Decoding" enabled={above4G} onToggle={() => setAbove4G(v => !v)} />
                <RowToggle label="Resizable BAR" enabled={resizeBar} onToggle={() => setResizeBar(v => !v)} />
                <RowSelect label="PCIe ASPM" value={aspm} options={["Auto","Off","L1"]} onChange={(v) => setAspm(v as typeof aspm)} />
                <RowSelect label="PCIe Link Speed" value={pcieLinkSpeed} options={["Auto","Gen3","Gen4","Gen5"]} onChange={(v) => setPcieLinkSpeed(v as typeof pcieLinkSpeed)} />
                <RowSelect label="iGPU" value={igpuMode} options={["Auto","Disabled","Enabled"]} onChange={(v) => setIgpuMode(v as typeof igpuMode)} />
                <RowSelect label="iGPU Memory" value={igpuMem} options={["Auto","512M","1G","2G"]} onChange={(v) => setIgpuMem(v as typeof igpuMem)} />
                <RowToggle label="SR-IOV" enabled={srIov} onToggle={() => setSrIov(v => !v)} />
              </>
            )}
            {tab === 'advanced' && (
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-2 border border-[#1f4f80] rounded overflow-hidden">
                  <div className="px-3 py-2 bg-[#002a52] text-[#a8d8ff] uppercase text-xs">Categories</div>
                  <div className="p-2">
                    {advancedCategories.map((c, idx) => (
                      <div key={c.id} onClick={() => setAdvancedIndex(idx)} className={'px-2 py-1 rounded cursor-pointer ' + (idx === advancedIndex ? 'bg-[#003a73] text-white' : 'hover:bg-[#003a73]/40')}>{c.label}</div>
                    ))}
                  </div>
                </div>
                <div className="col-span-3 border border-[#1f4f80] rounded">
                  <div className="px-3 py-2 bg-[#002a52] text-[#a8d8ff] uppercase text-xs">{advancedCategories[advancedIndex].label}</div>
                  <div className="p-3 space-y-3">
                    {/* OC Tweaker */}
                    {advancedCategories[advancedIndex].id === 'oc' && (
                      <>
                        <RowNumber label="CPU Multiplier (Ratio)" value={cpuMultiplier} unit="×" onDec={() => setCpuMultiplier((v) => Math.max(35, v - 1))} onInc={() => setCpuMultiplier((v) => Math.min(60, v + 1))} hint="35..60" />
                        <RowNumber label="Base Clock (BCLK)" value={baseClock} unit="MHz" precision={1} onDec={() => setBaseClock((v) => step(v, -0.5, 95, 105))} onInc={() => setBaseClock((v) => step(v, +0.5, 95, 105))} hint="95..105 MHz" />
                        <RowStatic label="Effective CPU Frequency" value={`${cpuFrequencyGhz()} GHz`} />
                        <RowSelect label="Precision Boost Overdrive (PBO)" value={pboMode} options={['Auto','Enabled','Disabled']} onChange={(v) => setPboMode(v as typeof pboMode)} />
                        <RowNumber label="GPU Core Offset" value={gpuCoreOffset} unit="MHz" onDec={() => setGpuCoreOffset((v) => Math.max(-300, v - 15))} onInc={() => setGpuCoreOffset((v) => Math.min(300, v + 15))} hint="-300..+300" />
                        <RowNumber label="GPU Memory Offset" value={gpuMemOffset} unit="MHz" onDec={() => setGpuMemOffset((v) => Math.max(-1500, v - 50))} onInc={() => setGpuMemOffset((v) => Math.min(1500, v + 50))} hint="-1500..+1500" />
                        <RowNumber label="GPU Power Limit" value={gpuPowerLimit} unit="%" onDec={() => setGpuPowerLimit((v) => Math.max(90, v - 1))} onInc={() => setGpuPowerLimit((v) => Math.min(120, v + 1))} hint="90..120%" />
                        <RowStatic label="GPU Effective Core" value={`${gpuEffectiveCore()} MHz`} />
                        <RowStatic label="GPU Effective Memory" value={`${gpuEffectiveMem()} MT/s`} />
                      </>
                    )}
                    {advancedCategories[advancedIndex].id === 'oc-advanced' && (
                      <>
                        <RowNumber label="LLC/Cache Ratio" value={llcCacheRatio} unit="×" onDec={() => setLlcCacheRatio(v => Math.max(35, v - 1))} onInc={() => setLlcCacheRatio(v => Math.min(55, v + 1))} hint="35..55" />
                        <RowNumber label="SoC Voltage" value={socVoltage} unit="V" precision={3} onDec={() => setSocVoltage(v => step(v, -0.005, 0.900, 1.200))} onInc={() => setSocVoltage(v => step(v, +0.005, 0.900, 1.200))} hint="0.900..1.200V" />
                        <RowNumber label="VDDIO MEM" value={vddioMemVoltage} unit="V" precision={3} onDec={() => setVddioMemVoltage(v => step(v, -0.005, 1.200, 1.450))} onInc={() => setVddioMemVoltage(v => step(v, +0.005, 1.200, 1.450))} hint="1.200..1.450V" />
                      </>
                    )}
                    {advancedCategories[advancedIndex].id === 'curve' && (
                      <>
                        <RowSelect label="Global C-State Control" value={globalCState} options={['Auto','Enabled','Disabled']} onChange={(v) => setGlobalCState(v as typeof globalCState)} />
                        <RowSelect label="Core Performance Boost (CPB)" value={cpb} options={['Auto','Enabled','Disabled']} onChange={(v) => setCpb(v as typeof cpb)} />
                        <div className="pt-2 text-[#a8d8ff] text-xs uppercase">Per-Core Curve Offset</div>
                        <div className="grid grid-cols-4 gap-2">
                          {curveOffsets.map((val, idx) => (
                            <div key={idx} className="flex items-center justify-between px-2 py-1 bg-[#001b34] rounded">
                              <span>Core {idx}</span>
                              <div className="flex items-center gap-1">
                                <button className="px-2 py-1 bg-[#003a73] rounded" onClick={() => setCurveOffsets(prev => prev.map((v, i) => i === idx ? Math.max(-30, v - 1) : v))}>-</button>
                                <span className="w-14 text-center text-white">{val} steps</span>
                                <button className="px-2 py-1 bg-[#003a73] rounded" onClick={() => setCurveOffsets(prev => prev.map((v, i) => i === idx ? Math.min(30, v + 1) : v))}>+</button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <button className="px-2 py-1 bg-[#003a73] rounded" onClick={() => setCurveOffsets(curveOffsets.map(() => 0))}>Reset All</button>
                          <button className="px-2 py-1 bg-[#003a73] rounded" onClick={() => setCurveOffsets(curveOffsets.map((_, i) => (i % 2 === 0 ? -10 : -5)))}>Auto-Negative</button>
                        </div>
                      </>
                    )}
                    {/* CPU Config */}
                    {advancedCategories[advancedIndex].id === 'cpu' && (
                      <>
                        <RowToggle label="SVM (Virtualization)" enabled={true} onToggle={() => {}} readOnly />
                        <RowToggle label="SMT (Simultaneous Multi-Threading)" enabled={true} onToggle={() => {}} readOnly />
                        <RowToggle label="CPPC (Preferred Cores)" enabled={true} onToggle={() => {}} readOnly />
                        <RowNumber label="CPU Voltage Offset" value={cpuVoltageOffset} unit="V" precision={3} onDec={() => setCpuVoltageOffset((v) => step(v, -0.005, -0.100, 0.200))} onInc={() => setCpuVoltageOffset((v) => step(v, +0.005, -0.100, 0.200))} hint="-0.100..+0.200V" />
                      </>
                    )}
                    {/* DRAM */}
                    {advancedCategories[advancedIndex].id === 'memory' && (
                      <>
                        <RowToggle label="Extreme Memory Profile (XMP)" enabled={xmpEnabled} onToggle={() => setXmpEnabled((v) => !v)} />
                        <RowNumber label="Memory Frequency" value={dramFreqMtz} unit="MT/s" onDec={() => setDramFreqMtz((v) => Math.max(4800, v - 200))} onInc={() => setDramFreqMtz((v) => Math.min(8000, v + 200))} hint="4800..8000 MT/s" />
                        <div className="pt-2 text-[#a8d8ff] text-xs uppercase">Primary Timings</div>
                        <RowNumber label="tCL" value={tCL} onDec={() => setTCL((v) => Math.max(26, v - 1))} onInc={() => setTCL((v) => Math.min(48, v + 1))} />
                        <RowNumber label="tRCD" value={tRCD} onDec={() => setTRCD((v) => Math.max(30, v - 1))} onInc={() => setTRCD((v) => Math.min(54, v + 1))} />
                        <RowNumber label="tRP" value={tRP} onDec={() => setTRP((v) => Math.max(30, v - 1))} onInc={() => setTRP((v) => Math.min(54, v + 1))} />
                        <RowNumber label="tRAS" value={tRAS} onDec={() => setTRAS((v) => Math.max(60, v - 1))} onInc={() => setTRAS((v) => Math.min(120, v + 1))} />
                      </>
                    )}
                    {/* Voltage */}
                    {advancedCategories[advancedIndex].id === 'voltage' && (
                      <>
                        <RowSelect label="SATA Mode" value={sataMode} options={['AHCI','RAID']} onChange={(v) => setSataMode(v as typeof sataMode)} />
                        <RowNumber label="CPU Voltage Offset" value={cpuVoltageOffset} unit="V" precision={3} onDec={() => setCpuVoltageOffset((v) => step(v, -0.005, -0.100, 0.200))} onInc={() => setCpuVoltageOffset((v) => step(v, +0.005, -0.100, 0.200))} />
                        <RowStatic label="Warning" value="Overvolting/undervolting may reduce stability." />
                      </>
                    )}
                    {/* Fan */}
                    {advancedCategories[advancedIndex].id === 'fan' && (
                      <>
                        <RowSelect label="Fan Profile" value={fanProfile} options={['Silent','Balanced','Performance','Full Speed','Custom']} onChange={(v) => setFanProfile(v as typeof fanProfile)} />
                        {fanProfile === 'Custom' && (
                          <FanCurveEditor points={fanCurvePoints} onChange={setFanCurvePoints} />
                        )}
                        <RowStatic label="CPU Fan" value={`${cpuFanRpm} RPM`} />
                        <RowStatic label="GPU Fan" value={`${gpuFanRpm} RPM`} />
                      </>
                    )}
                    {/* Power */}
                    {advancedCategories[advancedIndex].id === 'power' && (
                      <>
                        <RowToggle label="Eco Mode (CPU)" enabled={ecoMode} onToggle={() => setEcoMode((v) => !v)} />
                        <RowToggle label="ErP Ready (S5)" enabled={erpReady} onToggle={() => setErpReady((v) => !v)} />
                        <RowStatic label="Notes" value="Eco reduces PPT; ErP lowers standby power." />
                      </>
                    )}
                    {/* Monitor */}
                    {advancedCategories[advancedIndex].id === 'monitor' && (
                      <>
                        <RowStatic label="CPU Temperature" value={`${cpuTempC} °C`} />
                        <RowStatic label="GPU Temperature" value={`${gpuTempC} °C`} />
                        <RowStatic label="CPU Frequency" value={`${cpuFrequencyGhz()} GHz`} />
                        <RowStatic label="GPU Core (eff)" value={`${gpuEffectiveCore()} MHz`} />
                        <RowStatic label="GPU Memory (eff)" value={`${gpuEffectiveMem()} MT/s`} />
                        <RowStatic label="CPU Fan" value={`${cpuFanRpm} RPM`} />
                        <RowStatic label="GPU Fan" value={`${gpuFanRpm} RPM`} />
                      </>
                    )}
                  </div>
                </div>
                </div>
            )}
            {tab === 'security' && (
              <>
                <div className="flex items-center justify-between">
                  <span>Secure Boot</span>
                  <button className="px-2 py-1 bg-[#003a73] rounded" onClick={() => setSecureBoot(v => !v)}>{secureBoot ? 'Enabled' : 'Disabled'}</button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Supervisor Password</span>
                  <button className="px-2 py-1 bg-[#003a73] rounded" onClick={() => setSupervisorPasswordSet(v => !v)}>{supervisorPasswordSet ? 'Set' : 'Not Set'}</button>
                </div>
                <div className="flex items-center justify-between">
                  <span>User Password</span>
                  <button className="px-2 py-1 bg-[#003a73] rounded" onClick={() => setUserPasswordSet(v => !v)}>{userPasswordSet ? 'Set' : 'Not Set'}</button>
                </div>
                <div className="flex items-center justify-between">
                  <span>TPM 2.0</span>
                  <button className="px-2 py-1 bg-[#003a73] rounded" onClick={() => setTpmEnabled(v => !v)}>{tpmEnabled ? 'Enabled' : 'Disabled'}</button>
                </div>
              </>
            )}
            {tab === 'boot' && (
              <>
                <div className="text-[#a8d8ff] mb-2">Boot Priority Order</div>
                <div className="space-y-2">
                  {bootOrder.map((item, idx) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="w-6 text-right">{idx + 1}.</div>
                      <div className="flex-1 text-white">{item}</div>
                      <div className="flex gap-1">
                        <button className="px-2 py-1 bg-[#003a73] rounded" onClick={() => moveBootItem(idx, -1)}>↑</button>
                        <button className="px-2 py-1 bg-[#003a73] rounded" onClick={() => moveBootItem(idx, +1)}>↓</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-[#1f4f80] space-y-2">
                  <RowToggle label="Fast Boot" enabled={fastBoot} onToggle={() => setFastBoot(v => !v)} />
                  <RowToggle label="CSM (Compatibility Support Module)" enabled={csm} onToggle={() => setCsm(v => !v)} />
                  <RowToggle label="Show Boot Logo" enabled={bootLogo} onToggle={() => setBootLogo(v => !v)} />
                  <RowToggle label="POST Beep" enabled={bootBeep} onToggle={() => setBootBeep(v => !v)} />
                  <RowNumber label="Boot Menu Timeout" value={bootTimeout} unit="s" onDec={() => setBootTimeout(v => Math.max(0, v - 1))} onInc={() => setBootTimeout(v => Math.min(30, v + 1))} />
                </div>
              </>
            )}
            {tab === 'tools' && (
              <div className="space-y-3">
                <RowStatic label="System Info" value={`Phoenix Modern • ${biosVersion}`} />
                <div className="flex items-center gap-2">
                  <button className="px-3 py-2 bg-[#003a73] rounded" onClick={() => setBiosVersion('V6.00PG')}>Set Version: V6.00PG</button>
                  <button className="px-3 py-2 bg-[#003a73] rounded" onClick={() => setBiosVersion('V6.10 Mod')}>Set Version: V6.10 Mod</button>
                </div>
                <div className="pt-2 text-[#a8d8ff] text-xs uppercase">Profiles</div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-2 bg-[#003a73] rounded" onClick={() => { try { localStorage.setItem('bios.profile.1', localStorage.getItem('bios.settings') ?? ''); } catch {} }}>Save Profile 1</button>
                  <button className="px-3 py-2 bg-[#003a73] rounded" onClick={() => { try { const raw = localStorage.getItem('bios.profile.1'); if (raw) { localStorage.setItem('bios.settings', raw); location.reload(); } } catch {} }}>Load Profile 1</button>
                </div>
                <div className="pt-3 border-t border-[#1f4f80]"></div>
                <div className="text-[#a8d8ff] text-xs uppercase">BIOS Update (Flash)</div>
                <BiosUpdateWidget onVersionChange={(ver) => setBiosVersion(ver)} />
              </div>
            )}
            {tab === 'exit' && (
              <div className="space-y-3">
                <button className="px-3 py-2 bg-[#0a5aa8] rounded text-white" onClick={() => handleExit('save-exit')}>Save Changes and Exit (F10)</button>
                <button className="px-3 py-2 bg-[#003a73] rounded" onClick={() => handleExit('discard-exit')}>Discard Changes and Exit (Esc)</button>
                <button className="px-3 py-2 bg-[#003a73] rounded" onClick={() => {
                  // Load Optimized Defaults
                  setCpuMultiplier(55);
                  setBaseClock(100.0);
                  setCpuVoltageOffset(0.0);
                  setPboMode('Auto');
                  setGpuCoreOffset(0);
                  setGpuMemOffset(0);
                  setGpuPowerLimit(100);
                  setDramFreqMtz(6000);
                  setTCL(30);
                  setTRCD(38);
                  setTRP(38);
                  setTRAS(96);
                  setFanProfile('Balanced');
                  setEcoMode(false);
                  setErpReady(false);
                  setXmpEnabled(true);
                  setSataMode('AHCI');
                }}>Load Optimized Defaults</button>
              </div>
            )}
          </div>
        </div>

        <div className="border border-[#1f4f80] rounded p-4 text-xs leading-6">
          <div className="text-[#a8d8ff] mb-2">Help</div>
          <div>• Arrow Left/Right: Switch Tab</div>
          <div>• Esc: Discard and Exit</div>
          <div>• F10: Save and Exit</div>
          <div>• ↑/↓: Navigate Advanced Categories</div>
          <div>• F7: Toggle EZ/Advanced Mode</div>
          <div>• F5: Load Optimized Defaults</div>
          <div>• Click ± to tune values (simulation only)</div>
        </div>
      </div>
    </div>
  );
};

// Row components
interface RowPropsBase { label: string }

const RowStatic: React.FC<RowPropsBase & { value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span>{label}</span>
    <span className="text-white">{value}</span>
  </div>
);

const RowToggle: React.FC<RowPropsBase & { enabled: boolean; onToggle: () => void; readOnly?: boolean }> = ({ label, enabled, onToggle, readOnly }) => (
  <div className="flex items-center justify-between">
    <span>{label}</span>
    <button className={'px-2 py-1 rounded ' + (readOnly ? 'bg-[#002a52] cursor-not-allowed' : 'bg-[#003a73]')} onClick={() => !readOnly && onToggle()}>{enabled ? 'Enabled' : 'Disabled'}</button>
  </div>
);

const RowSelect: React.FC<RowPropsBase & { value: string; options: string[]; onChange: (v: string) => void }> = ({ label, value, options, onChange }) => (
  <div className="flex items-center justify-between">
    <span>{label}</span>
    <div className="flex items-center gap-2">
      <button className="px-2 py-1 bg-[#003a73] rounded" onClick={() => {
        const idx = options.indexOf(value);
        const next = options[(idx + options.length - 1) % options.length];
        onChange(next);
      }}>◀</button>
      <span className="min-w-[96px] text-center text-white">{value}</span>
      <button className="px-2 py-1 bg-[#003a73] rounded" onClick={() => {
        const idx = options.indexOf(value);
        const next = options[(idx + 1) % options.length];
        onChange(next);
      }}>▶</button>
    </div>
  </div>
);

const RowNumber: React.FC<RowPropsBase & { value: number; unit?: string; precision?: number; onDec: () => void; onInc: () => void; hint?: string }> = ({ label, value, unit, precision = 0, onDec, onInc, hint }) => (
  <div className="flex items-center justify-between">
    <span>{label}</span>
    <div className="flex items-center gap-2">
      <button className="px-2 py-1 bg-[#003a73] rounded" onClick={onDec}>-</button>
      <span className="min-w-[120px] text-center text-white">{value.toFixed(precision)}{unit ? ' ' + unit : ''}</span>
      <button className="px-2 py-1 bg-[#003a73] rounded" onClick={onInc}>+</button>
    </div>
    {hint && <span className="ml-3 text-[11px] text-[#a8d8ff]">{hint}</span>}
  </div>
);

export default BiosSetup;

// Minimal fan curve editor with draggable points using SVG
interface FanCurveEditorProps {
  points: { t: number; p: number }[];
  onChange: (pts: { t: number; p: number }[]) => void;
}

const FanCurveEditor: React.FC<FanCurveEditorProps> = ({ points, onChange }) => {
  const width = 420;
  const height = 160;
  const padding = 30;
  const minT = 20; const maxT = 95; const minP = 0; const maxP = 100;
  const x = (t: number) => padding + ((t - minT) / (maxT - minT)) * (width - padding * 2);
  const y = (p: number) => height - padding - ((p - minP) / (maxP - minP)) * (height - padding * 2);

  const handleDrag = (idx: number, clientX: number, clientY: number, svgRect: DOMRect) => {
    const localX = clientX - svgRect.left;
    const localY = clientY - svgRect.top;
    const t = Math.max(minT, Math.min(maxT, minT + ((localX - padding) / (width - padding * 2)) * (maxT - minT)));
    const p = Math.max(minP, Math.min(maxP, minP + ((height - padding - localY) / (height - padding * 2)) * (maxP - minP)));
    const copy = [...points];
    copy[idx] = { t: Math.round(t), p: Math.round(p) };
    copy.sort((a, b) => a.t - b.t);
    onChange(copy);
  };

  return (
    <div className="rounded border border-[#1f4f80] p-2">
      <div className="text-xs text-[#a8d8ff] mb-1">Custom Fan Curve (Temp °C → PWM %)</div>
      <svg width={width} height={height} className="bg-[#001b34] rounded cursor-crosshair"
        onDoubleClick={(e) => {
          const rect = (e.target as SVGElement).getBoundingClientRect();
          handleDrag(Math.max(0, points.length - 1), e.clientX, e.clientY, rect);
        }}>
        <g>
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#1f4f80" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#1f4f80" />
          {points.map((p, i) => {
            const next = points[i + 1];
            if (!next) return null;
            return <line key={`l-${i}`} x1={x(p.t)} y1={y(p.p)} x2={x(next.t)} y2={y(next.p)} stroke="#0a84ff" strokeWidth={2} />;
          })}
          {points.map((p, i) => (
            <circle key={`c-${i}`} cx={x(p.t)} cy={y(p.p)} r={6} fill="#0a84ff"
              onMouseDown={(e) => {
                e.preventDefault();
                const svg = (e.currentTarget.ownerSVGElement as SVGSVGElement);
                const rect = svg.getBoundingClientRect();
                const move = (ev: MouseEvent) => handleDrag(i, ev.clientX, ev.clientY, rect);
                const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
                window.addEventListener('mousemove', move);
                window.addEventListener('mouseup', up);
              }}
            />
          ))}
        </g>
      </svg>
      <div className="mt-2 flex items-center gap-2 text-xs">
        <button className="px-2 py-1 bg-[#003a73] rounded" onClick={() => onChange(points.slice(0, -1))}>Remove Last</button>
        <button className="px-2 py-1 bg-[#003a73] rounded" onClick={() => onChange([...points, { t: Math.min(95, points[points.length - 1].t + 5), p: Math.min(100, points[points.length - 1].p + 5) }])}>Add Point</button>
        <span className="text-[#a8d8ff]">Points: {points.map(p => `${p.t}°/${p.p}%`).join('  ')}</span>
      </div>
    </div>
  );
};

// BIOS update simulator (flash from local JSON)
const BiosUpdateWidget: React.FC<{ onVersionChange: (ver: string) => void }> = ({ onVersionChange }) => {
  const [status, setStatus] = useState<'idle' | 'validating' | 'flashing' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  const handleFile = async (file?: File) => {
    if (!file) return;
    setSelectedFileName(file.name);
    setStatus('validating');
    setMessage('Validating image...');
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data || typeof data.version !== 'string' || !/^V\d+\.\d+/.test(data.version)) {
        throw new Error('Invalid image header');
      }
      setStatus('flashing');
      setMessage('Flashing... Do not power off.');
      await new Promise((r) => setTimeout(r, 1600));
      onVersionChange(data.version);
      try { localStorage.setItem('bios.version.image', text); } catch {}
      setStatus('done');
      setMessage('Flash complete. Please Save & Exit to apply.');
    } catch (e: any) {
      setStatus('error');
      setMessage(e?.message || 'Failed to flash image');
    }
  };

  return (
    <div className="border border-[#1f4f80] rounded p-3 text-xs space-y-2">
      <div className="flex items-center justify-between">
        <span>Update from File</span>
        <label className="px-2 py-1 bg-[#003a73] rounded cursor-pointer">
          Choose File
          <input type="file" className="hidden" accept="application/json,.json" onChange={(e) => handleFile(e.target.files?.[0] || undefined)} />
        </label>
      </div>
      {selectedFileName && <div className="text-[#a8d8ff]">Selected: {selectedFileName}</div>}
      <div className={
        status === 'done' ? 'text-emerald-400' : status === 'error' ? 'text-red-400' : 'text-[#a8d8ff]'
      }>{message}</div>
      <div className="text-[#a8d8ff]">Tip: Use a JSON like {`{"version":"V6.12"}`} to simulate a flash.</div>
    </div>
  );
};


