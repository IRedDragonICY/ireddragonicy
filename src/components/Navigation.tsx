'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { FaBrain, FaGraduationCap, FaTerminal, FaGlobeAmericas, FaWifi, FaServer } from 'react-icons/fa';
import {
  BiHomeAlt,
  BiCodeAlt,
  BiStats
} from 'react-icons/bi';
import { RiArticleLine, RiShareLine } from 'react-icons/ri';
import { TbBrain } from 'react-icons/tb';
import { BsCpu, BsGpuCard } from 'react-icons/bs';

// Stable list of section ids used for scroll tracking on the homepage
const HOME_SECTION_IDS: string[] = [
  'home'
];

interface NavigationProps {
  personalInfo?: {
    alias: string;
  };
}

// --- Components ---

const StatusTicker = () => {
  return (
    <div className="overflow-hidden whitespace-nowrap w-full max-w-xs sm:max-w-md lg:max-w-lg opacity-50 text-[9px] font-mono">
      <motion.div
        className="inline-block"
        animate={{ x: ["100%", "-100%"] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      >
        SYS.MSG: NEURAL INTERFACE CONNECTED // SECURE CHANNEL ESTABLISHED // ENCRYPTION: AES-256 // LATENCY: 12ms // REGION: ASIA-SE // WELCOME USER_01
      </motion.div>
    </div>
  );
};

const Clock = () => {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'UTC'
      }));
      setDate(now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-end leading-none">
      <span className="text-[10px] font-bold text-white font-mono">{time} <span className="text-[8px] text-gray-500">UTC</span></span>
      <span className="text-[8px] text-gray-500 font-mono">{date}</span>
    </div>
  );
};

