'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { HiMenuAlt3, HiX, HiSun, HiMoon } from 'react-icons/hi';
import { HiSparkles, HiArrowRight } from 'react-icons/hi2';
import { BsTerminal } from 'react-icons/bs';
import { 
  FaUser, 
  FaGithub, 
  FaDiscord, 
  FaTwitter 
} from 'react-icons/fa';
import {
  BiHomeAlt,
  BiCodeAlt,
} from 'react-icons/bi';
import { RiArticleLine, RiShareLine } from 'react-icons/ri';
import { TbBrain, TbHeartHandshake } from 'react-icons/tb';
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
  { id: 'about', label: 'About', icon: FaUser, href: '/about' },
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
      className="relative px-4 py-2.5 group"
    >
      {/* Active Background with premium gradient */}
      {isActive && (
        <motion.div
          layoutId="activeNavBackground"
          className="absolute inset-0 bg-gradient-to-r from-foreground/[0.08] via-foreground/[0.04] to-foreground/[0.08] rounded-xl border border-foreground/[0.08]"
          transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10 flex items-center gap-2.5">
        <link.icon className={`text-[13px] transition-all duration-300 ${
          isActive 
            ? 'text-foreground' 
            : 'text-muted-foreground/70 group-hover:text-foreground'
        }`} />
        <span className={`text-[11px] font-semibold tracking-[0.08em] uppercase transition-all duration-300 ${
          isActive 
            ? 'text-foreground' 
            : 'text-muted-foreground/70 group-hover:text-foreground'
        }`}>
          {link.label}
        </span>
      </div>

      {/* Subtle hover state */}
      <AnimatePresence>
        {isHovered && !isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-foreground/[0.03] rounded-xl -z-10"
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
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
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
  }, [theme]);
  
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

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {/* Top Progress Bar - Ultra thin and elegant */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-foreground/40 to-transparent z-[100] origin-left"
        style={{ scaleX }}
      />

      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={`
            relative w-full max-w-6xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
            ${scrolled 
              ? 'bg-background/80 backdrop-blur-2xl border border-foreground/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-2xl py-3 px-4' 
              : 'bg-transparent border-transparent py-4 px-4'
            }
          `}
        >
          {/* Subtle gradient overlay when scrolled */}
          {scrolled && (
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/[0.01] via-transparent to-foreground/[0.01] rounded-2xl pointer-events-none" />
          )}

          {/* Inner Container */}
          <div className="flex items-center justify-between relative">
            
            {/* Left: Brand */}
            <div className="flex items-center gap-4">
              <Link href="/" className="group flex items-center gap-3 relative z-20">
                {/* Premium Logo Mark */}
                <div className="relative">
                  <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-foreground/[0.04] border border-foreground/[0.08] group-hover:border-foreground/20 transition-all duration-500">
                    <TbBrain className="text-foreground text-lg relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  {/* Subtle glow on hover */}
                  <div className="absolute inset-0 rounded-xl bg-foreground/10 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                </div>
                
                {/* Brand Text */}
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-semibold text-foreground tracking-tight">
                    {personalInfo.alias}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 font-medium tracking-wide">
                    Developer & Creator
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Navigation (Desktop) */}
            <nav className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-0.5 p-1.5 bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl">
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
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-2.5 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] hover:border-foreground/[0.12] transition-all duration-300"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <HiSun size={18} /> : <HiMoon size={18} />}
              </motion.button>

              {/* Chatbot Toggle */}
              <div className="relative">
                <motion.button
                  onClick={() => setChatOpen(!chatOpen)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative p-2.5 rounded-xl border transition-all duration-300
                    ${chatOpen 
                      ? 'bg-foreground/10 border-foreground/20 text-foreground' 
                      : 'bg-foreground/[0.03] border-foreground/[0.06] text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] hover:border-foreground/[0.12]'
                    }
                  `}
                  aria-label="Toggle chat"
                >
                  {chatOpen ? <HiX size={18} /> : <BsTerminal size={18} />}
                </motion.button>

                {/* Embedded Chatbot */}
                <Chatbot 
                  isOpen={chatOpen} 
                  onToggle={() => setChatOpen(!chatOpen)} 
                  embedded={true} 
                />
              </div>

              {/* Support CTA Button - Premium style */}
              <Link href="/donate" className="hidden md:block">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative px-5 py-2.5 bg-foreground text-background rounded-xl overflow-hidden transition-all duration-300"
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  
                  <span className="relative z-10 flex items-center gap-2 text-[11px] font-semibold tracking-[0.06em] uppercase">
                    <TbHeartHandshake className="text-base" />
                    <span>Support</span>
                    <HiArrowRight className="text-xs opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  </span>
                </motion.div>
              </Link>

              {/* Mobile Menu Toggle */}
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="lg:hidden p-2.5 text-muted-foreground hover:text-foreground bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl transition-all duration-300"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <HiX size={20} /> : <HiMenuAlt3 size={20} />}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Mobile Menu Overlay - Premium Design */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background lg:hidden flex flex-col"
          >
            {/* Close zone */}
            <div className="h-24" />
            
            {/* Navigation content */}
            <div className="flex-1 flex flex-col px-6 py-8">
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((link, idx) => (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        group flex items-center justify-between p-4 rounded-xl transition-all duration-300
                        ${pathname === link.href 
                          ? 'bg-foreground/[0.06] text-foreground' 
                          : 'text-muted-foreground hover:bg-foreground/[0.03] hover:text-foreground'
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg transition-colors duration-300 ${
                          pathname === link.href 
                            ? 'bg-foreground/10 text-foreground' 
                            : 'bg-foreground/[0.04] text-muted-foreground group-hover:text-foreground'
                        }`}>
                          <link.icon size={18} />
                        </div>
                        <span className="text-base font-medium">{link.label}</span>
                      </div>
                      <HiArrowRight className={`text-sm transition-all duration-300 ${
                        pathname === link.href 
                          ? 'opacity-100' 
                          : 'opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0'
                      }`} />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Divider */}
              <div className="my-6 h-px bg-foreground/[0.06]" />

              {/* Mobile Social Links */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="flex justify-center gap-3"
              >
                {SOCIAL_LINKS.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition-all duration-300"
                  >
                    <social.icon size={18} />
                  </a>
                ))}
              </motion.div>

              {/* Mobile Support Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="mt-6"
              >
                <Link
                  href="/donate"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-foreground text-background rounded-xl font-semibold text-sm tracking-wide"
                >
                  <TbHeartHandshake size={18} />
                  <span>Support My Work</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
