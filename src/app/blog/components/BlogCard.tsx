import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaClock, FaEye, FaHeart } from 'react-icons/fa';
import { BlogPost } from '@/lib/blog';

interface BlogCardProps {
  post: BlogPost;
  index: number;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative h-full"
    >
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <div className="relative h-full overflow-hidden rounded-lg bg-card border border-card-border transition-all duration-300 hover:border-foreground/20">
          
          {/* Image Container */}
          <div className="relative h-48 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent z-10" />
            
            {/* Image */}
            <motion.img 
              src={post.image} 
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Category Tag */}
            <div className="absolute top-4 left-4 z-20">
              <span className="px-2.5 py-1 text-xs bg-background/80 backdrop-blur-sm rounded text-muted-foreground">
                {post.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col h-[calc(100%-12rem)]">
            {/* Meta Data */}
            <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
              <span>
                {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <FaClock className="w-3 h-3" />
                {post.readTime}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-medium text-foreground mb-3 line-clamp-2 group-hover:text-muted-foreground transition-colors">
              {post.title}
            </h3>

            {/* Excerpt */}
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
              {post.excerpt}
            </p>

            {/* Footer Stats */}
            <div className="pt-4 border-t border-card-border flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <FaEye className="w-3 h-3" /> {post.views.toLocaleString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <FaHeart className="w-3 h-3" /> {post.likes.toLocaleString()}
                </span>
              </div>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                Read →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default BlogCard;

