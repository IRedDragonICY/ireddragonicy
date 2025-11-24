'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { HiMenuAlt3, HiX, HiSun, HiMoon } from 'react-icons/hi';
import { HiSparkles } from 'react-icons/hi2';
import { BsTerminal } from 'react-icons/bs';
import { 
  FaBrain, 
  FaGraduationCap, 
  FaGithub, 
  FaDiscord, 
  FaTwitter 
} from 'react-icons/fa';
import {
  BiHomeAlt,
  BiCodeAlt,
  BiNetworkChart
} from 'react-icons/bi';
import { RiArticleLine, RiShareLine } from 'react-icons/ri';
import { TbBrain } from 'react-icons/tb';
import Chatbot from './chatbot/Chatbot';

// --- Types ---
interface NavigationProps {
  personalInfo?: {
    alias: string;
  };
}

// --- Constants ---
const NAV_LINKS = [
  { id: 'home', label: 'Home', icon: BiHomeAlt, href: '/' },
  { id: 'education', label: 'Education', icon: FaGraduationCap, href: '/education' },
  { id: 'assets', label: 'Assets', icon: BiCodeAlt, href: '/assets' },
  { id: 'social', label: 'Social', icon: RiShareLine, href: '/social' },
  { id: 'blog', label: 'Blog', icon: RiArticleLine, href: '/blog' },
];

const SOCIAL_LINKS = [
  { icon: FaGithub, href: 'https://github.com', label: 'GitHub' },
  { icon: FaTwitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: FaDiscord, href: 'https://discord.com', label: 'Discord' },
];

// --- Components ---

const StatusIndicator = ({ label, active = true }: { label: string, active?: boolean }) => (
  <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-card border border-card-border text-[10px] font-mono text-muted-foreground">
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
    <span className="uppercase tracking-wider">{label}</span>
  </div>
);

