import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaClock, FaEye, FaHeart } from 'react-icons/fa';
import { BlogPost } from '@/data/blogPosts';

interface BlogCardProps {
  post: BlogPost;
  index: number;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, index }) => {
  const categoryColors: Record<string, string> = {
    'AI Research': 'text-cyan-400 border-cyan-400/30 bg-cyan-950/30',
    'Tutorial': 'text-emerald-400 border-emerald-400/30 bg-emerald-950/30',
    'Case Study': 'text-purple-400 border-purple-400/30 bg-purple-950/30',
    'Opinion': 'text-orange-400 border-orange-400/30 bg-orange-950/30'
  };

  const colorClass = categoryColors[post.category] || 'text-gray-400 border-gray-400/30 bg-gray-950/30';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative h-full"
    >
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <div className="relative h-full overflow-hidden rounded-xl bg-[#0a0a0c] border border-white/5 transition-all duration-500 group-hover:border-cyan-500/30 group-hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)]">
          
          {/* Image Container */}
          <div className="relative h-48 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] to-transparent z-10" />
            
            {/* Image */}
            <motion.img 
              src={post.image} 
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Category Tag */}
            <div className="absolute top-4 left-4 z-20">
              <span className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-full border backdrop-blur-md ${colorClass}`}>
                {post.category}
              </span>
            </div>

            {/* Tech Overlay Grid */}
            <div className="absolute inset-0 z-10 opacity-20 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(to_bottom,white,transparent)]" />
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col h-[calc(100%-12rem)]">
            {/* Meta Data */}
            <div className="flex items-center gap-4 mb-4 text-[10px] text-gray-500 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <FaClock className="w-3 h-3" />
                {post.readTime}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-cyan-400 transition-colors duration-300">
              {post.title}
            </h3>

            {/* Excerpt */}
            <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
              {post.excerpt}
            </p>

            {/* Footer Stats */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500 font-mono">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 group-hover:text-cyan-400 transition-colors">
                  <FaEye /> {post.views.toLocaleString()}
                </span>
                <span className="flex items-center gap-1.5 group-hover:text-pink-400 transition-colors">
                  <FaHeart /> {post.likes.toLocaleString()}
                </span>
              </div>
              <span className="text-cyan-500/0 group-hover:text-cyan-500 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                READ_Post &gt;&gt;
              </span>
            </div>
          </div>

          {/* Hover Corner Accents */}
          <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-cyan-500/0 group-hover:border-cyan-500/50 transition-all duration-500 rounded-tl-xl" />
          <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-cyan-500/0 group-hover:border-cyan-500/50 transition-all duration-500 rounded-br-xl" />
        </div>
      </Link>
    </motion.div>
  );
};

export default BlogCard;

