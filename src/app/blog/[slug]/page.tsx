import React from 'react';
import BlogPostClientPage from './BlogPostClientPage';
import { getBlogPost, getAllBlogPosts } from '@/lib/blog';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/atom-one-dark.css'; 

// Custom components map
/* eslint-disable @typescript-eslint/no-explicit-any */
const components = {
  h1: (props: any) => <h1 className="text-4xl font-bold mt-8 mb-4 text-cyan-50" {...props} />,
  h2: (props: any) => <h2 className="text-3xl font-bold mt-8 mb-4 text-cyan-100 border-b border-cyan-900/30 pb-2" {...props} />,
  h3: (props: any) => <h3 className="text-2xl font-bold mt-6 mb-3 text-cyan-200" {...props} />,
  p: (props: any) => <p className="mb-4 leading-relaxed text-gray-300" {...props} />,
  ul: (props: any) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-300" {...props} />,
  ol: (props: any) => <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-300" {...props} />,
  li: (props: any) => <li className="ml-4" {...props} />,
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-cyan-500 pl-4 py-2 my-4 bg-cyan-950/20 italic text-gray-300 rounded-r-lg shadow-lg backdrop-blur-sm" {...props} />
  ),
  a: (props: any) => <a className="text-cyan-400 hover:text-cyan-300 underline decoration-cyan-500/30 hover:decoration-cyan-300 transition-all" {...props} />,
  code: (props: any) => (
    <code className="bg-gray-900 text-cyan-300 rounded px-1.5 py-0.5 font-mono text-sm border border-white/10" {...props} />
  ),
  pre: (props: any) => (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
      <pre className="relative bg-[#0d1117] p-4 rounded-xl overflow-x-auto mb-6 border border-white/10 shadow-2xl" {...props} />
    </div>
  ),
  img: (props: any) => (
    <div className="relative my-8 rounded-xl overflow-hidden border border-white/10 shadow-2xl group">
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105" {...props} alt={props.alt || 'Blog Image'} />
    </div>
  ),
  table: (props: any) => (
    <div className="overflow-x-auto my-8 border border-white/10 rounded-lg shadow-xl bg-white/5 backdrop-blur-sm">
      <table className="w-full text-left text-sm text-gray-400" {...props} />
    </div>
  ),
  th: (props: any) => <th className="bg-black/40 px-4 py-3 text-cyan-400 font-bold border-b border-white/10 font-mono uppercase tracking-wider" {...props} />,
  td: (props: any) => <td className="px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors" {...props} />,
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = getBlogPost(resolvedParams.slug);
  
  if (!post) {
    return (
      <div className="min-h-screen bg-[#030305] flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-gray-400">Data stream not found.</p>
        </div>
      </div>
    );
  }

  const allPosts = getAllBlogPosts();
  const relatedPosts = allPosts
    .filter(p => p.category === post.category && p.slug !== post.slug)
    .slice(0, 2);

  return (
    <BlogPostClientPage post={post} relatedPosts={relatedPosts}>
      <div className="mdx-content">
        <MDXRemote 
          source={post.content} 
          components={components}
          options={{
              mdxOptions: {
                  remarkPlugins: [
                      // @ts-expect-error: remarkGfm type mismatch
                      remarkGfm
                  ],
                  rehypePlugins: [
                      // @ts-expect-error: rehypeHighlight type mismatch
                      rehypeHighlight, 
                      // @ts-expect-error: rehypeSlug type mismatch
                      rehypeSlug
                  ],
              }
          }}
        />
      </div>
    </BlogPostClientPage>
  );
}
