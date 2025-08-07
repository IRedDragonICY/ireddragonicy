// app/blog/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaCalendar, FaClock, FaTag, FaSearch, FaFilter, FaEye, FaHeart, FaShare } from 'react-icons/fa';
import { HiSparkles, HiOutlineBookOpen } from 'react-icons/hi';
import { SiMedium, SiHashnode } from 'react-icons/si';
import Navigation from '@/components/Navigation';
import CursorEffect from '@/components/CursorEffect';

// Blog data type
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  readTime: string;
  tags: string[];
  image: string;
  views: number;
  likes: number;
  featured?: boolean;
  category: 'AI Research' | 'Tutorial' | 'Case Study' | 'Opinion';
}

// Sample blog posts data
const blogPosts: BlogPost[] = [
  {
    id: 'understanding-transformers',
    title: 'Understanding Transformer Architecture: From Attention to GPT',
    excerpt: 'Deep dive into the revolutionary transformer architecture that powers modern AI language models like GPT and BERT.',
    date: '2024-01-15',
    readTime: '12 min',
    tags: ['Transformers', 'NLP', 'Deep Learning', 'GPT'],
    image: 'https://picsum.photos/800/400?random=1',
    views: 1523,
    likes: 234,
    featured: true,
    category: 'AI Research'
  },
  {
    id: 'stable-diffusion-explained',
    title: 'Stable Diffusion Explained: How AI Creates Art',
    excerpt: 'Exploring the mathematics and implementation behind diffusion models and their application in AI art generation.',
    date: '2024-01-10',
    readTime: '15 min',
    tags: ['Diffusion Models', 'Computer Vision', 'Generative AI'],
    image: 'https://picsum.photos/800/400?random=2',
    views: 2341,
    likes: 456,
    featured: true,
    category: 'AI Research'
  },
  {
    id: 'fine-tuning-llms',
    title: 'Fine-tuning LLMs with LoRA: A Practical Guide',
    excerpt: 'Step-by-step tutorial on efficiently fine-tuning large language models using Low-Rank Adaptation techniques.',
    date: '2024-01-08',
    readTime: '10 min',
    tags: ['LLM', 'LoRA', 'Fine-tuning', 'Tutorial'],
    image: 'https://picsum.photos/800/400?random=3',
    views: 892,
    likes: 123,
    category: 'Tutorial'
  },
  {
    id: 'rag-implementation',
    title: 'Building a RAG System from Scratch',
    excerpt: 'Implementing Retrieval-Augmented Generation for enhanced AI responses using vector databases and embeddings.',
    date: '2024-01-05',
    readTime: '18 min',
    tags: ['RAG', 'Vector DB', 'Embeddings', 'LangChain'],
    image: 'https://picsum.photos/800/400?random=4',
    views: 1102,
    likes: 189,
    category: 'Tutorial'
  },
  {
    id: 'vision-transformers',
    title: 'Vision Transformers: When Attention Meets Computer Vision',
    excerpt: 'How transformers revolutionized computer vision tasks and why ViT outperforms traditional CNNs.',
    date: '2024-01-02',
    readTime: '14 min',
    tags: ['ViT', 'Computer Vision', 'Transformers'],
    image: 'https://picsum.photos/800/400?random=5',
    views: 756,
    likes: 98,
    category: 'AI Research'
  },
  {
    id: 'ml-deployment',
    title: 'Deploying ML Models at Scale: Best Practices',
    excerpt: 'Production-ready machine learning deployment strategies using Docker, Kubernetes, and MLOps principles.',
    date: '2023-12-28',
    readTime: '20 min',
    tags: ['MLOps', 'Deployment', 'Docker', 'Kubernetes'],
    image: 'https://picsum.photos/800/400?random=6',
    views: 1435,
    likes: 201,
    category: 'Case Study'
  }
];

// Category colors
const categoryColors: Record<string, string> = {
  'AI Research': 'from-cyan-500 to-blue-600',
  'Tutorial': 'from-green-500 to-emerald-600',
  'Case Study': 'from-purple-500 to-pink-600',
  'Opinion': 'from-orange-500 to-red-600'
};