const NavItem = ({ 
  link, 
  isActive, 
  onClick 
}: { 
  link: typeof NAV_LINKS[0], 
  isActive: boolean, 
  onClick: () => void 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={link.href}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative px-4 py-2 group"
    >
      {/* Hover Background */}
      {isActive && (
        <motion.div
          layoutId="activeNavBackground"
          className="absolute inset-0 bg-foreground/5 rounded-lg backdrop-blur-sm"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10 flex items-center gap-2">
        <link.icon className={`text-sm transition-colors duration-300 ${isActive ? 'text-cyan-400' : 'text-muted-foreground group-hover:text-foreground'}`} />
        <span className={`text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
          {link.label}
        </span>
      </div>

      {/* Hover Glow */}
      <AnimatePresence>
        {isHovered && !isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 bg-card rounded-lg -z-10"
          />
        )}
      </AnimatePresence>
    </Link>
  );
};

const Navigation = ({ personalInfo = { alias: 'IRedDragonICY' } }: NavigationProps) => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    
    if (!(document as any).startViewTransition) {
      setTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = (document as any).startViewTransition(() => {
      setTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 500,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };
  
  // Scroll progress for the top bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Time update
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    }, 1000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, []);

  return (
    <>
      {/* Top Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-cyan-500 z-[100] origin-left"
        style={{ scaleX }}
      />

      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`
            relative w-full max-w-7xl transition-all duration-500 ease-out
            ${scrolled 
              ? `bg-nav-bg backdrop-blur-xl border border-card-border shadow-2xl ${theme === 'light' ? 'shadow-zinc-200/50' : 'shadow-black/50'} rounded-2xl p-2` 
              : 'bg-transparent border-transparent p-4'
            }
          `}
        >
          {/* Inner Container */}
          <div className="flex items-center justify-between relative">
            
            {/* Left: Brand & Status */}
            <div className="flex items-center gap-6">
              <Link href="/" className="group flex items-center gap-3 relative z-20">
                <div className="relative w-10 h-10 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-foreground/10 to-foreground/5 border border-card-border group-hover:border-cyan-500/50 transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                  <div className="absolute inset-0 bg-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <FaBrain className="text-foreground group-hover:text-cyan-400 transition-colors duration-300 text-lg relative z-10" />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-bold text-foreground font-mono tracking-widest uppercase group-hover:text-cyan-400 transition-colors duration-300">
                    {personalInfo.alias}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono group-hover:text-cyan-500/70 transition-colors">
                    NEURAL_INTERFACE_V2.0
                  </span>
                </div>
              </Link>

              {/* Desktop Status Indicators */}
              <div className="hidden lg:flex items-center gap-3 border-l border-card-border pl-6">
                <StatusIndicator label="SYSTEM ONLINE" />
              </div>
            </div>

            {/* Center: Navigation (Desktop) */}
            <nav className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-1 p-1 bg-card border border-card-border rounded-xl backdrop-blur-md">
                {NAV_LINKS.map((link) => (
                  <NavItem
                    key={link.id}
                    link={link}
                    isActive={pathname === link.href}
                    onClick={() => {}}
                  />
                ))}
              </div>
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Time Display */}
              <div className="hidden md:block text-xs font-mono text-muted-foreground bg-card px-3 py-1.5 rounded-lg border border-card-border">
                {currentTime || '00:00'} UTC
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-card border border-card-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-300"
              >
                {theme === 'dark' ? <HiSun size={20} /> : <HiMoon size={20} />}
              </button>

              {/* Chatbot Toggle */}
              <div className="relative">
                <button
                  onClick={() => setChatOpen(!chatOpen)}
                  className={`
                    relative p-2.5 rounded-xl border transition-all duration-300 group overflow-hidden
                    ${chatOpen 
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
                      : 'bg-card border-card-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                    }
                  `}
                >
                  <div className="relative z-10">
                    {chatOpen ? <HiX size={20} /> : <BsTerminal size={20} />}
                  </div>
                  {/* Scanline effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700" />
                </button>

                {/* Embedded Chatbot */}
                <Chatbot 
                  isOpen={chatOpen} 
                  onToggle={() => setChatOpen(!chatOpen)} 
                  embedded={true} 
                />
              </div>

              {/* Donate Button */}
              <Link
                href="/donate"
                className="hidden md:flex group relative px-5 py-2.5 bg-white text-black overflow-hidden rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-white to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_100%] animate-shimmer" />
                <span className="relative z-10 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <TbBrain className="text-lg" />
                  <span>Support</span>
                </span>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 text-muted-foreground hover:text-foreground bg-card border border-card-border rounded-xl transition-colors"
              >
                {mobileMenuOpen ? <HiX size={20} /> : <HiMenuAlt3 size={20} />}
              </button>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-2xl lg:hidden flex flex-col pt-32 px-6"
          >
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            <div className="flex flex-col gap-2 relative z-10">
              {NAV_LINKS.map((link, idx) => (
                <motion.div
                  key={link.id}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      group flex items-center justify-between p-5 rounded-2xl border transition-all duration-300
                      ${pathname === link.href 
                        ? 'bg-foreground/10 border-foreground/20 text-foreground' 
                        : 'bg-foreground/5 border-foreground/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground'
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${pathname === link.href ? 'bg-cyan-500/20 text-cyan-400' : 'bg-foreground/5 text-muted-foreground group-hover:text-foreground'}`}>
                        <link.icon size={20} />
                      </div>
                      <span className="text-lg font-medium tracking-wide">{link.label}</span>
                    </div>
                    <HiSparkles className={`text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity ${pathname === link.href ? 'opacity-100' : ''}`} />
                  </Link>
                </motion.div>
              ))}

              {/* Mobile Socials */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex justify-center gap-4"
              >
                {SOCIAL_LINKS.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-foreground/5 border border-foreground/10 text-muted-foreground hover:text-foreground hover:bg-foreground/10 hover:scale-110 transition-all"
                  >
                    <social.icon size={20} />
                  </a>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
