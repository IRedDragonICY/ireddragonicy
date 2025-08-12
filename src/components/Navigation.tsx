// components/Navigation.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { FaBrain, FaGraduationCap, FaBriefcase } from 'react-icons/fa';
import {
  BiHomeAlt,
  BiCodeAlt,
  BiRocket,
  BiEnvelope,
  BiNews
} from 'react-icons/bi';
import { RiArticleLine, RiShareLine } from 'react-icons/ri';
import { TbBrain } from 'react-icons/tb';

// Stable list of section ids used for scroll tracking on the homepage
const HOME_SECTION_IDS: string[] = [
  'home'
];

interface NavigationProps {
  personalInfo: {
    alias: string;
  };
}

const Navigation = ({ personalInfo }: NavigationProps) => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Framer Motion scroll and mouse-based parallax
  const { scrollY } = useScroll();
  const backgroundParallaxY = useTransform(scrollY, [0, 600], [0, -60]);
  const patternParallaxY = useTransform(scrollY, [0, 600], [0, -30]);

  const mouseParallaxX = useMotionValue(0);
  const mouseParallaxY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseParallaxX, { stiffness: 50, damping: 20, mass: 0.5 });
  const smoothMouseY = useSpring(mouseParallaxY, { stiffness: 50, damping: 20, mass: 0.5 });

  // HUD-style cursor highlight and 3D tilt
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const smoothCursorX = useSpring(cursorX, { stiffness: 120, damping: 20, mass: 0.25 });
  const smoothCursorY = useSpring(cursorY, { stiffness: 120, damping: 20, mass: 0.25 });
  const glowRadius = 300; // px
  const glowX = useTransform(smoothCursorX, (v) => v - glowRadius / 2);
  const glowY = useTransform(smoothCursorY, (v) => v - glowRadius / 2);

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const tiltXSmooth = useSpring(tiltX, { stiffness: 120, damping: 16, mass: 0.3 });
  const tiltYSmooth = useSpring(tiltY, { stiffness: 120, damping: 16, mass: 0.3 });

  // Check if we're on the blog page
  const isBlogPage = pathname?.startsWith('/blog');

  // Navigation links for homepage with modern icons
  const homeNavLinks = [
    { id: 'home', label: 'Home', icon: BiHomeAlt, href: '#home' },
    { id: 'education', label: 'Education', icon: FaGraduationCap, href: '/education' },
    { id: 'donate', label: 'Donate', icon: TbBrain, href: '/donate' },
    { id: 'social', label: 'Social', icon: RiShareLine, href: '/social' },
    { id: 'blog', label: 'Blog', icon: RiArticleLine, href: '/blog' }
  ];

  // Navigation links for blog page should mirror homepage order exactly
  const blogNavLinks = [
    { id: 'home', label: 'Home', icon: BiHomeAlt, href: '/' },
    { id: 'education', label: 'Education', icon: FaGraduationCap, href: '/education' },
    { id: 'donate', label: 'Donate', icon: TbBrain, href: '/donate' },
    { id: 'social', label: 'Social', icon: RiShareLine, href: '/social' },
    { id: 'blog', label: 'Blog', icon: RiArticleLine, href: '/blog' }
  ];

  const navLinks = isBlogPage ? blogNavLinks : homeNavLinks;
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

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

  // Mouse parallax tracking (subtle magnetic movement for background)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (typeof window === 'undefined') return;
      const xNormalized = e.clientX / window.innerWidth - 0.5;
      const yNormalized = e.clientY / window.innerHeight - 0.5;
      mouseParallaxX.set(xNormalized * 24); // max ~24px
      mouseParallaxY.set(yNormalized * 24);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseParallaxX, mouseParallaxY]);

  const handleLocalMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cursorX.set(x);
    cursorY.set(y);

    // 3D tilt based on relative position inside container
    const xPercent = x / rect.width - 0.5; // -0.5..0.5
    const yPercent = y / rect.height - 0.5;
    const maxTiltDeg = 6;
    tiltY.set(xPercent * maxTiltDeg); // rotateY when moving left-right
    tiltX.set(-yPercent * maxTiltDeg); // rotateX when moving up-down
  };

  const handleLocalMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

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
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'py-2' : 'py-4'
        }`}
      >
        <nav className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`}>
          <motion.div
            ref={containerRef}
            onMouseMove={handleLocalMouseMove}
            onMouseLeave={handleLocalMouseLeave}
            style={{ rotateX: tiltXSmooth, rotateY: tiltYSmooth, transformPerspective: 900 }}
            className={`
            relative bg-black/40 backdrop-blur-xl rounded-2xl border transition-all duration-300
            ${scrolled ? 'border-cyan-400/10' : 'border-cyan-400/20'}
            shadow-lg shadow-cyan-500/5
            overflow-hidden
          `}
          >
            {/* Parallax Background Layers */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              {/* Soft glow that follows the cursor */}
              <motion.div
                className="absolute inset-[-20%] bg-gradient-to-r from-cyan-500/20 via-transparent to-purple-500/20 blur-2xl"
                style={{ x: smoothMouseX, y: smoothMouseY }}
              />

              {/* Gradient sweep with scroll parallax */}
              <motion.div className="absolute inset-0" style={{ y: backgroundParallaxY }}>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10 animate-pulse opacity-50" />
              </motion.div>

              {/* Subtle grid pattern with slower parallax */}
              <motion.div className="absolute inset-0 opacity-20" style={{ y: patternParallaxY }}>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(34,211,238,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(168,85,247,0.08)_1px,transparent_1px)] bg-[size:24px_24px]" />
              </motion.div>

              {/* Cursor-following highlight (clear HUD effect) */}
              <motion.div
                aria-hidden
                className="absolute rounded-full pointer-events-none mix-blend-screen"
                style={{
                  x: glowX,
                  y: glowY,
                  width: glowRadius,
                  height: glowRadius,
                  background:
                    'radial-gradient(closest-side, rgba(34,211,238,0.18), rgba(34,211,238,0.12) 40%, rgba(34,211,238,0.06) 60%, transparent 70%)',
                  filter: 'blur(20px)'
                }}
              />
            </div>

            <div className="relative px-4 sm:px-6 py-3 flex justify-between items-center gap-2">
              {/* Logo with AI Animation */}
              <Link href="/">
                <motion.div
                  className="flex items-center gap-3 group cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative">
                    <FaBrain className="text-2xl text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                    <motion.div
                      className="absolute inset-0"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    >
                      <div className="w-full h-full border-2 border-cyan-400/20 rounded-full" />
                    </motion.div>
                  </div>
                  <div>
                    <span className="text-lg font-bold tracking-wider text-cyan-400 group-hover:text-white transition-colors font-mono">
                      {personalInfo.alias}
                    </span>
                    <span className="block text-[10px] text-gray-500 font-mono">AI RESEARCHER</span>
                  </div>
                </motion.div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1 sm:gap-2 flex-nowrap overflow-x-auto no-scrollbar max-w-full w-full justify-end">
                {navLinks.filter(l => l.id !== 'donate').map((link, index) => {
                  const isHashLink = link.href.startsWith('#');
                  const effectiveHref = isHashLink ? `${isHomePage ? '' : '/'}${link.href}` : link.href;
                  const isExternal = effectiveHref.startsWith('http');
                  const isActive = isHashLink
                    ? (!isBlogPage && isHomePage && activeSection === link.id)
                    : (pathname === effectiveHref || (effectiveHref !== '/' && pathname?.startsWith(effectiveHref)) || (isBlogPage && link.id === 'blog' && pathname === '/blog'));

                  const Icon = link.icon;

                  return (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -3 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {isExternal ? (
                        <a
                          href={effectiveHref}
                          onClick={() => handleNavClick(link.id)}
                          className={`
                            relative px-3 sm:px-4 py-2 text-sm font-medium tracking-wider transition-all duration-300 block whitespace-nowrap
                            ${isActive 
                              ? 'text-cyan-400' 
                              : 'text-gray-400 hover:text-cyan-400'
                            }
                          `}
                          target="_blank" rel="noopener noreferrer"
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeSection"
                              className="absolute inset-0 bg-cyan-400/10 rounded-lg border border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                          )}
                          <span className="relative flex items-center gap-2">
                            <Icon className="text-base" />
                            <span className="font-mono">&lt;{link.label}/&gt;</span>
                          </span>
                          <motion.div
                            className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                            initial={{ scaleX: 0 }}
                            whileHover={{ scaleX: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        </a>
                      ) : (
                        <Link
                          href={effectiveHref}
                          onClick={() => handleNavClick(link.id)}
                          className={`
                            relative px-3 sm:px-4 py-2 text-sm font-medium tracking-wider transition-all duration-300 block whitespace-nowrap
                            ${isActive 
                              ? 'text-cyan-400' 
                              : 'text-gray-400 hover:text-cyan-400'
                            }
                          `}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeSection"
                              className="absolute inset-0 bg-cyan-400/10 rounded-lg border border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                          )}
                          <span className="relative flex items-center gap-2">
                            <Icon className="text-base" />
                            <span className="font-mono">&lt;{link.label}/&gt;</span>
                          </span>
                          <motion.div
                            className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                            initial={{ scaleX: 0 }}
                            whileHover={{ scaleX: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        </Link>
                      )}
                    </motion.div>
                  );
                })}

                {/* Donate CTA pinned to the far right */}
                {navLinks.find(l => l.id === 'donate') && (() => {
                  const link = navLinks.find(l => l.id === 'donate')!;
                  const isHashLink = link.href.startsWith('#');
                  const effectiveHref = isHashLink ? `${isHomePage ? '' : '/'}${link.href}` : link.href;
                  const isExternal = effectiveHref.startsWith('http');
                  const isActive = isHashLink
                    ? (!isBlogPage && isHomePage && activeSection === link.id)
                    : (pathname === effectiveHref || (effectiveHref !== '/' && pathname?.startsWith(effectiveHref)) || (isBlogPage && link.id === 'blog' && pathname === '/blog'));
                  const Icon = link.icon;
                  const content = (
                    <span className="relative flex items-center gap-2">
                      <Icon className="text-base" />
                      <span className="font-mono">&lt;{link.label}/&gt;</span>
                    </span>
                  );
                  return (
                    <div className="ml-2 sm:ml-3">
                      {isExternal ? (
                        <a
                          href={effectiveHref}
                          onClick={() => handleNavClick(link.id)}
                          className={`
                            relative px-3 sm:px-4 py-2 text-sm font-semibold tracking-wider transition-all duration-300 block whitespace-nowrap rounded-lg
                            border ${isActive ? 'text-cyan-300 border-cyan-400/50 bg-cyan-400/10' : 'text-cyan-400 border-cyan-400/30 hover:bg-cyan-400/10'}
                            shadow-[0_0_20px_rgba(34,211,238,0.10)]
                          `}
                          target="_blank" rel="noopener noreferrer"
                        >
                          {content}
                        </a>
                      ) : (
                        <Link
                          href={effectiveHref}
                          onClick={() => handleNavClick(link.id)}
                          className={`
                            relative px-3 sm:px-4 py-2 text-sm font-semibold tracking-wider transition-all duration-300 block whitespace-nowrap rounded-lg
                            border ${isActive ? 'text-cyan-300 border-cyan-400/50 bg-cyan-400/10' : 'text-cyan-400 border-cyan-400/30 hover:bg-cyan-400/10'}
                            shadow-[0_0_20px_rgba(34,211,238,0.10)]
                          `}
                        >
                          {content}
                        </Link>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-cyan-400 hover:text-white transition-colors"
              >
                {mobileMenuOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
              </button>
            </div>
          </motion.div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-2 mx-4"
            >
              <div className="bg-black/90 backdrop-blur-xl rounded-xl border border-cyan-400/20 p-4">
                {navLinks.map((link, index) => {
                  const isHashLink = link.href.startsWith('#');
                  const effectiveHref = isHashLink ? `${isHomePage ? '' : '/'}${link.href}` : link.href;
                  const isExternal = effectiveHref.startsWith('http');
                  const isActive = isHashLink
                    ? (!isBlogPage && isHomePage && activeSection === link.id)
                    : (pathname === effectiveHref || (effectiveHref !== '/' && pathname?.startsWith(effectiveHref)) || (isBlogPage && link.id === 'blog' && pathname === '/blog'));
                  const Icon = link.icon;

                  return (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {isExternal ? (
                        <a
                          href={effectiveHref}
                          onClick={() => handleNavClick(link.id)}
                          className={`
                            block px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300
                            ${isActive 
                              ? 'bg-cyan-400/10 text-cyan-400' 
                              : 'text-gray-400 hover:bg-cyan-400/5 hover:text-cyan-400'
                            }
                          `}
                          target="_blank" rel="noopener noreferrer"
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="text-lg" />
                            <span className="font-mono">{link.label}</span>
                          </span>
                        </a>
                      ) : (
                        <Link
                          href={effectiveHref}
                          onClick={() => handleNavClick(link.id)}
                          className={`
                            block px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300
                            ${isActive 
                              ? 'bg-cyan-400/10 text-cyan-400' 
                              : 'text-gray-400 hover:bg-cyan-400/5 hover:text-cyan-400'
                            }
                          `}
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="text-lg" />
                            <span className="font-mono">{link.label}</span>
                          </span>
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};

export default Navigation;