import React from 'react';
import BlogClientPage from './BlogClientPage';
import { getAllBlogPosts } from '@/lib/blog';

export default function BlogPage() {
  const posts = getAllBlogPosts();
  return <BlogClientPage initialPosts={posts} />;
}
