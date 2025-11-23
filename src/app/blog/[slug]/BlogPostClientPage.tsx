'use client';

import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowLeft, FaCalendar, FaClock, FaTag, FaTwitter, FaLinkedin, FaLink } from 'react-icons/fa';
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
      
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-white origin-left z-50"
        style={{ scaleX }}
      />

      <main className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-white/20 selection:text-white">
        <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
          <DiffusionBackground />
        </div>

        <article className="relative z-10">
          <div className="relative h-[60vh] w-full overflow-hidden border-b border-white/10">
            <div className="absolute inset-0 bg-black/60 z-10" />
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover opacity-50"
              priority
            />
            
            <div className="absolute inset-0 z-20 flex flex-col justify-end pb-20 px-4">
              <div className="max-w-4xl mx-auto w-full">
                <Link 
                  href="/blog" 
                  className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors mb-8 uppercase tracking-widest"
                >
                  <FaArrowLeft /> Return_To_Index
                </Link>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 text-[10px] font-bold bg-white text-black rounded-sm uppercase tracking-widest">
                      {post.category}
                    </span>
                    {post.featured && (
                      <span className="px-3 py-1 text-[10px] font-bold border border-white/20 text-white rounded-sm uppercase tracking-widest backdrop-blur-md">
                        Featured
                      </span>
                    )}
                  </div>

                  <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-white tracking-tight">
                    {post.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-8 text-xs font-mono text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-700 border border-white/10" />
                      <span className="text-gray-300">{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCalendar className="text-gray-500" />
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <FaClock className="text-gray-500" />
                      {post.readTime}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:text-white prose-p:text-gray-300 prose-p:font-light prose-p:leading-loose prose-a:text-white prose-a:underline hover:prose-a:text-gray-300 prose-img:rounded-sm prose-img:border prose-img:border-white/10 prose-pre:bg-[#0A0A0A] prose-pre:border prose-pre:border-white/10 prose-code:text-gray-300 prose-strong:text-white font-serif"
            >
              {children}

              <div className="mt-16 pt-8 border-t border-white/10">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-white/5 border border-white/5 rounded-sm text-xs font-mono text-gray-400 hover:text-white hover:border-white/20 transition-colors uppercase">
                      <FaTag className="text-[10px]" /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            <aside className="space-y-8">
              <div className="sticky top-32">
                <div className="bg-[#0A0A0A] rounded-sm p-6 border border-white/10 mb-8">
                  <h3 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-6">Share_Protocol</h3>
                  <div className="flex gap-4">
                    <button className="p-3 rounded-sm bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/5">
                      <FaTwitter />
                    </button>
                    <button className="p-3 rounded-sm bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/5">
                      <FaLinkedin />
                    </button>
                    <button className="p-3 rounded-sm bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/5">
                      <FaLink />
                    </button>
                  </div>
                </div>

                {relatedPosts.length > 0 && (
                  <div className="bg-[#0A0A0A] rounded-sm p-6 border border-white/10">
                    <h3 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-6">Related_Data</h3>
                    <div className="space-y-6">
                      {relatedPosts.map(rp => (
                        <Link key={rp.id} href={`/blog/${rp.slug}`} className="block group">
                          <h4 className="font-bold text-sm text-white group-hover:text-gray-300 transition-colors mb-2 leading-snug">
                            {rp.title}
                          </h4>
                          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wide">
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
