'use client';

import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowLeft, FaCalendar, FaClock, FaTwitter, FaLinkedin, FaLink } from 'react-icons/fa';
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
        className="fixed top-0 left-0 right-0 h-0.5 bg-foreground origin-left z-50"
        style={{ scaleX }}
      />

      <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-foreground/20 selection:text-foreground">
        <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
          <DiffusionBackground />
        </div>

        <article className="relative z-10">
          <div className="relative h-[60vh] w-full overflow-hidden border-b border-card-border">
            <div className="absolute inset-0 bg-background/60 z-10" />
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover opacity-50"
              priority
            />
            
            <div className="absolute inset-0 z-20 flex flex-col justify-end pb-20 px-4">
              <div className="max-w-[720px] mx-auto w-full">
                <Link 
                  href="/blog" 
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                  <FaArrowLeft className="w-3 h-3" /> Back
                </Link>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-sm text-muted-foreground">
                      {post.category}
                    </span>
                  </div>

                  <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-foreground tracking-tight">
                    {post.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    <span>{post.author}</span>
                    <span className="flex items-center gap-2">
                      <FaCalendar className="w-3 h-3" />
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-2">
                      <FaClock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Article Content - Full Width, Optimal Reading */}
          <div className="max-w-[720px] mx-auto px-4 py-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="prose dark:prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-[1.8] prose-a:text-foreground prose-a:underline hover:prose-a:text-muted-foreground prose-img:rounded-sm prose-img:border prose-img:border-card-border prose-pre:bg-card prose-pre:border prose-pre:border-card-border prose-code:text-muted-foreground prose-strong:text-foreground"
            >
              {children}

              {/* Tags */}
              <div className="mt-16 pt-8 border-t border-card-border">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-muted/30 rounded-full text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Share Section */}
              <div className="mt-12 pt-8 border-t border-card-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Share this article</span>
                  <div className="flex gap-2">
                    <button className="p-2.5 rounded-full bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors">
                      <FaTwitter className="w-4 h-4" />
                    </button>
                    <button className="p-2.5 rounded-full bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors">
                      <FaLinkedin className="w-4 h-4" />
                    </button>
                    <button className="p-2.5 rounded-full bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors">
                      <FaLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Related Posts - Full Width Section */}
          {relatedPosts.length > 0 && (
            <div className="border-t border-card-border">
              <div className="max-w-[720px] mx-auto px-4 py-16">
                <h3 className="text-sm text-muted-foreground mb-8">Continue Reading</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {relatedPosts.map(rp => (
                    <Link key={rp.id} href={`/blog/${rp.slug}`} className="block group">
                      <h4 className="text-lg font-medium text-foreground group-hover:text-muted-foreground transition-colors mb-2 leading-snug">
                        {rp.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {rp.readTime} · {new Date(rp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </article>
        
        <AgencyFooter />
      </main>
    </>
  );
}
