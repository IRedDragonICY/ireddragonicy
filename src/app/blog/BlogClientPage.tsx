'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter, FaTerminal } from 'react-icons/fa';
import CursorEffect from '@/components/CursorEffect';
import AgencyFooter from '@/components/home/AgencyFooter';
import DiffusionBackground from '@/app/social/components/diffusion/DiffusionBackground';
import BlogCard from './components/BlogCard';
import { BlogPost } from '@/lib/blog';

interface BlogClientPageProps {
  initialPosts: BlogPost[];
}

export default function BlogClientPage({ initialPosts }: BlogClientPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'AI Research', 'Tutorial', 'Case Study', 'Opinion'];

  const filteredPosts = useMemo(() => {
    return initialPosts.filter(post => {
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, initialPosts]);

  const featuredPost = filteredPosts.find(p => p.featured) || filteredPosts[0];
  const gridPosts = filteredPosts.filter(p => p.id !== featuredPost?.id);

  return (
    <>
      <CursorEffect />
      
      <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-foreground/20 selection:text-foreground">
        <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
          <DiffusionBackground />
        </div>

        <div className="relative z-10 pt-32 pb-20 px-4 max-w-[1400px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center mb-20 space-y-6 text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-card backdrop-blur-md">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-500">
                Intelligence_Hub
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="text-foreground">
                Insights & Analysis
              </span>
            </h1>

            <p className="max-w-xl text-muted-foreground text-sm md:text-base font-light leading-relaxed">
              Decoding the latent space of technology. Deep dives into generative AI, diffusion models, and the future of digital creation.
            </p>
          </motion.div>

          <div className="mb-20">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-8 p-4 rounded-xl bg-card border border-card-border backdrop-blur-sm">
              <div className="relative w-full md:w-96 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-cyan-400 transition-colors">
                  <FaSearch />
                </div>
                <input
                  type="text"
                  placeholder="Search protocols..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted/20 border border-card-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-mono"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-[10px] text-muted-foreground font-mono border border-card-border px-1.5 py-0.5 rounded">CTRL+K</span>
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
                <FaFilter className="text-muted-foreground mr-2 flex-shrink-0" />
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-cyan-500 text-white font-bold shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)]'
                        : 'bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {featuredPost && !searchQuery && selectedCategory === 'All' && (
               <motion.div
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 0.6 }}
                 className="mb-16"
               >
                 <BlogCard post={featuredPost} index={-1} />
               </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gridPosts.map((post, idx) => (
                <BlogCard key={post.id} post={post} index={idx} />
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-32">
                <FaTerminal className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-mono text-muted-foreground">No data streams found.</h3>
                <p className="text-muted-foreground text-sm mt-2">Adjust your query parameters.</p>
              </div>
            )}
          </div>
        </div>
        
        <AgencyFooter />
      </main>
    </>
  );
}

