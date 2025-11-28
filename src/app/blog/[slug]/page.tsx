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
  h1: (props: any) => <h1 className="text-4xl font-bold mt-8 mb-4 text-foreground" {...props} />,
  h2: (props: any) => <h2 className="text-3xl font-bold mt-8 mb-4 text-foreground border-b border-card-border pb-2" {...props} />,
  h3: (props: any) => <h3 className="text-2xl font-bold mt-6 mb-3 text-foreground" {...props} />,
  p: (props: any) => <p className="mb-4 leading-relaxed text-muted-foreground" {...props} />,
  ul: (props: any) => <ul className="list-disc list-inside mb-4 space-y-2 text-muted-foreground" {...props} />,
  ol: (props: any) => <ol className="list-decimal list-inside mb-4 space-y-2 text-muted-foreground" {...props} />,
  li: (props: any) => <li className="ml-4" {...props} />,
  blockquote: (props: any) => (
    <blockquote className="border-l-2 border-muted-foreground/30 pl-6 py-2 my-6 text-muted-foreground italic" {...props} />
  ),
  a: (props: any) => <a className="text-foreground underline underline-offset-2 hover:text-muted-foreground transition-colors" {...props} />,
  code: (props: any) => (
    <code className="bg-muted/50 text-foreground rounded px-1.5 py-0.5 font-mono text-sm" {...props} />
  ),
  pre: (props: any) => (
    <pre className="bg-card p-4 rounded-lg overflow-x-auto mb-6 border border-card-border" {...props} />
  ),
  img: (props: any) => (
    <div className="my-8 rounded-lg overflow-hidden border border-card-border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="w-full h-auto object-cover" {...props} alt={props.alt || 'Blog Image'} />
    </div>
  ),
  table: (props: any) => (
    <div className="overflow-x-auto my-8 border border-card-border rounded-lg bg-card">
      <table className="w-full text-left text-sm text-muted-foreground" {...props} />
    </div>
  ),
  th: (props: any) => <th className="bg-muted/30 px-4 py-3 text-foreground font-medium border-b border-card-border" {...props} />,
  td: (props: any) => <td className="px-4 py-3 border-b border-card-border hover:bg-muted/20 transition-colors" {...props} />,
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = getBlogPost(resolvedParams.slug);
  
  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-muted-foreground">Data stream not found.</p>
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
                      remarkGfm
                  ],
                  rehypePlugins: [
                      rehypeHighlight, 
                      rehypeSlug
                  ],
              }
          }}
        />
      </div>
    </BlogPostClientPage>
  );
}