const Navigation = ({ personalInfo = { alias: 'IRedDragonICY' } }: NavigationProps) => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrollProgress, setScrollProgress] = useState(0);

  const { scrollYProgress } = useScroll();
  const headerY = useTransform(scrollYProgress, [0, 0.05], [0, -32]); // Hide top bar on scroll

  // Check if we're on the blog page
  const isBlogPage = pathname?.startsWith('/blog');

  // Navigation links for homepage with modern icons
  const homeNavLinks = [
    { id: 'home', label: 'Home', icon: BiHomeAlt, href: '#home' },
    { id: 'education', label: 'Education', icon: FaGraduationCap, href: '/education' },
    { id: 'donate', label: 'Donate', icon: TbBrain, href: '/donate' },
    { id: 'social', label: 'Social', icon: RiShareLine, href: '/social' },
    { id: 'assets', label: 'Assets', icon: BiCodeAlt, href: '/assets' },
    { id: 'blog', label: 'Blog', icon: RiArticleLine, href: '/blog' }
  ];

  // Navigation links for blog page should mirror homepage order exactly
  const blogNavLinks = [
    { id: 'home', label: 'Home', icon: BiHomeAlt, href: '/' },
    { id: 'education', label: 'Education', icon: FaGraduationCap, href: '/education' },
    { id: 'donate', label: 'Donate', icon: TbBrain, href: '/donate' },
    { id: 'social', label: 'Social', icon: RiShareLine, href: '/social' },
    { id: 'assets', label: 'Assets', icon: BiCodeAlt, href: '/assets' },
    { id: 'blog', label: 'Blog', icon: RiArticleLine, href: '/blog' }
  ];

  const navLinks = isBlogPage ? blogNavLinks : homeNavLinks;
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrolled(currentScroll > 50);
      
      // Update scroll progress %
      const winHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(Math.round((currentScroll / winHeight) * 100) || 0);

      // Only track sections on homepage
      if (!isBlogPage) {
        const current = HOME_SECTION_IDS.find(section => {
          if (section === 'blog') return false; // Skip blog link for section tracking
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            return rect.top <= 100 && rect.bottom >= 100;
          }
          return false;
        });
        if (current) setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isBlogPage]);

  // Set active section based on pathname
  useEffect(() => {
    if (isBlogPage) {
      setActiveSection('blog');
    } else if (pathname === '/') {
      setActiveSection('home');
    }
  }, [pathname, isBlogPage]);

  const handleNavClick = (linkId: string) => {
    setActiveSection(linkId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        {/* 1. Top Status Bar (Hides on Scroll) */}
        <motion.div 
          className="h-8 bg-[#050505] border-b border-white/5 flex items-center justify-between px-4 sm:px-6 lg:px-8 pointer-events-auto relative overflow-hidden"
          style={{ y: headerY, opacity: useTransform(scrollYProgress, [0, 0.05], [1, 0]) }}
        >
           <div className="flex items-center gap-4 md:gap-8 w-full">
              {/* Left Stats */}
              <div className="hidden md:flex items-center gap-4 text-[9px] font-mono text-gray-500">
                 <div className="flex items-center gap-1.5">
                    <FaGlobeAmericas className="text-gray-600" />
                    <span>LOC: ID-JKT</span>
                 </div>
                 <div className="w-px h-3 bg-white/10" />
                 <div className="flex items-center gap-1.5">
                    <FaServer className="text-gray-600" />
                    <span>SERVER: ONLINE</span>
                 </div>
              </div>

              {/* Center Ticker */}
              <div className="flex-1 flex justify-center">
                 <StatusTicker />
              </div>

              {/* Right Stats */}
              <div className="hidden md:flex items-center gap-4 text-[9px] font-mono text-gray-500">
                 <div className="flex items-center gap-1.5">
                    <FaWifi className="text-green-600 animate-pulse" />
                    <span className="text-green-500">LINK_STABLE</span>
                 </div>
                 <div className="w-px h-3 bg-white/10" />
                 <div className="flex items-center gap-1.5">
                    <BsCpu className="text-gray-600" />
                    <span>CPU: 12%</span>
                 </div>
              </div>
           </div>
           
           {/* Animated Scanline for Top Bar */}
           <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-[scanline_3s_linear_infinite]" />
        </motion.div>

        {/* 2. Main Navigation Deck */}
        <div className={`
           pointer-events-auto transition-all duration-500 border-b border-white/5
           ${scrolled ? 'bg-[#050505]/90 backdrop-blur-md py-2 shadow-2xl' : 'bg-[#050505] py-4'}
        `}>
           <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                 
                 {/* Brand Identity */}
                 <Link href="/" className="group flex items-center gap-4">
                    <div className="relative w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden rounded-sm group-hover:border-white/20 transition-colors">
                       <FaBrain className="text-gray-400 group-hover:text-white transition-colors" />
                       <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                       {/* Corner Accents */}
                       <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-white/30" />
                       <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-white/30" />
                    </div>
                    <div className="flex flex-col">
                       <h1 className="text-sm font-bold text-white font-mono tracking-widest uppercase group-hover:text-cyan-400 transition-colors">
                          {personalInfo.alias}
                       </h1>
                       <div className="flex items-center gap-2 text-[8px] text-gray-600 font-mono tracking-[0.2em] uppercase">
                          <span>Research Unit</span>
                          <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                       </div>
                    </div>
                 </Link>

                 {/* Desktop Nav Links - The "Deck" */}
                 <nav className="hidden lg:flex items-center gap-1 p-1 bg-white/[0.02] border border-white/5 rounded-sm">
                    {navLinks.filter(l => l.id !== 'donate').map(link => {
                       const isHashLink = link.href.startsWith('#');
                       const effectiveHref = isHashLink ? `${isHomePage ? '' : '/'}${link.href}` : link.href;
                       const isExternal = effectiveHref.startsWith('http');
                       const isActive = isHashLink
                         ? (!isBlogPage && isHomePage && activeSection === link.id)
                         : (pathname === effectiveHref || (effectiveHref !== '/' && pathname?.startsWith(effectiveHref)) || (isBlogPage && link.id === 'blog' && pathname === '/blog'));

                       return (
                          <div key={link.id} className="relative">
                             {isExternal ? (
                                <a 
                                  href={effectiveHref}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className={`
                                    relative px-5 py-2 text-[10px] font-mono uppercase tracking-widest transition-all duration-300 block
                                    ${isActive ? 'text-black bg-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                                  `}
                                >
                                   {link.label}
                                </a>
                             ) : (
                                <Link 
                                  href={effectiveHref}
                                  onClick={() => handleNavClick(link.id)}
                                  className={`
                                    relative px-5 py-2 text-[10px] font-mono uppercase tracking-widest transition-all duration-300 block
                                    ${isActive ? 'text-black bg-white font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                                  `}
                                >
                                   {/* Hover Bracket Effect */}
                                   <span className="relative z-10 flex items-center gap-2">
                                      {isActive && <span className="text-[8px] opacity-50">{'>'}</span>}
                                      {link.label}
                                   </span>
                                   
                                   {/* Active Indicator Line */}
                                   {isActive && (
                                      <motion.div 
                                        layoutId="activeNavIndicator"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500"
                                      />
                                   )}
                                </Link>
                             )}
                          </div>
                       );
                    })}
                 </nav>

                 {/* Right Control Cluster */}
                 <div className="hidden md:flex items-center gap-6">
                    {/* Live Scroll Pos */}
                    <div className="hidden xl:flex flex-col items-end font-mono text-[9px] text-gray-600 w-16">
                       <div className="flex justify-between w-full">
                          <span>SCROLL</span>
                          <span className="text-white">{scrollProgress}%</span>
                       </div>
                       <div className="w-full h-0.5 bg-white/10 mt-0.5">
                          <motion.div 
                             className="h-full bg-cyan-500" 
                             style={{ width: `${scrollProgress}%` }}
                          />
                       </div>
                    </div>

                    <div className="h-8 w-px bg-white/10" />

                    <Clock />

                    {/* CTA Button */}
                    {navLinks.find(l => l.id === 'donate') && (() => {
                       const link = navLinks.find(l => l.id === 'donate')!;
                       return (
                          <Link
                             href={link.href}
                             onClick={() => handleNavClick(link.id)}
                             className="group relative px-6 py-2 bg-white text-black overflow-hidden rounded-sm"
                          >
                             <div className="absolute inset-0 bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                             <span className="relative z-10 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                Initiate_Funding
                                <div className="w-1.5 h-1.5 bg-black group-hover:bg-white rounded-full" />
                             </span>
                          </Link>
                       );
                    })()}
                 </div>

                 {/* Mobile Hamburger */}
                 <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden p-2 text-gray-400 hover:text-white border border-white/10 hover:border-white/30 transition-all bg-white/5"
                 >
                    {mobileMenuOpen ? <HiX size={20} /> : <HiMenuAlt3 size={20} />}
                 </button>
              </div>
           </div>
        </div>

        {/* Mobile Mega Menu */}
        <AnimatePresence>
           {mobileMenuOpen && (
              <motion.div
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: '100vh' }}
                 exit={{ opacity: 0, height: 0 }}
                 transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                 className="fixed inset-0 top-[112px] z-40 bg-[#050505] border-t border-white/10 pointer-events-auto overflow-y-auto"
              >
                 {/* Background Grid */}
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                 <div className="relative p-6 grid gap-8">
                    <div className="space-y-2">
                       <h3 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4">Navigation_Protocol</h3>
                       {navLinks.map((link, idx) => (
                          <motion.div
                             key={link.id}
                             initial={{ opacity: 0, x: -20 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: idx * 0.05 }}
                          >
                             <Link
                                href={link.href}
                                onClick={() => handleNavClick(link.id)}
                                className="block py-4 text-2xl font-light uppercase tracking-tighter text-white border-b border-white/5 hover:pl-4 hover:bg-white/5 hover:text-cyan-400 transition-all duration-300"
                             >
                                <span className="text-xs font-mono text-gray-600 mr-4">0{idx + 1}</span>
                                {link.label}
                             </Link>
                          </motion.div>
                       ))}
                    </div>

                    {/* Mobile Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 border border-white/10 bg-white/5">
                          <div className="text-[9px] font-mono text-gray-500 uppercase mb-2">System Status</div>
                          <div className="text-green-500 font-mono text-sm">OPERATIONAL</div>
                       </div>
                       <div className="p-4 border border-white/10 bg-white/5">
                          <div className="text-[9px] font-mono text-gray-500 uppercase mb-2">Uptime</div>
                          <div className="text-white font-mono text-sm">99.9%</div>
                       </div>
                       <div className="p-4 border border-white/10 bg-white/5 col-span-2">
                          <div className="text-[9px] font-mono text-gray-500 uppercase mb-2">Session ID</div>
                          <div className="text-cyan-500 font-mono text-xs break-all">
                             {typeof window !== 'undefined' ? window.btoa(Date.now().toString()).substring(0, 16) : 'INIT...'}
                          </div>
                       </div>
                    </div>
                 </div>
              </motion.div>
           )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Navigation;