// Featured post component
const FeaturedPost = ({ post }: { post: BlogPost }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative group"
    >
      <Link href={`/blog/${post.id}`}>
        <div className="relative h-[400px] rounded-2xl overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url(${post.image})` }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          {/* Featured Badge */}
          <motion.div
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            className="absolute top-4 left-4 px-3 py-1 bg-yellow-500/90 backdrop-blur-sm rounded-full"
          >
            <span className="flex items-center gap-1 text-xs font-bold text-black">
              <HiSparkles /> FEATURED
            </span>
          </motion.div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${categoryColors[post.category]} mb-4`}>
              <span className="text-xs font-semibold text-white">{post.category}</span>
            </div>

            <h2 className="text-3xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
              {post.title}
            </h2>

            <p className="text-gray-300 mb-4 line-clamp-2">{post.excerpt}</p>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <FaCalendar className="text-xs" />
                {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <FaClock className="text-xs" />
                {post.readTime}
              </span>
              <span className="flex items-center gap-1">
                <FaEye className="text-xs" />
                {post.views.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// Blog card component
const BlogCard = ({ post, index }: { post: BlogPost; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Link href={`/blog/${post.id}`}>
        <div className="relative h-full bg-gradient-to-br from-gray-900 to-black rounded-xl border border-cyan-400/20 overflow-hidden hover:border-cyan-400/40 transition-all duration-300">
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url(${post.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

            {/* Category Badge */}
            <div className="absolute top-3 right-3">
              <div className={`px-2 py-1 rounded-lg bg-gradient-to-r ${categoryColors[post.category]} opacity-90`}>
                <span className="text-xs font-semibold text-white">{post.category}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2 text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
              {post.title}
            </h3>

            <p className="text-gray-400 text-sm mb-4 line-clamp-3">
              {post.excerpt}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-1 bg-cyan-400/10 text-cyan-400 text-xs rounded-full border border-cyan-400/20">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Meta */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <FaCalendar />
                  {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <FaClock />
                  {post.readTime}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <FaEye />
                  {post.views}
                </span>
                <span className="flex items-center gap-1">
                  <FaHeart />
                  {post.likes}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default function BlogPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filteredPosts, setFilteredPosts] = useState(blogPosts);

  const categories = ['All', 'AI Research', 'Tutorial', 'Case Study', 'Opinion'];

  useEffect(() => {
    let filtered = blogPosts;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredPosts(filtered);
  }, [searchQuery, selectedCategory]);

  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <>
      <style jsx global>{`
        * {
          cursor: none !important;
        }
        
        body {
          cursor: none !important;
        }
      `}</style>

      <CursorEffect />
      <Navigation personalInfo={{ alias: 'IRedDragonICY' }} />

      <main className="min-h-screen bg-black pt-24">
        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-purple-500/5" />
            <motion.div
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, cyan 0%, transparent 50%)',
                backgroundSize: '100% 100%',
              }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <motion.button
                onClick={() => router.push('/')}
                whileHover={{ x: -5 }}
                className="flex items-center gap-2 text-cyan-400 hover:text-white transition-colors mb-8 mx-auto"
              >
                <FaArrowLeft />
                <span>Back to Portfolio</span>
              </motion.button>

              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                  AI Research Blog
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Exploring the frontiers of artificial intelligence, machine learning, and neural networks
              </p>

              {/* Stats */}
              <div className="flex justify-center gap-8 mt-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-cyan-400">{blogPosts.length}</div>
                  <div className="text-sm text-gray-500">Articles</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-purple-400">
                    {blogPosts.reduce((acc, post) => acc + post.views, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Total Views</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-pink-400">
                    {[...new Set(blogPosts.flatMap(post => post.tags))].length}
                  </div>
                  <div className="text-sm text-gray-500">Topics</div>
                </motion.div>
              </div>
            </motion.div>

            {/* Search and Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-4xl mx-auto mb-12"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-cyan-400/20 rounded-xl text-white placeholder-gray-500 focus:border-cyan-400/40 focus:outline-none transition-colors"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 flex-wrap">
                  {categories.map((category) => (
                    <motion.button
                      key={category}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedCategory === category
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                          : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                      }`}
                    >
                      {category}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Featured Posts */}
            {selectedCategory === 'All' && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Featured Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {featuredPosts.map((post) => (
                    <FeaturedPost key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Posts Grid */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                {selectedCategory === 'All' ? 'Latest Articles' : `${selectedCategory} Articles`}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularPosts.map((post, index) => (
                  <BlogCard key={post.id} post={post} index={index} />
                ))}
              </div>

              {regularPosts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <HiOutlineBookOpen className="text-6xl text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">No articles found matching your criteria</p>
                </motion.div>
              )}
            </div>

            {/* Newsletter CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-20 p-8 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-cyan-400/20"
            >
              <div className="text-center max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
                <p className="text-gray-400 mb-6">
                  Get the latest AI research insights and tutorials delivered to your inbox
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 bg-black/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400/40 focus:outline-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                  >
                    Subscribe
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}