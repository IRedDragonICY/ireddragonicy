// app/blog/[slug]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaCalendar, FaClock, FaEye, FaHeart, FaShare, FaBookmark, FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';
import { HiOutlineShare } from 'react-icons/hi';
import Navigation from '@/components/Navigation';
import CursorEffect from '@/components/CursorEffect';
import { getBlogPost, getAllBlogPosts, type BlogPost } from '@/data/blogPosts';

// TypeScript interfaces for additional data
interface RelatedPost {
  slug: string;
  title: string;
  readTime: string;
}

// Extended blog post interface for component use
interface ExtendedBlogPost {
  slug: string;
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  tags: string[];
  readTime: string;
  image: string;
  views: number;
  likes: number;
  published: boolean;
  featured?: boolean;
  category: 'AI Research' | 'Tutorial' | 'Case Study' | 'Opinion';
  author: {
    name: string;
    avatar: string;
    bio: string;
    social: {
      twitter: string;
      linkedin: string;
      github: string;
    };
  };
  relatedPosts: RelatedPost[];
}

// Helper function to extend blog post with additional data
const getExtendedBlogPost = (slug: string): ExtendedBlogPost | null => {
  const post = getBlogPost(slug);
  if (!post) return null;

  // Get related posts (other published posts)
  const allPosts = getAllBlogPosts();
  const relatedPosts = allPosts
    .filter(p => p.slug !== slug)
    .slice(0, 3)
    .map(p => ({ slug: p.slug, title: p.title, readTime: p.readTime }));

  return {
    ...post,
    author: {
      name: post.author,
      avatar: 'https://picsum.photos/100/100?random=10',
      bio: 'AI Research Scientist specializing in deep learning and neural architectures.',
      social: {
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com',
        github: 'https://github.com'
      }
    },
    relatedPosts
  } as ExtendedBlogPost;
};

export default function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>('');
  const router = useRouter();
  const [post, setPost] = useState<ExtendedBlogPost | null>(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Resolve params Promise to get slug
    params.then(({ slug: resolvedSlug }) => {
      setSlug(resolvedSlug);
    });
  }, [params]);

  useEffect(() => {
    if (slug) {
      // Fetch blog post data
      const postData = getExtendedBlogPost(slug);
      setPost(postData);
    }
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!post) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        * {
          cursor: none !important;
        }
      `}</style>

      <CursorEffect />
      <Navigation personalInfo={{ alias: 'IRedDragonICY' }} />

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-900 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <main className="min-h-screen bg-black pt-24">
        <article className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link href="/blog">
              <motion.button
                whileHover={{ x: -5 }}
                className="flex items-center gap-2 text-cyan-400 hover:text-white transition-colors mb-8"
              >
                <FaArrowLeft />
                <span>Back to Blog</span>
              </motion.button>
            </Link>

            {/* Hero Image */}
            <div className="relative h-[400px] rounded-2xl overflow-hidden mb-8">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${post.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-cyan-400/20 backdrop-blur-sm text-cyan-400 text-sm rounded-full border border-cyan-400/30">
                      #{tag}
                    </span>
                  ))}
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {post.title}
                </h1>

                <div className="flex items-center gap-6 text-sm text-gray-300">
                  <span className="flex items-center gap-2">
                    <FaCalendar />
                    {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-2">
                    <FaClock />
                    {post.readTime}
                  </span>
                  <span className="flex items-center gap-2">
                    <FaEye />
                    {post.views.toLocaleString()} views
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Author Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mb-8 p-6 bg-gradient-to-br from-gray-900 to-black rounded-xl border border-cyan-400/20"
          >
            <div className="flex items-center gap-4">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-16 h-16 rounded-full border-2 border-cyan-400/50"
              />
              <div>
                <h3 className="text-white font-semibold">{post.author.name}</h3>
                <p className="text-gray-400 text-sm">{post.author.bio}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.a
                href={post.author.social.twitter}
                whileHover={{ scale: 1.1 }}
                className="text-gray-400 hover:text-cyan-400 transition-colors"
              >
                <FaTwitter size={20} />
              </motion.a>
              <motion.a
                href={post.author.social.linkedin}
                whileHover={{ scale: 1.1 }}
                className="text-gray-400 hover:text-cyan-400 transition-colors"
              >
                <FaLinkedin size={20} />
              </motion.a>
              <motion.a
                href={post.author.social.github}
                whileHover={{ scale: 1.1 }}
                className="text-gray-400 hover:text-cyan-400 transition-colors"
              >
                <FaGithub size={20} />
              </motion.a>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between mb-12 pb-8 border-b border-gray-800"
          >
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  liked 
                    ? 'bg-red-500/20 text-red-400 border border-red-400/30' 
                    : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white'
                }`}
              >
                <FaHeart className={liked ? 'text-red-400' : ''} />
                <span>{liked ? post.likes + 1 : post.likes}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setBookmarked(!bookmarked)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  bookmarked 
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30' 
                    : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white'
                }`}
              >
                <FaBookmark />
                {bookmarked ? 'Saved' : 'Save'}
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-gray-400 rounded-lg border border-gray-800 hover:text-white transition-all"
            >
              <HiOutlineShare />
              Share
            </motion.button>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="prose prose-invert prose-lg max-w-none"
          >
            <div
              className="text-gray-300"
              dangerouslySetInnerHTML={{
                __html: post.content.replace(/\n/g, '<br/>').replace(/#{1,6}\s(.+)/g, '<h3 class="text-2xl font-bold text-white mt-8 mb-4">$1</h3>')
              }}
            />
          </motion.div>

          {/* Related Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-16 pt-8 border-t border-gray-800"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Related Articles</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {post.relatedPosts.map((related: RelatedPost) => (
                <Link key={related.slug} href={`/blog/${related.slug}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-gradient-to-br from-gray-900 to-black rounded-lg border border-cyan-400/20 hover:border-cyan-400/40 transition-all"
                  >
                    <h4 className="text-white font-semibold mb-2">{related.title}</h4>
                    <span className="text-sm text-gray-400">{related.readTime}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </article>
      </main>
    </>
  );
}