'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { FaBrain, FaGraduationCap, FaArrowRight } from 'react-icons/fa';
import {
  BiHomeAlt,
  BiCodeAlt
} from 'react-icons/bi';
import { RiArticleLine, RiShareLine } from 'react-icons/ri';
import { TbBrain } from 'react-icons/tb';

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





const Navigation = ({ personalInfo = { alias: 'IRedDragonICY' } }: NavigationProps) => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrollProgress, setScrollProgress] = useState(0);



  // Check if we're on the blog page
  const isBlogPage = pathname?.startsWith('/blog');

  // Navigation links for homepage with modern icons
  const homeNavLinks = [
    { id: 'home', label: 'Home', icon: BiHomeAlt, href: '/' },
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
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'py-4' : 'py-6'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className={`
              relative flex items-center justify-between px-6 py-3 rounded-full transition-all duration-500
              ${scrolled 
                ? 'bg-[#050505]/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50' 
                : 'bg-transparent border border-transparent'
              }
            `}
          >
             {/* Brand Identity */}
             <Link href="/" className="group flex items-center gap-3 z-20">
                <div className="relative w-8 h-8 flex items-center justify-center overflow-hidden rounded-full bg-white/5 border border-white/10 group-hover:border-cyan-500/50 transition-colors duration-500">
                   <FaBrain className="text-gray-400 group-hover:text-cyan-400 transition-colors duration-300 text-sm" />
                </div>
                <div className="flex flex-col">
                   <span className="text-sm font-bold text-white font-mono tracking-widest uppercase group-hover:text-cyan-400 transition-colors duration-300">
                      {personalInfo.alias}
                   </span>
                </div>
             </Link>

             {/* Desktop Nav Links */}
             <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-1 p-1.5 bg-white/[0.03] border border-white/5 rounded-full backdrop-blur-sm">
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
                                className="relative px-4 py-1.5 text-[11px] font-medium text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
                              >
                                 {link.label}
                              </a>
                           ) : (
                              <Link 
                                href={effectiveHref}
                                onClick={() => handleNavClick(link.id)}
                                className={`
                                  relative px-4 py-1.5 text-[11px] font-medium transition-all duration-300 uppercase tracking-wider rounded-full
                                  ${isActive ? 'text-black' : 'text-gray-400 hover:text-white'}
                                `}
                              >
                                 <span className="relative z-10">{link.label}</span>
                                 
                                 {isActive && (
                                    <motion.div 
                                      layoutId="activeNavPill"
                                      className="absolute inset-0 bg-white rounded-full"
                                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                 )}
                              </Link>
                           )}
                        </div>
                     );
                  })}
                </div>
             </nav>

             {/* Right Actions */}
             <div className="hidden md:flex items-center gap-4 z-20">
                {navLinks.find(l => l.id === 'donate') && (() => {
                   const link = navLinks.find(l => l.id === 'donate')!;
                   return (
                      <Link
                         href={link.href}
                         onClick={() => handleNavClick(link.id)}
                         className="group relative px-5 py-2 bg-white text-black overflow-hidden rounded-full transition-transform hover:scale-105 active:scale-95"
                      >
                         <span className="relative z-10 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                            Initiate_Funding
                            <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                         </span>
                      </Link>
                   );
                })()}
             </div>

             {/* Mobile Hamburger */}
             <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors z-20"
             >
                {mobileMenuOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
             </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
           {mobileMenuOpen && (
              <motion.div
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 transition={{ duration: 0.3 }}
                 className="absolute top-full left-0 right-0 p-4 mx-4 mt-2 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
              >
                 <div className="flex flex-col gap-2">
                    {navLinks.map((link) => (
                       <Link
                          key={link.id}
                          href={link.href}
                          onClick={() => handleNavClick(link.id)}
                          className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors group"
                       >
                          <span className="text-sm font-medium text-gray-300 group-hover:text-white uppercase tracking-wider">
                             {link.label}
                          </span>
                          <FaArrowRight className="text-gray-600 group-hover:text-white -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all" size={12} />
                       </Link>
                    ))}
                 </div>
              </motion.div>
           )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};

export default Navigation;
