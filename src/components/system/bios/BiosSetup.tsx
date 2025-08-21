'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';

interface BiosSetupProps {
  onExit: (action: 'save-exit' | 'discard-exit') => void;
}

type Tab = 'main' | 'advanced' | 'chipset' | 'security' | 'boot' | 'tools' | 'exit';

const BiosSetup: React.FC<BiosSetupProps> = ({ onExit }) => {
  const [tab, setTab] = useState<Tab>('main');
  const [mode, setMode] = useState<'ez' | 'advanced'>('advanced');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editingValue, setEditingValue] = useState(false);
  const [bootOrder, setBootOrder] = useState<string[]>([
    'Windows Boot Manager (NVMe: Samsung 990 PRO 2TB)',
    'Ubuntu 22.04 LTS (NVMe: WDC SN850X 1TB)',
    'UEFI: BD-RE HL-DT-ST BD-RE WH16NS40',
    'USB: SanDisk Extreme Pro',
    'Network Boot (Intel I225-V)'
  ]);

  // System Information
  const [biosVersion] = useState('V6.00PG Build 2024.12.15');
  const [biosDate] = useState('12/15/2024');
  const [systemTime, setSystemTime] = useState(new Date());
  const [cpuModel] = useState('AMD Ryzen 9 7950X3D 16-Core Processor');
  const [motherboard] = useState('ASUS ROG CROSSHAIR X670E HERO');
  const [totalMemory] = useState(65536);

  // Security Settings
  const [secureBoot, setSecureBoot] = useState(true);
  const [tpmEnabled, setTpmEnabled] = useState(true);
  const [supervisorPasswordSet, setSupervisorPasswordSet] = useState(false);
  const [userPasswordSet, setUserPasswordSet] = useState(false);
  const [secureBootMode, setSecureBootMode] = useState<'Standard' | 'Custom'>('Standard');
  const [secureBootKeys, setSecureBootKeys] = useState<'Default' | 'Custom'>('Default');

  // CPU Configuration
  const [cpuMultiplier, setCpuMultiplier] = useState(55);
  const [baseClock, setBaseClock] = useState(100.00);
  const [cpuVoltageOffset, setCpuVoltageOffset] = useState(0.000);
  const [pboMode, setPboMode] = useState<'Auto' | 'Enabled' | 'Disabled' | 'Advanced'>('Auto');
  const [pboScalar, setPboScalar] = useState(10);
  const [pboPptLimit, setPboPptLimit] = useState(230);
  const [pboTdcLimit, setPboTdcLimit] = useState(160);
  const [pboEdcLimit, setPboEdcLimit] = useState(215);
  const [globalCState, setGlobalCState] = useState<'Auto' | 'Enabled' | 'Disabled'>('Auto');
  const [cpb, setCpb] = useState<'Auto' | 'Enabled' | 'Disabled'>('Auto');
  const [svm, setSvm] = useState(true);
  const [smt, setSmt] = useState(true);
  const [cppc, setCppc] = useState(true);
  const [cppcPreferredCores, setCppcPreferredCores] = useState(true);
  const [df_cstates, setDf_cstates] = useState(true);

  // Per-Core Configuration
  const [coresEnabled, setCoresEnabled] = useState<boolean[]>(Array(16).fill(true));
  const [coreMaxRatio, setCoreMaxRatio] = useState<number[]>(Array(16).fill(55));
  const [curveOptimizer, setCurveOptimizer] = useState<'Per Core' | 'All Core' | 'Disabled'>('Per Core');
  const [curveOffsets, setCurveOffsets] = useState<number[]>(Array(16).fill(0));

  // Memory Configuration
  const [xmpEnabled, setXmpEnabled] = useState(true);
  const [xmpProfile, setXmpProfile] = useState<'Disabled' | 'Profile 1' | 'Profile 2'>('Profile 1');
  const [dramFrequency, setDramFrequency] = useState(6000);
  const [fclkFrequency, setFclkFrequency] = useState(2000);
  const [uclkFrequency, setUclkFrequency] = useState(3000);
  const [fclkRatio, setFclkRatio] = useState<'Auto' | '1:1' | '1:2' | '1:3'>('Auto');

  // Primary Timings
  const [tCL, setTCL] = useState(30);
  const [tRCD, setTRCD] = useState(38);
  const [tRP, setTRP] = useState(38);
  const [tRAS, setTRAS] = useState(96);
  const [tRC, setTRC] = useState(134);
  const [commandRate, setCommandRate] = useState<'1T' | '2T'>('2T');

  // Secondary Timings
  const [tFAW, setTFAW] = useState(32);
  const [tRFC, setTRFC] = useState(560);
  const [tRFC2, setTRFC2] = useState(416);
  const [tRFC4, setTRFC4] = useState(256);
  const [tRRDS, setTRRDS] = useState(6);
  const [tRRDL, setTRRDL] = useState(8);
  const [tWR, setTWR] = useState(24);
  const [tWTRS, setTWTRS] = useState(4);
  const [tWTRL, setTWTRL] = useState(12);
  const [tCWL, setTCWL] = useState(30);
  const [tRTP, setTRTP] = useState(12);
  const [tRDRDSCL, setTRDRDSCL] = useState(2);
  const [tWRWRSCL, setTWRWRSCL] = useState(2);

  // Tertiary Timings
  const [tRDWR, setTRDWR] = useState(8);
  const [tWRRD, setTWRRD] = useState(3);
  const [tCKE, setTCKE] = useState(8);
  const [tREFI, setTREFI] = useState(65535);
  const [tMOD, setTMOD] = useState(24);
  const [tMRD, setTMRD] = useState(8);
  const [tMRDPDA, setTMRDPDA] = useState(8);

  // Memory Advanced Features
  const [gearDownMode, setGearDownMode] = useState(true);
  const [powerDownEnable, setPowerDownEnable] = useState(false);
  const [bankGroupSwap, setBankGroupSwap] = useState<'Auto' | 'Enabled' | 'Disabled'>('Auto');
  const [bankGroupSwapAlt, setBankGroupSwapAlt] = useState(false);
  const [addressHashBank, setAddressHashBank] = useState(true);
  const [addressHashCs, setAddressHashCs] = useState(false);
  const [addressHashRm, setAddressHashRm] = useState(false);

  // Voltage Configuration
  const [vcoreMode, setVcoreMode] = useState<'Auto' | 'Offset' | 'Override' | 'Adaptive'>('Auto');
  const [vcoreVoltage, setVcoreVoltage] = useState(1.250);
  const [vcoreOffset, setVcoreOffset] = useState(0.000);
  const [vcoreAdaptive, setVcoreAdaptive] = useState(1.350);
  const [llcLevel, setLlcLevel] = useState<'Auto' | 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4' | 'Level 5' | 'Level 6' | 'Level 7' | 'Level 8'>('Auto');
  const [socVoltage, setSocVoltage] = useState(1.050);
  const [vddgCcd, setVddgCcd] = useState(0.900);
  const [vddgIod, setVddgIod] = useState(1.050);
  const [vddp, setVddp] = useState(0.900);
  const [cldo_vddp, setCldo_vddp] = useState(0.900);
  const [dramVoltage, setDramVoltage] = useState(1.350);
  const [vddioMem, setVddioMem] = useState(1.350);
  const [vpp, setVpp] = useState(2.500);
  const [vttDdr, setVttDdr] = useState(0.675);
  const [vccsa, setVccsa] = useState(0.950);
  const [vccio, setVccio] = useState(0.950);
  const [vccst, setVccst] = useState(1.050);
  const [vccpll, setVccpll] = useState(1.800);
  const [v1p8, setV1p8] = useState(1.800);
  const [v1p2, setV1p2] = useState(1.200);
  const [v1p0, setV1p0] = useState(1.000);

  // Power Management
  const [cpuPowerPhaseControl, setCpuPowerPhaseControl] = useState<'Auto' | 'Standard' | 'Extreme' | 'Manual'>('Auto');
  const [cpuVrmSwitchingFrequency, setCpuVrmSwitchingFrequency] = useState<'Auto' | '300' | '350' | '400' | '450' | '500'>('Auto');
  const [cpuCurrentCapability, setCpuCurrentCapability] = useState(140);
  const [socPowerPhaseControl, setSocPowerPhaseControl] = useState<'Auto' | 'Standard' | 'Extreme'>('Auto');
  const [socVrmSwitchingFrequency, setSocVrmSwitchingFrequency] = useState<'Auto' | '300' | '350' | '400'>('Auto');
  const [socCurrentCapability, setSocCurrentCapability] = useState(100);
  const [cpuPowerDutyCycle, setCpuPowerDutyCycle] = useState<'T.Probe' | 'Extreme'>('T.Probe');
  const [cpuPowerPhase, setCpuPowerPhase] = useState<'Standard' | 'Optimized' | 'Extreme' | 'Manual'>('Standard');
  const [powerThermalControl, setPowerThermalControl] = useState(130);

  // PCIe Configuration
  const [pcieSlot1Speed, setPcieSlot1Speed] = useState<'Auto' | 'Gen1' | 'Gen2' | 'Gen3' | 'Gen4' | 'Gen5'>('Auto');
  const [pcieSlot2Speed, setPcieSlot2Speed] = useState<'Auto' | 'Gen1' | 'Gen2' | 'Gen3' | 'Gen4' | 'Gen5'>('Auto');
  const [pcieSlot3Speed, setPcieSlot3Speed] = useState<'Auto' | 'Gen1' | 'Gen2' | 'Gen3' | 'Gen4' | 'Gen5'>('Auto');
  const [pcieSlot4Speed, setPcieSlot4Speed] = useState<'Auto' | 'Gen1' | 'Gen2' | 'Gen3' | 'Gen4' | 'Gen5'>('Auto');
  const [pcieAspm, setPcieAspm] = useState<'Disabled' | 'L0s' | 'L1' | 'L0sL1'>('Disabled');
  const [above4gDecoding, setAbove4gDecoding] = useState(true);
  const [resizeBar, setResizeBar] = useState(true);
  const [srIov, setSrIov] = useState(true);
  const [ariSupport, setAriSupport] = useState(true);

  // Storage Configuration
  const [sataMode, setSataMode] = useState<'AHCI' | 'RAID' | 'IDE'>('AHCI');
  const [sataHotplug, setSataHotplug] = useState(false);
  const [sataAggressiveLinkPowerManagement, setSataAggressiveLinkPowerManagement] = useState(false);
  const [nvmeRaidMode, setNvmeRaidMode] = useState(false);
  const [m2_1LinkSpeed, setM2_1LinkSpeed] = useState<'Auto' | 'Gen3 x4' | 'Gen4 x4' | 'Gen5 x4'>('Auto');
  const [m2_2LinkSpeed, setM2_2LinkSpeed] = useState<'Auto' | 'Gen3 x4' | 'Gen4 x4' | 'Gen5 x4'>('Auto');
  const [m2_3LinkSpeed, setM2_3LinkSpeed] = useState<'Auto' | 'Gen3 x4' | 'Gen4 x4' | 'Gen5 x4'>('Auto');
  const [m2_4LinkSpeed, setM2_4LinkSpeed] = useState<'Auto' | 'Gen3 x4' | 'Gen4 x4' | 'Gen5 x4'>('Auto');

  // USB Configuration
  const [usbLegacySupport, setUsbLegacySupport] = useState(true);
  const [xhciHandoff, setXhciHandoff] = useState(true);
  const [ehciHandoff, setEhciHandoff] = useState(true);
  const [usb3LinkPowerManagement, setUsb3LinkPowerManagement] = useState(true);
  const [usbPortPower, setUsbPortPower] = useState<'Enabled in S3/S4/S5' | 'Disabled in S3/S4/S5'>('Enabled in S3/S4/S5');
  const [usbMassStorageDriverSupport, setUsbMassStorageDriverSupport] = useState(true);
  const [usbTransferTimeout, setUsbTransferTimeout] = useState(20);
  const [deviceResetTimeout, setDeviceResetTimeout] = useState(20);
  const [devicePowerupDelay, setDevicePowerupDelay] = useState<'Auto' | 'Manual'>('Auto');

  // Network Configuration
  const [lanController, setLanController] = useState(true);
  const [wakeOnLan, setWakeOnLan] = useState(true);
  const [lanBootRom, setLanBootRom] = useState(false);
  const [lanPxeOpRom, setLanPxeOpRom] = useState<'Disabled' | 'PXE' | 'iSCSI'>('Disabled');

  // Audio Configuration
  const [hdAudioController, setHdAudioController] = useState(true);
  const [frontPanelType, setFrontPanelType] = useState<'HD Audio' | 'AC97'>('HD Audio');
  const [spdifOutType, setSpdifOutType] = useState<'SPDIF' | 'HDMI'>('SPDIF');

  // Fan Control
  const [fanProfile, setFanProfile] = useState<'Silent' | 'Standard' | 'Turbo' | 'Full Speed' | 'Manual'>('Standard');
  const [cpuFanMode, setCpuFanMode] = useState<'PWM' | 'DC' | 'Auto'>('PWM');
  const [cpuFanSpeed, setCpuFanSpeed] = useState(70);
  const [cpuOptFanMode, setCpuOptFanMode] = useState<'PWM' | 'DC' | 'Auto' | 'Disabled'>('Auto');
  const [cpuOptFanSpeed, setCpuOptFanSpeed] = useState(70);
  const [chassisFan1Mode, setChassisFan1Mode] = useState<'PWM' | 'DC' | 'Auto' | 'Disabled'>('Auto');
  const [chassisFan1Speed, setChassisFan1Speed] = useState(60);
  const [chassisFan2Mode, setChassisFan2Mode] = useState<'PWM' | 'DC' | 'Auto' | 'Disabled'>('Auto');
  const [chassisFan2Speed, setChassisFan2Speed] = useState(60);
  const [chassisFan3Mode, setChassisFan3Mode] = useState<'PWM' | 'DC' | 'Auto' | 'Disabled'>('Auto');
  const [chassisFan3Speed, setChassisFan3Speed] = useState(60);
  const [aioMode, setAioMode] = useState<'PWM' | 'DC' | 'Auto' | 'Disabled'>('PWM');
  const [aioSpeed, setAioSpeed] = useState(80);

  // Temperature Targets
  const [cpuTempTarget, setCpuTempTarget] = useState(75);
  const [cpuUpperTemp, setCpuUpperTemp] = useState(85);
  const [cpuMaxTemp, setCpuMaxTemp] = useState(95);
  const [cpuFanStopTemp, setCpuFanStopTemp] = useState(35);
  const [cpuFanStartTemp, setCpuFanStartTemp] = useState(40);
  const [cpuFanMaxTemp, setCpuFanMaxTemp] = useState(75);
  const [cpuFanMaxDuty, setCpuFanMaxDuty] = useState(100);
  const [cpuFanMinDuty, setCpuFanMinDuty] = useState(20);
  const [cpuFanStepUp, setCpuFanStepUp] = useState(5);
  const [cpuFanStepDown, setCpuFanStepDown] = useState(5);
  const [cpuFanSpeedLowLimit, setCpuFanSpeedLowLimit] = useState(600);
  const [fanStopEnabled, setFanStopEnabled] = useState(false);

  // Monitoring
  const [cpuTemp, setCpuTemp] = useState(42);
  const [cpuTdie, setCpuTdie] = useState(45);
  const [cpuTctl, setCpuTctl] = useState(55);
  const [cpuCcd1Temp, setCpuCcd1Temp] = useState(41);
  const [cpuCcd2Temp, setCpuCcd2Temp] = useState(40);
  const [cpuFanRpm, setCpuFanRpm] = useState(950);
  const [cpuOptFanRpm, setCpuOptFanRpm] = useState(0);
  const [chassisFan1Rpm, setChassisFan1Rpm] = useState(850);
  const [chassisFan2Rpm, setChassisFan2Rpm] = useState(820);
  const [chassisFan3Rpm, setChassisFan3Rpm] = useState(810);
  const [aioRpm, setAioRpm] = useState(1250);
  const [mbTemp, setMbTemp] = useState(35);
  const [vrmTemp, setVrmTemp] = useState(48);
  const [pchTemp, setPchTemp] = useState(42);
  const [m2_1Temp, setM2_1Temp] = useState(38);
  const [m2_2Temp, setM2_2Temp] = useState(0);
  const [cpuVoltageMonitor, setCpuVoltageMonitor] = useState(1.248);
  const [socVoltageMonitor, setSocVoltageMonitor] = useState(1.052);
  const [dramVoltageMonitor, setDramVoltageMonitor] = useState(1.352);
  const [cpuPower, setCpuPower] = useState(88);
  const [socPower, setSocPower] = useState(22);
  const [v12Monitor, setV12Monitor] = useState(12.096);
  const [v5Monitor, setV5Monitor] = useState(5.040);
  const [v33Monitor, setV33Monitor] = useState(3.312);
  const [vbatMonitor, setVbatMonitor] = useState(3.104);

  // Boot Options
  const [fastBoot, setFastBoot] = useState(true);
  const [ultraFastBoot, setUltraFastBoot] = useState(false);
  const [bootLogo, setBootLogo] = useState(true);
  const [fullScreenLogo, setFullScreenLogo] = useState(false);
  const [postDelay, setPostDelay] = useState(0);
  const [bootTimeout, setBootTimeout] = useState(5);
  const [bootBeep, setBootBeep] = useState(false);
  const [numLock, setNumLock] = useState(true);
  const [waitForF1, setWaitForF1] = useState(false);
  const [bootupNumLockState, setBootupNumLockState] = useState<'On' | 'Off'>('On');
  const [csm, setCsm] = useState(false);
  const [bootDeviceControl, setBootDeviceControl] = useState<'UEFI and Legacy' | 'UEFI only' | 'Legacy only'>('UEFI only');
  const [bootFromStorageDevices, setBootFromStorageDevices] = useState<'Both, UEFI first' | 'Both, Legacy first' | 'UEFI only' | 'Legacy only'>('Both, UEFI first');
  const [bootFromPciExpansion, setBootFromPciExpansion] = useState<'UEFI only' | 'Legacy only'>('UEFI only');
  const [bootFromNetwork, setBootFromNetwork] = useState<'UEFI only' | 'Legacy only'>('UEFI only');
  const [osType, setOsType] = useState<'Windows UEFI' | 'Other OS'>('Windows UEFI');

  // Advanced Tab State
  type AdvancedCategory =
    | 'cpu' | 'cpu-features' | 'cpu-power' | 'curve'
    | 'memory' | 'memory-timing' | 'memory-advanced'
    | 'voltage' | 'voltage-advanced' | 'vrm'
    | 'pcie' | 'storage' | 'usb' | 'network' | 'audio'
    | 'monitor' | 'fan' | 'thermal';

  const [advancedCategory, setAdvancedCategory] = useState<AdvancedCategory>('cpu');

  // Time update
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Monitor simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setCpuTemp(prev => Math.max(35, Math.min(85, prev + (Math.random() * 4 - 2))));
      setCpuTdie(prev => Math.max(38, Math.min(88, prev + (Math.random() * 4 - 2))));
      setCpuTctl(prev => Math.max(45, Math.min(95, prev + (Math.random() * 4 - 2))));
      setCpuCcd1Temp(prev => Math.max(35, Math.min(80, prev + (Math.random() * 3 - 1.5))));
      setCpuCcd2Temp(prev => Math.max(34, Math.min(79, prev + (Math.random() * 3 - 1.5))));
      setMbTemp(prev => Math.max(30, Math.min(50, prev + (Math.random() * 2 - 1))));
      setVrmTemp(prev => Math.max(40, Math.min(70, prev + (Math.random() * 3 - 1.5))));
      setPchTemp(prev => Math.max(35, Math.min(55, prev + (Math.random() * 2 - 1))));
      setM2_1Temp(prev => Math.max(30, Math.min(60, prev + (Math.random() * 2 - 1))));

      setCpuVoltageMonitor(prev => Math.max(1.200, Math.min(1.300, prev + (Math.random() * 0.010 - 0.005))));
      setSocVoltageMonitor(prev => Math.max(1.040, Math.min(1.060, prev + (Math.random() * 0.004 - 0.002))));
      setDramVoltageMonitor(prev => Math.max(1.345, Math.min(1.355, prev + (Math.random() * 0.004 - 0.002))));

      setCpuPower(prev => Math.max(50, Math.min(150, prev + (Math.random() * 10 - 5))));
      setSocPower(prev => Math.max(15, Math.min(30, prev + (Math.random() * 3 - 1.5))));

      setV12Monitor(prev => Math.max(11.900, Math.min(12.200, prev + (Math.random() * 0.020 - 0.010))));
      setV5Monitor(prev => Math.max(4.950, Math.min(5.100, prev + (Math.random() * 0.010 - 0.005))));
      setV33Monitor(prev => Math.max(3.280, Math.min(3.350, prev + (Math.random() * 0.008 - 0.004))));
      setVbatMonitor(prev => Math.max(3.050, Math.min(3.150, prev + (Math.random() * 0.008 - 0.004))));

      // Fan speeds based on temps
      const cpuFanTarget = fanProfile === 'Silent' ? 600 + (cpuTemp - 30) * 10 :
                          fanProfile === 'Standard' ? 700 + (cpuTemp - 30) * 15 :
                          fanProfile === 'Turbo' ? 900 + (cpuTemp - 30) * 20 :
                          fanProfile === 'Full Speed' ? 2000 : (cpuFanSpeed / 100) * 2000;
      setCpuFanRpm(prev => Math.max(0, Math.min(2200, prev + (cpuFanTarget - prev) * 0.1 + (Math.random() * 20 - 10))));

      setChassisFan1Rpm(prev => Math.max(0, Math.min(1800, prev + (Math.random() * 20 - 10))));
      setChassisFan2Rpm(prev => Math.max(0, Math.min(1800, prev + (Math.random() * 20 - 10))));
      setChassisFan3Rpm(prev => Math.max(0, Math.min(1800, prev + (Math.random() * 20 - 10))));
      setAioRpm(prev => Math.max(0, Math.min(2400, prev + (Math.random() * 30 - 15))));
    }, 500);
    return () => clearInterval(timer);
  }, [cpuTemp, fanProfile, cpuFanSpeed]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onExit('discard-exit');
      }
      if (e.key === 'F10') {
        e.preventDefault();
        onExit('save-exit');
      }
      if (e.key === 'F7') {
        e.preventDefault();
        setMode(prev => prev === 'advanced' ? 'ez' : 'advanced');
      }
      if (e.key === 'F5') {
        e.preventDefault();
        // Load optimized defaults
        loadOptimizedDefaults();
      }
      if (e.key === 'ArrowLeft' && !editingValue) {
        e.preventDefault();
        const tabs: Tab[] = ['main', 'advanced', 'chipset', 'security', 'boot', 'tools', 'exit'];
        const currentIndex = tabs.indexOf(tab);
        setTab(tabs[(currentIndex - 1 + tabs.length) % tabs.length]);
      }
      if (e.key === 'ArrowRight' && !editingValue) {
        e.preventDefault();
        const tabs: Tab[] = ['main', 'advanced', 'chipset', 'security', 'boot', 'tools', 'exit'];
        const currentIndex = tabs.indexOf(tab);
        setTab(tabs[(currentIndex + 1) % tabs.length]);
      }
      if (e.key === 'ArrowUp' && !editingValue) {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(0, prev - 1));
      }
      if (e.key === 'ArrowDown' && !editingValue) {
        e.preventDefault();
        setSelectedIndex(prev => prev + 1);
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        setEditingValue(prev => !prev);
      }
      if (e.key === '+' && editingValue) {
        e.preventDefault();
        // Increment current value
      }
      if (e.key === '-' && editingValue) {
        e.preventDefault();
        // Decrement current value
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tab, editingValue, onExit]);

  const loadOptimizedDefaults = () => {
    setCpuMultiplier(55);
    setBaseClock(100.00);
    setCpuVoltageOffset(0.000);
    setPboMode('Auto');
    setXmpEnabled(true);
    setXmpProfile('Profile 1');
    setDramFrequency(6000);
    setFanProfile('Standard');
    setSecureBoot(true);
    setTpmEnabled(true);
    setFastBoot(true);
    setSataMode('AHCI');
    setResizeBar(true);
    setAbove4gDecoding(true);
  };

  const cpuFrequency = (cpuMultiplier * baseClock / 1000).toFixed(2);

  const renderContent = () => {
    switch (tab) {
      case 'main':
        return (
          <div className="space-y-1">
            <div className="grid grid-cols-2 gap-x-12">
              <div className="space-y-1">
                <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mb-2">System Information</div>
                <InfoRow label="BIOS Version" value={biosVersion} />
                <InfoRow label="BIOS Date" value={biosDate} />
                <InfoRow label="Processor" value={cpuModel} />
                <InfoRow label="Speed" value={`${cpuFrequency} GHz`} />
                <InfoRow label="Total Memory" value={`${totalMemory} MB (DDR5-${dramFrequency})`} />
                <InfoRow label="Memory Speed" value={`${dramFrequency} MT/s ${tCL}-${tRCD}-${tRP}-${tRAS}`} />
              </div>
              <div className="space-y-1">
                <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mb-2">System Status</div>
                <InfoRow label="System Date" value={systemTime.toLocaleDateString()} />
                <InfoRow label="System Time" value={systemTime.toLocaleTimeString()} />
                <InfoRow label="Access Level" value="Administrator" />
                <InfoRow label="Boot Mode" value={csm ? "Legacy" : "UEFI"} />
                <InfoRow label="Secure Boot" value={secureBoot ? "Enabled" : "Disabled"} />
                <InfoRow label="TPM 2.0" value={tpmEnabled ? "Enabled" : "Disabled"} />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1a3a52]">
              <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mb-2">Quick Settings</div>
              <div className="grid grid-cols-3 gap-4">
                <SelectOption
                  label="XMP Profile"
                  value={xmpProfile}
                  options={['Disabled', 'Profile 1', 'Profile 2']}
                  onChange={setXmpProfile as any}
                />
                <SelectOption
                  label="Fan Profile"
                  value={fanProfile}
                  options={['Silent', 'Standard', 'Turbo', 'Full Speed', 'Manual']}
                  onChange={setFanProfile as any}
                />
                <SelectOption
                  label="Boot Priority"
                  value={bootOrder[0].split(' ')[0]}
                  options={['Windows', 'Ubuntu', 'UEFI:', 'USB:', 'Network']}
                  onChange={() => {}}
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1a3a52]">
              <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mb-2">System Monitor</div>
              <div className="grid grid-cols-4 gap-4">
                <MonitorValue label="CPU Temp" value={`${cpuTemp}°C`} status={cpuTemp > 80 ? 'warning' : cpuTemp > 90 ? 'critical' : 'normal'} />
                <MonitorValue label="VRM Temp" value={`${vrmTemp}°C`} status={vrmTemp > 70 ? 'warning' : vrmTemp > 85 ? 'critical' : 'normal'} />
                <MonitorValue label="CPU Fan" value={`${cpuFanRpm} RPM`} status="normal" />
                <MonitorValue label="CPU Power" value={`${cpuPower}W`} status={cpuPower > 120 ? 'warning' : cpuPower > 150 ? 'critical' : 'normal'} />
              </div>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="flex gap-4">
            <div className="w-64 space-y-1">
              <div className="bg-[#0a2540] px-3 py-2 text-[#7cb8e4] text-xs uppercase tracking-wider">Categories</div>
              <div className="space-y-0.5">
                <CategoryItem label="CPU Configuration" active={advancedCategory === 'cpu'} onClick={() => setAdvancedCategory('cpu')} />
                <CategoryItem label="CPU Features" active={advancedCategory === 'cpu-features'} onClick={() => setAdvancedCategory('cpu-features')} />
                <CategoryItem label="CPU Power Management" active={advancedCategory === 'cpu-power'} onClick={() => setAdvancedCategory('cpu-power')} />
                <CategoryItem label="AMD Curve Optimizer" active={advancedCategory === 'curve'} onClick={() => setAdvancedCategory('curve')} />
                <CategoryItem label="Memory Configuration" active={advancedCategory === 'memory'} onClick={() => setAdvancedCategory('memory')} />
                <CategoryItem label="Memory Timing Control" active={advancedCategory === 'memory-timing'} onClick={() => setAdvancedCategory('memory-timing')} />
                <CategoryItem label="Memory Advanced" active={advancedCategory === 'memory-advanced'} onClick={() => setAdvancedCategory('memory-advanced')} />
                <CategoryItem label="Voltage Configuration" active={advancedCategory === 'voltage'} onClick={() => setAdvancedCategory('voltage')} />
                <CategoryItem label="Advanced Voltage" active={advancedCategory === 'voltage-advanced'} onClick={() => setAdvancedCategory('voltage-advanced')} />
                <CategoryItem label="VRM Configuration" active={advancedCategory === 'vrm'} onClick={() => setAdvancedCategory('vrm')} />
                <CategoryItem label="PCIe Configuration" active={advancedCategory === 'pcie'} onClick={() => setAdvancedCategory('pcie')} />
                <CategoryItem label="Storage Configuration" active={advancedCategory === 'storage'} onClick={() => setAdvancedCategory('storage')} />
                <CategoryItem label="USB Configuration" active={advancedCategory === 'usb'} onClick={() => setAdvancedCategory('usb')} />
                <CategoryItem label="Network Stack" active={advancedCategory === 'network'} onClick={() => setAdvancedCategory('network')} />
                <CategoryItem label="HD Audio" active={advancedCategory === 'audio'} onClick={() => setAdvancedCategory('audio')} />
                <CategoryItem label="Hardware Monitor" active={advancedCategory === 'monitor'} onClick={() => setAdvancedCategory('monitor')} />
                <CategoryItem label="Fan Configuration" active={advancedCategory === 'fan'} onClick={() => setAdvancedCategory('fan')} />
                <CategoryItem label="Thermal Configuration" active={advancedCategory === 'thermal'} onClick={() => setAdvancedCategory('thermal')} />
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <div className="bg-[#0a2540] px-3 py-2 text-[#7cb8e4] text-xs uppercase tracking-wider">
                {advancedCategory === 'cpu' && 'CPU Configuration'}
                {advancedCategory === 'cpu-features' && 'CPU Features'}
                {advancedCategory === 'cpu-power' && 'CPU Power Management'}
                {advancedCategory === 'curve' && 'AMD Curve Optimizer'}
                {advancedCategory === 'memory' && 'Memory Configuration'}
                {advancedCategory === 'memory-timing' && 'Memory Timing Control'}
                {advancedCategory === 'memory-advanced' && 'Memory Advanced Settings'}
                {advancedCategory === 'voltage' && 'Voltage Configuration'}
                {advancedCategory === 'voltage-advanced' && 'Advanced Voltage Settings'}
                {advancedCategory === 'vrm' && 'VRM Configuration'}
                {advancedCategory === 'pcie' && 'PCIe Configuration'}
                {advancedCategory === 'storage' && 'Storage Configuration'}
                {advancedCategory === 'usb' && 'USB Configuration'}
                {advancedCategory === 'network' && 'Network Stack Configuration'}
                {advancedCategory === 'audio' && 'HD Audio Configuration'}
                {advancedCategory === 'monitor' && 'Hardware Monitor'}
                {advancedCategory === 'fan' && 'Fan Configuration'}
                {advancedCategory === 'thermal' && 'Thermal Configuration'}
              </div>

              <div className="px-3 py-2 space-y-1">
                {advancedCategory === 'cpu' && (
                  <>
                    <NumberSetting label="CPU Ratio" value={cpuMultiplier} unit="x" min={35} max={60} step={1} onChange={setCpuMultiplier} />
                    <NumberSetting label="BCLK Frequency" value={baseClock} unit="MHz" min={95} max={105} step={0.25} precision={2} onChange={setBaseClock} />
                    <InfoRow label="Target CPU Speed" value={`${cpuFrequency} GHz`} highlight />
                    <SelectOption label="Precision Boost Overdrive" value={pboMode} options={['Auto', 'Enabled', 'Disabled', 'Advanced']} onChange={setPboMode as any} />
                    {pboMode === 'Advanced' && (
                      <>
                        <NumberSetting label="PBO Scalar" value={pboScalar} unit="x" min={1} max={10} step={1} onChange={setPboScalar} />
                        <NumberSetting label="PPT Limit" value={pboPptLimit} unit="W" min={88} max={300} step={1} onChange={setPboPptLimit} />
                        <NumberSetting label="TDC Limit" value={pboTdcLimit} unit="A" min={75} max={225} step={1} onChange={setPboTdcLimit} />
                        <NumberSetting label="EDC Limit" value={pboEdcLimit} unit="A" min={90} max={300} step={1} onChange={setPboEdcLimit} />
                      </>
                    )}
                    <BooleanSetting label="SVM (AMD-V)" enabled={svm} onChange={setSvm} />
                    <BooleanSetting label="SMT (Simultaneous Multi-Threading)" enabled={smt} onChange={setSmt} />
                  </>
                )}

                {advancedCategory === 'cpu-features' && (
                  <>
                    <BooleanSetting label="Core Performance Boost (CPB)" enabled={cpb === 'Enabled'} onChange={(v) => setCpb(v ? 'Enabled' : 'Disabled')} />
                    <BooleanSetting label="CPPC" enabled={cppc} onChange={setCppc} />
                    <BooleanSetting label="CPPC Preferred Cores" enabled={cppcPreferredCores} onChange={setCppcPreferredCores} />
                    <SelectOption label="Global C-State Control" value={globalCState} options={['Auto', 'Enabled', 'Disabled']} onChange={setGlobalCState as any} />
                    <BooleanSetting label="DF C-States" enabled={df_cstates} onChange={setDf_cstates} />
                    <InfoRow label="Active Cores" value={`${coresEnabled.filter(v => v).length} / 16`} />
                  </>
                )}

                {advancedCategory === 'cpu-power' && (
                  <>
                    <SelectOption label="CPU Power Phase Control" value={cpuPowerPhaseControl} options={['Auto', 'Standard', 'Extreme', 'Manual']} onChange={setCpuPowerPhaseControl as any} />
                    <SelectOption label="CPU VRM Switching Frequency" value={cpuVrmSwitchingFrequency} options={['Auto', '300', '350', '400', '450', '500']} onChange={setCpuVrmSwitchingFrequency as any} />
                    <NumberSetting label="CPU Current Capability" value={cpuCurrentCapability} unit="%" min={100} max={140} step={5} onChange={setCpuCurrentCapability} />
                    <SelectOption label="CPU Power Duty Control" value={cpuPowerDutyCycle} options={['T.Probe', 'Extreme']} onChange={setCpuPowerDutyCycle as any} />
                    <SelectOption label="CPU Power Phase" value={cpuPowerPhase} options={['Standard', 'Optimized', 'Extreme', 'Manual']} onChange={setCpuPowerPhase as any} />
                    <NumberSetting label="CPU Power Thermal Control" value={powerThermalControl} unit="°C" min={90} max={135} step={5} onChange={setPowerThermalControl} />
                  </>
                )}

                {advancedCategory === 'curve' && (
                  <>
                    <SelectOption label="Curve Optimizer" value={curveOptimizer} options={['Per Core', 'All Core', 'Disabled']} onChange={setCurveOptimizer as any} />
                    {curveOptimizer !== 'Disabled' && (
                      <>
                        <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-3 mb-1">Per-Core Curve Offset</div>
                        <div className="grid grid-cols-2 gap-2">
                          {curveOffsets.map((offset, idx) => (
                            <div key={idx} className="flex items-center justify-between px-2 py-1 bg-[#0a2540] rounded">
                              <span className="text-xs">Core {idx}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  className="px-1.5 py-0.5 bg-[#1a3a52] hover:bg-[#2a4a62] rounded text-xs"
                                  onClick={() => setCurveOffsets(prev => prev.map((v, i) => i === idx ? Math.max(-30, v - 1) : v))}
                                >-</button>
                                <span className="w-12 text-center text-xs font-mono">{offset > 0 ? '+' : ''}{offset}</span>
                                <button
                                  className="px-1.5 py-0.5 bg-[#1a3a52] hover:bg-[#2a4a62] rounded text-xs"
                                  onClick={() => setCurveOffsets(prev => prev.map((v, i) => i === idx ? Math.min(30, v + 1) : v))}
                                >+</button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button className="px-3 py-1 bg-[#1a3a52] hover:bg-[#2a4a62] rounded text-xs" onClick={() => setCurveOffsets(Array(16).fill(0))}>Reset All</button>
                          <button className="px-3 py-1 bg-[#1a3a52] hover:bg-[#2a4a62] rounded text-xs" onClick={() => setCurveOffsets(Array(16).fill(-10))}>All -10</button>
                          <button className="px-3 py-1 bg-[#1a3a52] hover:bg-[#2a4a62] rounded text-xs" onClick={() => setCurveOffsets(prev => prev.map((_, i) => i < 8 ? -15 : -10))}>CCD0: -15, CCD1: -10</button>
                        </div>
                      </>
                    )}
                  </>
                )}

                {advancedCategory === 'memory' && (
                  <>
                    <BooleanSetting label="Memory Context Restore" enabled={xmpEnabled} onChange={setXmpEnabled} />
                    <SelectOption label="XMP/EXPO Profile" value={xmpProfile} options={['Disabled', 'Profile 1', 'Profile 2']} onChange={setXmpProfile as any} />
                    <NumberSetting label="Memory Frequency" value={dramFrequency} unit="MT/s" min={4800} max={8000} step={200} onChange={setDramFrequency} />
                    <NumberSetting label="FCLK Frequency" value={fclkFrequency} unit="MHz" min={1600} max={2200} step={100} onChange={setFclkFrequency} />
                    <NumberSetting label="UCLK Frequency" value={uclkFrequency} unit="MHz" min={2400} max={4000} step={100} onChange={setUclkFrequency} />
                    <SelectOption label="FCLK:UCLK:MCLK Ratio" value={fclkRatio} options={['Auto', '1:1', '1:2', '1:3']} onChange={setFclkRatio as any} />
                    <InfoRow label="Current Timings" value={`${tCL}-${tRCD}-${tRP}-${tRAS}`} />
                  </>
                )}

                {advancedCategory === 'memory-timing' && (
                  <>
                    <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mb-1">Primary Timings</div>
                    <NumberSetting label="tCL (CAS Latency)" value={tCL} min={26} max={48} step={1} onChange={setTCL} />
                    <NumberSetting label="tRCD (RAS to CAS)" value={tRCD} min={26} max={54} step={1} onChange={setTRCD} />
                    <NumberSetting label="tRP (RAS Precharge)" value={tRP} min={26} max={54} step={1} onChange={setTRP} />
                    <NumberSetting label="tRAS (RAS Active Time)" value={tRAS} min={52} max={120} step={1} onChange={setTRAS} />
                    <NumberSetting label="tRC (RAS Cycle Time)" value={tRC} min={78} max={174} step={1} onChange={setTRC} />
                    <SelectOption label="Command Rate" value={commandRate} options={['1T', '2T']} onChange={setCommandRate as any} />

                    <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-3 mb-1">Secondary Timings</div>
                    <NumberSetting label="tFAW" value={tFAW} min={16} max={48} step={1} onChange={setTFAW} />
                    <NumberSetting label="tRFC" value={tRFC} min={350} max={700} step={10} onChange={setTRFC} />
                    <NumberSetting label="tRFC2" value={tRFC2} min={260} max={520} step={10} onChange={setTRFC2} />
                    <NumberSetting label="tRFC4" value={tRFC4} min={160} max={320} step={10} onChange={setTRFC4} />
                    <NumberSetting label="tRRD_S" value={tRRDS} min={4} max={8} step={1} onChange={setTRRDS} />
                    <NumberSetting label="tRRD_L" value={tRRDL} min={6} max={12} step={1} onChange={setTRRDL} />
                    <NumberSetting label="tWR (Write Recovery)" value={tWR} min={12} max={48} step={1} onChange={setTWR} />
                    <NumberSetting label="tWTR_S" value={tWTRS} min={2} max={8} step={1} onChange={setTWTRS} />
                    <NumberSetting label="tWTR_L" value={tWTRL} min={8} max={16} step={1} onChange={setTWTRL} />
                    <NumberSetting label="tCWL (CAS Write Latency)" value={tCWL} min={26} max={48} step={1} onChange={setTCWL} />
                  </>
                )}

                {advancedCategory === 'memory-advanced' && (
                  <>
                    <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mb-1">Tertiary Timings</div>
                    <NumberSetting label="tRDWR" value={tRDWR} min={6} max={16} step={1} onChange={setTRDWR} />
                    <NumberSetting label="tWRRD" value={tWRRD} min={1} max={7} step={1} onChange={setTWRRD} />
                    <NumberSetting label="tCKE" value={tCKE} min={4} max={16} step={1} onChange={setTCKE} />
                    <NumberSetting label="tREFI" value={tREFI} min={32768} max={65535} step={1024} onChange={setTREFI} />
                    <NumberSetting label="tMOD" value={tMOD} min={12} max={36} step={1} onChange={setTMOD} />
                    <NumberSetting label="tMRD" value={tMRD} min={8} max={16} step={1} onChange={setTMRD} />
                    <NumberSetting label="tMRDPDA" value={tMRDPDA} min={8} max={16} step={1} onChange={setTMRDPDA} />

                    <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-3 mb-1">Memory Features</div>
                    <BooleanSetting label="Gear Down Mode" enabled={gearDownMode} onChange={setGearDownMode} />
                    <BooleanSetting label="Power Down Enable" enabled={powerDownEnable} onChange={setPowerDownEnable} />
                    <SelectOption label="Bank Group Swap" value={bankGroupSwap} options={['Auto', 'Enabled', 'Disabled']} onChange={setBankGroupSwap as any} />
                    <BooleanSetting label="Bank Group Swap Alt" enabled={bankGroupSwapAlt} onChange={setBankGroupSwapAlt} />
                    <BooleanSetting label="Address Hash Bank" enabled={addressHashBank} onChange={setAddressHashBank} />
                    <BooleanSetting label="Address Hash CS" enabled={addressHashCs} onChange={setAddressHashCs} />
                    <BooleanSetting label="Address Hash RM" enabled={addressHashRm} onChange={setAddressHashRm} />
                  </>
                )}

                {advancedCategory === 'voltage' && (
                  <>
                    <SelectOption label="CPU Core Voltage Mode" value={vcoreMode} options={['Auto', 'Offset', 'Override', 'Adaptive']} onChange={setVcoreMode as any} />
                    {vcoreMode === 'Override' && (
                      <NumberSetting label="CPU Core Voltage" value={vcoreVoltage} unit="V" min={0.900} max={1.500} step={0.005} precision={3} onChange={setVcoreVoltage} />
                    )}
                    {vcoreMode === 'Offset' && (
                      <NumberSetting label="CPU Core Voltage Offset" value={vcoreOffset} unit="V" min={-0.200} max={0.200} step={0.005} precision={3} onChange={setVcoreOffset} />
                    )}
                    {vcoreMode === 'Adaptive' && (
                      <NumberSetting label="CPU Core Adaptive Voltage" value={vcoreAdaptive} unit="V" min={1.200} max={1.500} step={0.005} precision={3} onChange={setVcoreAdaptive} />
                    )}
                    <SelectOption label="CPU Load-Line Calibration" value={llcLevel} options={['Auto', 'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6', 'Level 7', 'Level 8']} onChange={setLlcLevel as any} />
                    <NumberSetting label="CPU SoC Voltage" value={socVoltage} unit="V" min={0.900} max={1.200} step={0.005} precision={3} onChange={setSocVoltage} />
                    <NumberSetting label="DRAM Voltage" value={dramVoltage} unit="V" min={1.100} max={1.500} step={0.005} precision={3} onChange={setDramVoltage} />
                    <NumberSetting label="VDDIO MEM Voltage" value={vddioMem} unit="V" min={1.100} max={1.500} step={0.005} precision={3} onChange={setVddioMem} />
                  </>
                )}

                {advancedCategory === 'voltage-advanced' && (
                  <>
                    <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mb-1">CPU Voltages</div>
                    <NumberSetting label="VDDG CCD" value={vddgCcd} unit="V" min={0.850} max={1.100} step={0.005} precision={3} onChange={setVddgCcd} />
                    <NumberSetting label="VDDG IOD" value={vddgIod} unit="V" min={0.950} max={1.150} step={0.005} precision={3} onChange={setVddgIod} />
                    <NumberSetting label="VDDP" value={vddp} unit="V" min={0.850} max={1.000} step={0.005} precision={3} onChange={setVddp} />
                    <NumberSetting label="CLDO VDDP" value={cldo_vddp} unit="V" min={0.850} max={1.000} step={0.005} precision={3} onChange={setCldo_vddp} />

                    <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-3 mb-1">Memory Voltages</div>
                    <NumberSetting label="VPP" value={vpp} unit="V" min={2.400} max={2.600} step={0.010} precision={3} onChange={setVpp} />
                    <NumberSetting label="VTT DDR" value={vttDdr} unit="V" min={0.550} max={0.750} step={0.005} precision={3} onChange={setVttDdr} />

                    <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-3 mb-1">System Agent Voltages</div>
                    <NumberSetting label="VCCSA" value={vccsa} unit="V" min={0.850} max={1.100} step={0.005} precision={3} onChange={setVccsa} />
                    <NumberSetting label="VCCIO" value={vccio} unit="V" min={0.850} max={1.100} step={0.005} precision={3} onChange={setVccio} />
                    <NumberSetting label="VCCST" value={vccst} unit="V" min={0.950} max={1.150} step={0.005} precision={3} onChange={setVccst} />
                    <NumberSetting label="VCCPLL" value={vccpll} unit="V" min={1.700} max={1.900} step={0.010} precision={3} onChange={setVccpll} />
                    <NumberSetting label="1.8V" value={v1p8} unit="V" min={1.750} max={1.850} step={0.010} precision={3} onChange={setV1p8} />
                    <NumberSetting label="1.2V" value={v1p2} unit="V" min={1.150} max={1.250} step={0.010} precision={3} onChange={setV1p2} />
                    <NumberSetting label="1.0V" value={v1p0} unit="V" min={0.950} max={1.050} step={0.010} precision={3} onChange={setV1p0} />
                  </>
                )}

                {advancedCategory === 'vrm' && (
                  <>
                    <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mb-1">CPU VRM Settings</div>
                    <SelectOption label="CPU Power Phase Control" value={cpuPowerPhaseControl} options={['Auto', 'Standard', 'Extreme', 'Manual']} onChange={setCpuPowerPhaseControl as any} />
                    <SelectOption label="CPU VRM Switching Frequency" value={cpuVrmSwitchingFrequency} options={['Auto', '300', '350', '400', '450', '500']} onChange={setCpuVrmSwitchingFrequency as any} />
                    <NumberSetting label="CPU Current Capability" value={cpuCurrentCapability} unit="%" min={100} max={140} step={5} onChange={setCpuCurrentCapability} />

                    <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-3 mb-1">SoC VRM Settings</div>
                    <SelectOption label="SoC Power Phase Control" value={socPowerPhaseControl} options={['Auto', 'Standard', 'Extreme']} onChange={setSocPowerPhaseControl as any} />
                    <SelectOption label="SoC VRM Switching Frequency" value={socVrmSwitchingFrequency} options={['Auto', '300', '350', '400']} onChange={setSocVrmSwitchingFrequency as any} />
                    <NumberSetting label="SoC Current Capability" value={socCurrentCapability} unit="%" min={100} max={140} step={5} onChange={setSocCurrentCapability} />
                  </>
                )}

                {advancedCategory === 'pcie' && (
                  <>
                    <SelectOption label="PCIe Slot 1 Speed" value={pcieSlot1Speed} options={['Auto', 'Gen1', 'Gen2', 'Gen3', 'Gen4', 'Gen5']} onChange={setPcieSlot1Speed as any} />
                    <SelectOption label="PCIe Slot 2 Speed" value={pcieSlot2Speed} options={['Auto', 'Gen1', 'Gen2', 'Gen3', 'Gen4', 'Gen5']} onChange={setPcieSlot2Speed as any} />
                    <SelectOption label="PCIe Slot 3 Speed" value={pcieSlot3Speed} options={['Auto', 'Gen1', 'Gen2', 'Gen3', 'Gen4', 'Gen5']} onChange={setPcieSlot3Speed as any} />
                    <SelectOption label="PCIe Slot 4 Speed" value={pcieSlot4Speed} options={['Auto', 'Gen1', 'Gen2', 'Gen3', 'Gen4', 'Gen5']} onChange={setPcieSlot4Speed as any} />
                    <SelectOption label="PCIe ASPM Support" value={pcieAspm} options={['Disabled', 'L0s', 'L1', 'L0sL1']} onChange={setPcieAspm as any} />
                    <BooleanSetting label="Above 4G Decoding" enabled={above4gDecoding} onChange={setAbove4gDecoding} />
                    <BooleanSetting label="Re-Size BAR Support" enabled={resizeBar} onChange={setResizeBar} />
                    <BooleanSetting label="SR-IOV Support" enabled={srIov} onChange={setSrIov} />
                    <BooleanSetting label="ARI Support" enabled={ariSupport} onChange={setAriSupport} />
                  </>
                )}

                {advancedCategory === 'storage' && (
                  <>
                    <SelectOption label="SATA Mode" value={sataMode} options={['AHCI', 'RAID', 'IDE']} onChange={setSataMode as any} />
                    <BooleanSetting label="SATA Hot Plug" enabled={sataHotplug} onChange={setSataHotplug} />
                    <BooleanSetting label="SATA Aggressive Link Power Management" enabled={sataAggressiveLinkPowerManagement} onChange={setSataAggressiveLinkPowerManagement} />
                    <BooleanSetting label="NVMe RAID Mode" enabled={nvmeRaidMode} onChange={setNvmeRaidMode} />

                    <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-3 mb-1">M.2 Configuration</div>
                    <SelectOption label="M.2_1 Link Speed" value={m2_1LinkSpeed} options={['Auto', 'Gen3 x4', 'Gen4 x4', 'Gen5 x4']} onChange={setM2_1LinkSpeed as any} />
                    <SelectOption label="M.2_2 Link Speed" value={m2_2LinkSpeed} options={['Auto', 'Gen3 x4', 'Gen4 x4', 'Gen5 x4']} onChange={setM2_2LinkSpeed as any} />
                    <SelectOption label="M.2_3 Link Speed" value={m2_3LinkSpeed} options={['Auto', 'Gen3 x4', 'Gen4 x4', 'Gen5 x4']} onChange={setM2_3LinkSpeed as any} />
                    <SelectOption label="M.2_4 Link Speed" value={m2_4LinkSpeed} options={['Auto', 'Gen3 x4', 'Gen4 x4', 'Gen5 x4']} onChange={setM2_4LinkSpeed as any} />
                  </>
                )}

                {advancedCategory === 'usb' && (
                  <>
                    <BooleanSetting label="USB Legacy Support" enabled={usbLegacySupport} onChange={setUsbLegacySupport} />
                    <BooleanSetting label="XHCI Hand-off" enabled={xhciHandoff} onChange={setXhciHandoff} />
                    <BooleanSetting label="EHCI Hand-off" enabled={ehciHandoff} onChange={setEhciHandoff} />
                    <BooleanSetting label="USB 3.0 Link Power Management" enabled={usb3LinkPowerManagement} onChange={setUsb3LinkPowerManagement} />
                    <SelectOption label="USB Port Power" value={usbPortPower} options={['Enabled in S3/S4/S5', 'Disabled in S3/S4/S5']} onChange={setUsbPortPower as any} />
                    <BooleanSetting label="USB Mass Storage Driver Support" enabled={usbMassStorageDriverSupport} onChange={setUsbMassStorageDriverSupport} />
                    <NumberSetting label="USB Transfer Timeout" value={usbTransferTimeout} unit="s" min={1} max={60} step={1} onChange={setUsbTransferTimeout} />
                    <NumberSetting label="Device Reset Timeout" value={deviceResetTimeout} unit="s" min={1} max={60} step={1} onChange={setDeviceResetTimeout} />
                    <SelectOption label="Device Power-up Delay" value={devicePowerupDelay} options={['Auto', 'Manual']} onChange={setDevicePowerupDelay as any} />
                  </>
                )}

                {advancedCategory === 'network' && (
                  <>
                    <BooleanSetting label="LAN Controller" enabled={lanController} onChange={setLanController} />
                    <BooleanSetting label="Wake On LAN" enabled={wakeOnLan} onChange={setWakeOnLan} />
                    <BooleanSetting label="LAN Option ROM" enabled={lanBootRom} onChange={setLanBootRom} />
                    <SelectOption label="Network Stack" value={lanPxeOpRom} options={['Disabled', 'PXE', 'iSCSI']} onChange={setLanPxeOpRom as any} />
                  </>
                )}

                {advancedCategory === 'audio' && (
                  <>
                    <BooleanSetting label="HD Audio Controller" enabled={hdAudioController} onChange={setHdAudioController} />
                    <SelectOption label="Front Panel Type" value={frontPanelType} options={['HD Audio', 'AC97']} onChange={setFrontPanelType as any} />
                    <SelectOption label="SPDIF Out Type" value={spdifOutType} options={['SPDIF', 'HDMI']} onChange={setSpdifOutType as any} />
                  </>
                )}

                {advancedCategory === 'monitor' && (
                  <>
                    <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mb-1">Temperature</div>
                    <MonitorRow label="CPU Temperature" value={`${cpuTemp}°C`} status={cpuTemp > 80 ? 'warning' : cpuTemp > 90 ? 'critical' : 'normal'} />
                    <MonitorRow label="CPU Tdie" value={`${cpuTdie}°C`} status={cpuTdie > 85 ? 'warning' : cpuTdie > 95 ? 'critical' : 'normal'} />
                    <MonitorRow label="CPU Tctl" value={`${cpuTctl}°C`} status={cpuTctl > 90 ? 'warning' : cpuTctl > 100 ? 'critical' : 'normal'} />
                    <MonitorRow label="CPU CCD1" value={`${cpuCcd1Temp}°C`} status={cpuCcd1Temp > 80 ? 'warning' : cpuCcd1Temp > 90 ? 'critical' : 'normal'} />
                    <MonitorRow label="CPU CCD2" value={`${cpuCcd2Temp}°C`} status={cpuCcd2Temp > 80 ? 'warning' : cpuCcd2Temp > 90 ? 'critical' : 'normal'} />
                    <MonitorRow label="Motherboard" value={`${mbTemp}°C`} status={mbTemp > 45 ? 'warning' : mbTemp > 55 ? 'critical' : 'normal'} />
                    <MonitorRow label="VRM" value={`${vrmTemp}°C`} status={vrmTemp > 70 ? 'warning' : vrmTemp > 85 ? 'critical' : 'normal'} />
                    <MonitorRow label="PCH" value={`${pchTemp}°C`} status={pchTemp > 50 ? 'warning' : pchTemp > 60 ? 'critical' : 'normal'} />
                    <MonitorRow label="M.2_1" value={`${m2_1Temp}°C`} status={m2_1Temp > 50 ? 'warning' : m2_1Temp > 70 ? 'critical' : 'normal'} />
                    <MonitorRow label="M.2_2" value={m2_2Temp > 0 ? `${m2_2Temp}°C` : 'N/A'} status="normal" />

                    <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-3 mb-1">Fan Speed</div>
                    <MonitorRow label="CPU Fan" value={`${cpuFanRpm} RPM`} status={cpuFanRpm < 300 ? 'warning' : 'normal'} />
                    <MonitorRow label="CPU OPT Fan" value={cpuOptFanRpm > 0 ? `${cpuOptFanRpm} RPM` : 'N/A'} status="normal" />
                    <MonitorRow label="Chassis Fan 1" value={`${chassisFan1Rpm} RPM`} status={chassisFan1Rpm < 300 ? 'warning' : 'normal'} />
                    <MonitorRow label="Chassis Fan 2" value={`${chassisFan2Rpm} RPM`} status={chassisFan2Rpm < 300 ? 'warning' : 'normal'} />
                    <MonitorRow label="Chassis Fan 3" value={`${chassisFan3Rpm} RPM`} status={chassisFan3Rpm < 300 ? 'warning' : 'normal'} />
                    <MonitorRow label="AIO Pump" value={`${aioRpm} RPM`} status={aioRpm < 500 ? 'critical' : 'normal'} />

                    <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-3 mb-1">Voltage</div>
                    <MonitorRow label="CPU Core" value={`${cpuVoltageMonitor.toFixed(3)}V`} status="normal" />
                    <MonitorRow label="CPU SoC" value={`${socVoltageMonitor.toFixed(3)}V`} status="normal" />
                    <MonitorRow label="DRAM" value={`${dramVoltageMonitor.toFixed(3)}V`} status="normal" />
                    <MonitorRow label="+12V" value={`${v12Monitor.toFixed(3)}V`} status={v12Monitor < 11.4 || v12Monitor > 12.6 ? 'warning' : 'normal'} />
                    <MonitorRow label="+5V" value={`${v5Monitor.toFixed(3)}V`} status={v5Monitor < 4.75 || v5Monitor > 5.25 ? 'warning' : 'normal'} />
                    <MonitorRow label="+3.3V" value={`${v33Monitor.toFixed(3)}V`} status={v33Monitor < 3.135 || v33Monitor > 3.465 ? 'warning' : 'normal'} />
                    <MonitorRow label="VBAT" value={`${vbatMonitor.toFixed(3)}V`} status={vbatMonitor < 2.9 ? 'warning' : 'normal'} />

                    <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-3 mb-1">Power</div>
                    <MonitorRow label="CPU Package Power" value={`${cpuPower}W`} status={cpuPower > 120 ? 'warning' : cpuPower > 150 ? 'critical' : 'normal'} />
                    <MonitorRow label="SoC Power" value={`${socPower}W`} status={socPower > 25 ? 'warning' : 'normal'} />
                  </>
                )}

                {advancedCategory === 'fan' && (
                  <>
                    <SelectOption label="Fan Profile" value={fanProfile} options={['Silent', 'Standard', 'Turbo', 'Full Speed', 'Manual']} onChange={setFanProfile as any} />

                    <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-3 mb-1">CPU Fan Settings</div>
                    <SelectOption label="CPU Fan Mode" value={cpuFanMode} options={['PWM', 'DC', 'Auto']} onChange={setCpuFanMode as any} />
                    {fanProfile === 'Manual' && (
                      <NumberSetting label="CPU Fan Speed" value={cpuFanSpeed} unit="%" min={20} max={100} step={5} onChange={setCpuFanSpeed} />
                    )}

                    <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-3 mb-1">CPU OPT Fan Settings</div>
                    <SelectOption label="CPU OPT Fan Mode" value={cpuOptFanMode} options={['PWM', 'DC', 'Auto', 'Disabled']} onChange={setCpuOptFanMode as any} />
                    {fanProfile === 'Manual' && cpuOptFanMode !== 'Disabled' && (
                      <NumberSetting label="CPU OPT Fan Speed" value={cpuOptFanSpeed} unit="%" min={20} max={100} step={5} onChange={setCpuOptFanSpeed} />
                    )}

                    <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-3 mb-1">Chassis Fan Settings</div>
                    <SelectOption label="Chassis Fan 1 Mode" value={chassisFan1Mode} options={['PWM', 'DC', 'Auto', 'Disabled']} onChange={setChassisFan1Mode as any} />
                    {fanProfile === 'Manual' && chassisFan1Mode !== 'Disabled' && (
                      <NumberSetting label="Chassis Fan 1 Speed" value={chassisFan1Speed} unit="%" min={20} max={100} step={5} onChange={setChassisFan1Speed} />
                    )}

                    <SelectOption label="Chassis Fan 2 Mode" value={chassisFan2Mode} options={['PWM', 'DC', 'Auto', 'Disabled']} onChange={setChassisFan2Mode as any} />
                    {fanProfile === 'Manual' && chassisFan2Mode !== 'Disabled' && (
                      <NumberSetting label="Chassis Fan 2 Speed" value={chassisFan2Speed} unit="%" min={20} max={100} step={5} onChange={setChassisFan2Speed} />
                    )}

                    <SelectOption label="Chassis Fan 3 Mode" value={chassisFan3Mode} options={['PWM', 'DC', 'Auto', 'Disabled']} onChange={setChassisFan3Mode as any} />
                    {fanProfile === 'Manual' && chassisFan3Mode !== 'Disabled' && (
                      <NumberSetting label="Chassis Fan 3 Speed" value={chassisFan3Speed} unit="%" min={20} max={100} step={5} onChange={setChassisFan3Speed} />
                    )}

                    <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-3 mb-1">AIO Pump Settings</div>
                    <SelectOption label="AIO Pump Mode" value={aioMode} options={['PWM', 'DC', 'Auto', 'Disabled']} onChange={setAioMode as any} />
                    {fanProfile === 'Manual' && aioMode !== 'Disabled' && (
                      <NumberSetting label="AIO Pump Speed" value={aioSpeed} unit="%" min={60} max={100} step={5} onChange={setAioSpeed} />
                    )}
                  </>
                )}

                {advancedCategory === 'thermal' && (
                  <>
                    <NumberSetting label="CPU Temperature Target" value={cpuTempTarget} unit="°C" min={60} max={85} step={5} onChange={setCpuTempTarget} />
                    <NumberSetting label="CPU Upper Temperature" value={cpuUpperTemp} unit="°C" min={75} max={95} step={5} onChange={setCpuUpperTemp} />
                    <NumberSetting label="CPU Maximum Temperature" value={cpuMaxTemp} unit="°C" min={85} max={105} step={5} onChange={setCpuMaxTemp} />

                    <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-3 mb-1">Fan Stop Configuration</div>
                    <BooleanSetting label="Fan Stop" enabled={fanStopEnabled} onChange={setFanStopEnabled} />
                    {fanStopEnabled && (
                      <>
                        <NumberSetting label="CPU Fan Stop Temperature" value={cpuFanStopTemp} unit="°C" min={25} max={45} step={5} onChange={setCpuFanStopTemp} />
                        <NumberSetting label="CPU Fan Start Temperature" value={cpuFanStartTemp} unit="°C" min={30} max={50} step={5} onChange={setCpuFanStartTemp} />
                      </>
                    )}

                    <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-3 mb-1">Fan Curve Control</div>
                    <NumberSetting label="CPU Fan Max Temperature" value={cpuFanMaxTemp} unit="°C" min={65} max={85} step={5} onChange={setCpuFanMaxTemp} />
                    <NumberSetting label="CPU Fan Max Duty Cycle" value={cpuFanMaxDuty} unit="%" min={60} max={100} step={5} onChange={setCpuFanMaxDuty} />
                    <NumberSetting label="CPU Fan Min Duty Cycle" value={cpuFanMinDuty} unit="%" min={20} max={60} step={5} onChange={setCpuFanMinDuty} />
                    <NumberSetting label="CPU Fan Step Up" value={cpuFanStepUp} unit="°C/s" min={1} max={10} step={1} onChange={setCpuFanStepUp} />
                    <NumberSetting label="CPU Fan Step Down" value={cpuFanStepDown} unit="°C/s" min={1} max={10} step={1} onChange={setCpuFanStepDown} />
                    <NumberSetting label="CPU Fan Speed Low Limit" value={cpuFanSpeedLowLimit} unit="RPM" min={200} max={800} step={100} onChange={setCpuFanSpeedLowLimit} />
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 'chipset':
        return (
          <div className="space-y-1">
            <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mb-2">PCIe Configuration</div>
            <BooleanSetting label="Above 4G Decoding" enabled={above4gDecoding} onChange={setAbove4gDecoding} />
            <BooleanSetting label="Re-Size BAR Support" enabled={resizeBar} onChange={setResizeBar} />
            <BooleanSetting label="SR-IOV Support" enabled={srIov} onChange={setSrIov} />
            <SelectOption label="PCIe ASPM Support" value={pcieAspm} options={['Disabled', 'L0s', 'L1', 'L0sL1']} onChange={setPcieAspm as any} />

            <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-4 mb-2">Storage Configuration</div>
            <SelectOption label="SATA Mode" value={sataMode} options={['AHCI', 'RAID', 'IDE']} onChange={setSataMode as any} />
            <BooleanSetting label="SATA Hot Plug" enabled={sataHotplug} onChange={setSataHotplug} />
            <BooleanSetting label="NVMe RAID Mode" enabled={nvmeRaidMode} onChange={setNvmeRaidMode} />

            <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-4 mb-2">USB Configuration</div>
            <BooleanSetting label="USB Legacy Support" enabled={usbLegacySupport} onChange={setUsbLegacySupport} />
            <BooleanSetting label="XHCI Hand-off" enabled={xhciHandoff} onChange={setXhciHandoff} />
            <SelectOption label="USB Port Power" value={usbPortPower} options={['Enabled in S3/S4/S5', 'Disabled in S3/S4/S5']} onChange={setUsbPortPower as any} />

            <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-4 mb-2">Network Configuration</div>
            <BooleanSetting label="LAN Controller" enabled={lanController} onChange={setLanController} />
            <BooleanSetting label="Wake On LAN" enabled={wakeOnLan} onChange={setWakeOnLan} />
            <SelectOption label="Network Stack" value={lanPxeOpRom} options={['Disabled', 'PXE', 'iSCSI']} onChange={setLanPxeOpRom as any} />
          </div>
        );

      case 'security':
        return (
          <div className="space-y-1">
            <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mb-2">Administrator Password</div>
            <PasswordSetting label="Administrator Password" isSet={supervisorPasswordSet} onChange={setSupervisorPasswordSet} />

            <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-4 mb-2">User Password</div>
            <PasswordSetting label="User Password" isSet={userPasswordSet} onChange={setUserPasswordSet} />

            <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-4 mb-2">Secure Boot Configuration</div>
            <BooleanSetting label="Secure Boot" enabled={secureBoot} onChange={setSecureBoot} />
            {secureBoot && (
              <>
                <SelectOption label="Secure Boot Mode" value={secureBootMode} options={['Standard', 'Custom']} onChange={setSecureBootMode as any} />
                <SelectOption label="Secure Boot Keys" value={secureBootKeys} options={['Default', 'Custom']} onChange={setSecureBootKeys as any} />
              </>
            )}

            <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-4 mb-2">TPM Configuration</div>
            <BooleanSetting label="Security Device Support" enabled={tpmEnabled} onChange={setTpmEnabled} />
            {tpmEnabled && (
              <>
                <InfoRow label="TPM Version" value="2.0" />
                <InfoRow label="TPM State" value="Enabled and Activated" />
              </>
            )}
          </div>
        );

      case 'boot':
        return (
          <div className="space-y-1">
            <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mb-2">Boot Configuration</div>
            <BooleanSetting label="Fast Boot" enabled={fastBoot} onChange={setFastBoot} />
            {fastBoot && (
              <BooleanSetting label="Ultra Fast Boot" enabled={ultraFastBoot} onChange={setUltraFastBoot} />
            )}
            <NumberSetting label="POST Delay Time" value={postDelay} unit="s" min={0} max={10} step={1} onChange={setPostDelay} />
            <NumberSetting label="Boot Menu Timeout" value={bootTimeout} unit="s" min={0} max={30} step={1} onChange={setBootTimeout} />

            <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-4 mb-2">Boot Priority</div>
            <div className="space-y-2">
              {bootOrder.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-8 text-right text-[#7cb8e4]">{idx + 1}.</span>
                  <span className="flex-1">{item}</span>
                  <div className="flex gap-1">
                    <button
                      className="px-2 py-1 bg-[#1a3a52] hover:bg-[#2a4a62] rounded text-xs"
                      onClick={() => {
                        if (idx > 0) {
                          const newOrder = [...bootOrder];
                          [newOrder[idx], newOrder[idx - 1]] = [newOrder[idx - 1], newOrder[idx]];
                          setBootOrder(newOrder);
                        }
                      }}
                      disabled={idx === 0}
                    >↑</button>
                    <button
                      className="px-2 py-1 bg-[#1a3a52] hover:bg-[#2a4a62] rounded text-xs"
                      onClick={() => {
                        if (idx < bootOrder.length - 1) {
                          const newOrder = [...bootOrder];
                          [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
                          setBootOrder(newOrder);
                        }
                      }}
                      disabled={idx === bootOrder.length - 1}
                    >↓</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-4 mb-2">Boot Options</div>
            <BooleanSetting label="Boot Logo Display" enabled={bootLogo} onChange={setBootLogo} />
            {bootLogo && (
              <BooleanSetting label="Full Screen Logo" enabled={fullScreenLogo} onChange={setFullScreenLogo} />
            )}
            <BooleanSetting label="POST Report" enabled={bootBeep} onChange={setBootBeep} />
            <BooleanSetting label="Wait For 'F1' If Error" enabled={waitForF1} onChange={setWaitForF1} />
            <SelectOption label="Bootup NumLock State" value={bootupNumLockState} options={['On', 'Off']} onChange={setBootupNumLockState as any} />

            <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-4 mb-2">CSM (Compatibility Support Module)</div>
            <BooleanSetting label="Launch CSM" enabled={csm} onChange={setCsm} />
            {csm && (
              <>
                <SelectOption label="Boot Device Control" value={bootDeviceControl} options={['UEFI and Legacy', 'UEFI only', 'Legacy only']} onChange={setBootDeviceControl as any} />
                <SelectOption label="Boot from Storage Devices" value={bootFromStorageDevices} options={['Both, UEFI first', 'Both, Legacy first', 'UEFI only', 'Legacy only']} onChange={setBootFromStorageDevices as any} />
                <SelectOption label="Boot from PCI-E/PCI Expansion Devices" value={bootFromPciExpansion} options={['UEFI only', 'Legacy only']} onChange={setBootFromPciExpansion as any} />
                <SelectOption label="Boot from Network" value={bootFromNetwork} options={['UEFI only', 'Legacy only']} onChange={setBootFromNetwork as any} />
              </>
            )}

            <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-4 mb-2">OS Configuration</div>
            <SelectOption label="OS Type" value={osType} options={['Windows UEFI', 'Other OS']} onChange={setOsType as any} />
          </div>
        );

      case 'tools':
        return (
          <div className="space-y-1">
            <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mb-2">ASUS EZ Flash 3 Utility</div>
            <div className="bg-[#0a2540] p-4 rounded">
              <p className="text-sm mb-3">Update BIOS from file</p>
              <button className="px-4 py-2 bg-[#1a3a52] hover:bg-[#2a4a62] rounded">Browse</button>
            </div>

            <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-4 mb-2">ASUS SPD Information</div>
            <div className="bg-[#0a2540] p-4 rounded">
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="DIMM_A1" value="32GB DDR5-6000 CL30" />
                <InfoRow label="DIMM_A2" value="32GB DDR5-6000 CL30" />
                <InfoRow label="DIMM_B1" value="Empty" />
                <InfoRow label="DIMM_B2" value="Empty" />
              </div>
            </div>

            <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-4 mb-2">ASUS O.C. Profile</div>
            <div className="bg-[#0a2540] p-4 rounded space-y-2">
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-[#1a3a52] hover:bg-[#2a4a62] rounded text-xs">Save to Profile 1</button>
                <button className="px-3 py-1 bg-[#1a3a52] hover:bg-[#2a4a62] rounded text-xs">Load from Profile 1</button>
                <button className="px-3 py-1 bg-[#1a3a52] hover:bg-[#2a4a62] rounded text-xs">Clear Profile 1</button>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-[#1a3a52] hover:bg-[#2a4a62] rounded text-xs">Save to Profile 2</button>
                <button className="px-3 py-1 bg-[#1a3a52] hover:bg-[#2a4a62] rounded text-xs">Load from Profile 2</button>
                <button className="px-3 py-1 bg-[#1a3a52] hover:bg-[#2a4a62] rounded text-xs">Clear Profile 2</button>
              </div>
            </div>
          </div>
        );

      case 'exit':
        return (
          <div className="space-y-4">
            <button
              className="w-full py-3 bg-[#0d5a9d] hover:bg-[#1a6ab0] rounded text-left px-4"
              onClick={() => onExit('save-exit')}
            >
              <div className="font-bold">Save Changes and Exit</div>
              <div className="text-xs text-[#a8d8ff] mt-1">Save configuration changes and exit Setup</div>
            </button>

            <button
              className="w-full py-3 bg-[#1a3a52] hover:bg-[#2a4a62] rounded text-left px-4"
              onClick={() => onExit('discard-exit')}
            >
              <div className="font-bold">Discard Changes and Exit</div>
              <div className="text-xs text-[#a8d8ff] mt-1">Exit Setup without saving any changes</div>
            </button>

            <button
              className="w-full py-3 bg-[#1a3a52] hover:bg-[#2a4a62] rounded text-left px-4"
              onClick={() => {}}
            >
              <div className="font-bold">Save Changes</div>
              <div className="text-xs text-[#a8d8ff] mt-1">Save configuration changes</div>
            </button>

            <button
              className="w-full py-3 bg-[#1a3a52] hover:bg-[#2a4a62] rounded text-left px-4"
              onClick={() => {}}
            >
              <div className="font-bold">Discard Changes</div>
              <div className="text-xs text-[#a8d8ff] mt-1">Reset configuration changes</div>
            </button>

            <button
              className="w-full py-3 bg-[#1a3a52] hover:bg-[#2a4a62] rounded text-left px-4"
              onClick={loadOptimizedDefaults}
            >
              <div className="font-bold">Load Optimized Defaults</div>
              <div className="text-xs text-[#a8d8ff] mt-1">Load optimal default settings for this system</div>
            </button>

            <button
              className="w-full py-3 bg-[#1a3a52] hover:bg-[#2a4a62] rounded text-left px-4"
              onClick={() => {}}
            >
              <div className="font-bold">Boot Override</div>
              <div className="text-xs text-[#a8d8ff] mt-1">Force boot from specific device</div>
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#001428] text-[#e8f4ff] font-mono text-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003366] to-[#004488] px-6 py-2 flex items-center justify-between border-b-2 border-[#0066cc]">
        <div className="flex items-center gap-6">
          <div className="text-lg font-bold tracking-wide">Phoenix SecureCore Technology™ Setup Utility</div>
          <div className="text-[#a8d8ff]">Copyright (C) 2024 Phoenix Technologies Ltd.</div>
        </div>
        <div className="text-[#a8d8ff]">{systemTime.toLocaleString()}</div>
      </div>

      {/* Tab Bar */}
      <div className="bg-[#002244] px-6 py-1 flex items-center gap-8 border-b border-[#004488]">
        {(['main', 'advanced', 'chipset', 'security', 'boot', 'tools', 'exit'] as Tab[]).map((t) => (
          <button
            key={t}
            className={`px-3 py-1 uppercase tracking-wider transition-colors ${
              tab === t 
                ? 'text-white bg-[#0066cc] rounded' 
                : 'text-[#a8d8ff] hover:text-white'
            }`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
        <div className="ml-auto text-[#7cb8e4]">
          Mode: <span className="text-white">{mode === 'advanced' ? 'Advanced' : 'EZ'}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl">
            {renderContent()}
          </div>
        </div>

        {/* Help Panel */}
        <div className="w-80 bg-[#001833] border-l border-[#003366] p-4 overflow-y-auto">
          <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mb-3">Help</div>
          <div className="space-y-2 text-[11px] text-[#a8d8ff]">
            <HelpItem keys="F1" action="General Help" />
            <HelpItem keys="F5" action="Load Optimized Defaults" />
            <HelpItem keys="F7" action="Switch to EZ/Advanced Mode" />
            <HelpItem keys="F10" action="Save and Exit" />
            <HelpItem keys="ESC" action="Exit" />
            <HelpItem keys="←→" action="Switch between tabs" />
            <HelpItem keys="↑↓" action="Select Item" />
            <HelpItem keys="Enter" action="Select Sub-Menu" />
            <HelpItem keys="+/-" action="Change Values" />
          </div>

          <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-6 mb-3">Selected Item Help</div>
          <div className="text-[11px] text-[#a8d8ff] leading-relaxed">
            {tab === 'main' && "Main menu displays system overview and configuration summary. Use this screen to view basic system information."}
            {tab === 'advanced' && "Advanced menu allows fine-tuning of CPU, memory, voltage, and other system parameters. Use with caution."}
            {tab === 'chipset' && "Chipset menu configures PCIe, storage, USB, and integrated peripherals settings."}
            {tab === 'security' && "Security menu manages passwords, Secure Boot, and TPM configuration."}
            {tab === 'boot' && "Boot menu sets boot device priority and boot-related options."}
            {tab === 'tools' && "Tools menu provides utilities for BIOS updates and system information."}
            {tab === 'exit' && "Exit menu allows saving or discarding changes and exiting Setup."}
          </div>

          <div className="text-[#7cb8e4] text-xs uppercase tracking-wider mt-6 mb-3">System Status</div>
          <div className="space-y-1 text-[11px]">
            <StatusItem label="CPU Temp" value={`${cpuTemp}°C`} status={cpuTemp > 80 ? 'warning' : 'normal'} />
            <StatusItem label="VRM Temp" value={`${vrmTemp}°C`} status={vrmTemp > 70 ? 'warning' : 'normal'} />
            <StatusItem label="CPU Fan" value={`${cpuFanRpm} RPM`} status={cpuFanRpm < 300 ? 'warning' : 'normal'} />
            <StatusItem label="CPU Power" value={`${cpuPower}W`} status={cpuPower > 120 ? 'warning' : 'normal'} />
            <StatusItem label="DRAM" value={`${dramVoltageMonitor.toFixed(3)}V`} status="normal" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#002244] px-6 py-2 flex items-center justify-between border-t border-[#004488]">
        <div className="flex items-center gap-6 text-[11px]">
          <span className="text-[#7cb8e4]">Version: <span className="text-white">{biosVersion}</span></span>
          <span className="text-[#7cb8e4]">Build Date: <span className="text-white">{biosDate}</span></span>
          <span className="text-[#7cb8e4]">EC Version: <span className="text-white">MBEC-0215-T</span></span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <button className="px-3 py-1 bg-[#1a3a52] hover:bg-[#2a4a62] rounded">F5: Defaults</button>
          <button className="px-3 py-1 bg-[#1a3a52] hover:bg-[#2a4a62] rounded" onClick={() => setMode(prev => prev === 'advanced' ? 'ez' : 'advanced')}>F7: {mode === 'advanced' ? 'EZ Mode' : 'Advanced'}</button>
          <button className="px-3 py-1 bg-[#0d5a9d] hover:bg-[#1a6ab0] rounded" onClick={() => onExit('save-exit')}>F10: Save & Exit</button>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoRow: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className="flex items-center justify-between py-0.5">
    <span className="text-[#a8d8ff]">{label}</span>
    <span className={highlight ? 'text-yellow-400 font-bold' : ''}>{value}</span>
  </div>
);

const MonitorRow: React.FC<{ label: string; value: string; status: 'normal' | 'warning' | 'critical' }> = ({ label, value, status }) => (
  <div className="flex items-center justify-between py-0.5">
    <span className="text-[#a8d8ff]">{label}</span>
    <span className={
      status === 'critical' ? 'text-red-400' :
      status === 'warning' ? 'text-yellow-400' :
      ''
    }>{value}</span>
  </div>
);

const BooleanSetting: React.FC<{ label: string; enabled: boolean; onChange: (v: boolean) => void }> = ({ label, enabled, onChange }) => (
  <div className="flex items-center justify-between py-1 px-2 hover:bg-[#0a2540] rounded">
    <span>{label}</span>
    <button
      className={`px-3 py-1 rounded text-xs ${enabled ? 'bg-[#0066cc]' : 'bg-[#1a3a52]'} hover:bg-[#0d5a9d]`}
      onClick={() => onChange(!enabled)}
    >
      {enabled ? 'Enabled' : 'Disabled'}
    </button>
  </div>
);

const SelectOption: React.FC<{ label: string; value: string; options: string[]; onChange: (v: string) => void }> = ({ label, value, options, onChange }) => (
  <div className="flex items-center justify-between py-1 px-2 hover:bg-[#0a2540] rounded">
    <span>{label}</span>
    <select
      className="bg-[#1a3a52] px-3 py-1 rounded text-xs border border-[#2a4a62] focus:outline-none focus:border-[#0066cc]"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const NumberSetting: React.FC<{
  label: string;
  value: number;
  unit?: string;
  min: number;
  max: number;
  step: number;
  precision?: number;
  onChange: (v: number) => void
}> = ({ label, value, unit, min, max, step, precision = 0, onChange }) => (
  <div className="flex items-center justify-between py-1 px-2 hover:bg-[#0a2540] rounded">
    <span>{label}</span>
    <div className="flex items-center gap-2">
      <button
        className="px-2 py-1 bg-[#1a3a52] hover:bg-[#2a4a62] rounded text-xs"
        onClick={() => onChange(Math.max(min, value - step))}
      >-</button>
      <span className="w-20 text-center font-mono">
        {value.toFixed(precision)}{unit ? ` ${unit}` : ''}
      </span>
      <button
        className="px-2 py-1 bg-[#1a3a52] hover:bg-[#2a4a62] rounded text-xs"
        onClick={() => onChange(Math.min(max, value + step))}
      >+</button>
    </div>
  </div>
);

const PasswordSetting: React.FC<{ label: string; isSet: boolean; onChange: (v: boolean) => void }> = ({ label, isSet, onChange }) => (
  <div className="flex items-center justify-between py-1 px-2 hover:bg-[#0a2540] rounded">
    <span>{label}</span>
    <div className="flex items-center gap-2">
      <span className={`text-xs ${isSet ? 'text-yellow-400' : 'text-[#7cb8e4]'}`}>
        {isSet ? 'Set' : 'Not Set'}
      </span>
      <button
        className="px-3 py-1 bg-[#1a3a52] hover:bg-[#2a4a62] rounded text-xs"
        onClick={() => onChange(!isSet)}
      >
        {isSet ? 'Clear' : 'Set'}
      </button>
    </div>
  </div>
);

const CategoryItem: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    className={`w-full text-left px-3 py-1.5 rounded transition-colors ${
      active 
        ? 'bg-[#0066cc] text-white' 
        : 'hover:bg-[#1a3a52] text-[#a8d8ff] hover:text-white'
    }`}
    onClick={onClick}
  >
    {label}
  </button>
);

const MonitorValue: React.FC<{ label: string; value: string; status: 'normal' | 'warning' | 'critical' }> = ({ label, value, status }) => (
  <div className="bg-[#0a2540] p-3 rounded">
    <div className="text-[#7cb8e4] text-[10px] uppercase mb-1">{label}</div>
    <div className={`text-lg font-mono ${
      status === 'critical' ? 'text-red-400' :
      status === 'warning' ? 'text-yellow-400' :
      'text-white'
    }`}>{value}</div>
  </div>
);

const HelpItem: React.FC<{ keys: string; action: string }> = ({ keys, action }) => (
  <div className="flex items-center gap-2">
    <span className="text-white bg-[#1a3a52] px-2 py-0.5 rounded text-[10px] font-mono">{keys}</span>
    <span>{action}</span>
  </div>
);

const StatusItem: React.FC<{ label: string; value: string; status: 'normal' | 'warning' }> = ({ label, value, status }) => (
  <div className="flex items-center justify-between">
    <span className="text-[#7cb8e4]">{label}:</span>
    <span className={status === 'warning' ? 'text-yellow-400' : 'text-white'}>{value}</span>
  </div>
);

export default BiosSetup;