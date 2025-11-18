'use client';

import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowLeft, FaCalendar, FaClock, FaTag, FaTwitter, FaLinkedin, FaLink } from 'react-icons/fa';
import Navigation from '@/components/Navigation';
import CursorEffect from '@/components/CursorEffect';
import AgencyFooter from '@/components/home/AgencyFooter';
import DiffusionBackground from '@/app/social/components/diffusion/DiffusionBackground';
import { BlogPost } from '@/lib/blog';

interface BlogPostClientPageProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
  children: React.ReactNode;
}

export default function BlogPostClientPage({ post, relatedPosts, children }: BlogPostClientPageProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      <CursorEffect />
      <Navigation />
      
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-cyan-500 origin-left z-50"
        style={{ scaleX }}
      />

      <main className="relative min-h-screen bg-[#030305] text-white overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-100">
        <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
          <DiffusionBackground />
        </div>

        <article className="relative z-10">
          <div className="relative h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030305]/50 to-[#030305] z-10" />
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            
            <div className="absolute inset-0 z-20 flex flex-col justify-end pb-20 px-4">
              <div className="max-w-4xl mx-auto w-full">
                <Link 
                  href="/blog" 
                  className="inline-flex items-center gap-2 text-sm font-mono text-cyan-400 hover:text-cyan-300 transition-colors mb-6 backdrop-blur-md bg-black/30 px-3 py-1 rounded-full border border-cyan-500/20"
                >
                  <FaArrowLeft /> RETURN_TO_INDEX
                </Link>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 text-xs font-bold bg-cyan-500 text-black rounded-full uppercase tracking-wider">
                      {post.category}
                    </span>
                    {post.featured && (
                      <span className="px-3 py-1 text-xs font-bold border border-white/20 text-white rounded-full uppercase tracking-wider backdrop-blur-md">
                        Featured
                      </span>
                    )}
                  </div>

                  <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                    {post.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-6 text-sm font-mono text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500" />
                      <span className="text-white">{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCalendar className="text-cyan-500" />
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <FaClock className="text-cyan-500" />
                      {post.readTime}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:text-white prose-p:text-gray-300 prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:border prose-img:border-white/10 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-white/10 prose-code:text-cyan-300 prose-strong:text-white"
            >
              {children}

              <div className="mt-12 pt-8 border-t border-white/10">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-white/5 rounded-full text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                      <FaTag className="text-xs" /> #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            <aside className="space-y-8">
              <div className="sticky top-32">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm mb-8">
                  <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider mb-4">Share Protocol</h3>
                  <div className="flex gap-4">
                    <button className="p-2 rounded-full bg-white/5 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-400 transition-colors">
                      <FaTwitter />
                    </button>
                    <button className="p-2 rounded-full bg-white/5 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-400 transition-colors">
                      <FaLinkedin />
                    </button>
                    <button className="p-2 rounded-full bg-white/5 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-400 transition-colors">
                      <FaLink />
                    </button>
                  </div>
                </div>

                {relatedPosts.length > 0 && (
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                    <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider mb-4">Related Streams</h3>
                    <div className="space-y-6">
                      {relatedPosts.map(rp => (
                        <Link key={rp.id} href={`/blog/${rp.slug}`} className="block group">
                          <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors mb-1">
                            {rp.title}
                          </h4>
                          <p className="text-xs text-gray-500 font-mono">
                            {rp.readTime} • {new Date(rp.date).toLocaleDateString()}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </article>
        
        <AgencyFooter />
      </main>
    </>
  );
}
