export interface BlogPost {
  slug: string;
  id: string; // Added for compatibility
  title: string;
  excerpt: string;
  content: string;
  date: string;
  tags: string[];
  author: string;
  readTime: string;
  published: boolean;
  // Additional fields for blog page compatibility
  image: string;
  views: number;
  likes: number;
  featured?: boolean;
  category: 'AI Research' | 'Tutorial' | 'Case Study' | 'Opinion';
}

export const blogPosts: BlogPost[] = [
  {
    slug: "welcome-to-my-blog",
    id: "welcome-to-my-blog",
    title: "Welcome to My Blog",
    excerpt: "Introduction to my personal blog and what you can expect to find here.",
    content: `# Welcome to My Blog

This is the beginning of my journey sharing thoughts, experiences, and technical insights with the world.

## What You'll Find Here

- Technical tutorials and insights
- Personal projects and experiments
- Thoughts on technology and innovation
- Behind-the-scenes content

Stay tuned for more exciting content!`,
    date: "2025-08-18",
    tags: ["welcome", "introduction", "blog"],
    author: "IRedDragonICY",
    readTime: "2 min read",
    published: true,
    image: "https://picsum.photos/800/400?random=1",
    views: 1250,
    likes: 89,
    featured: true,
    category: "Opinion",
  },
  {
    slug: "building-modern-web-applications",
    id: "building-modern-web-applications",
    title: "Building Modern Web Applications with Next.js",
    excerpt: "A comprehensive guide to building scalable web applications using Next.js and React.",
    content: `# Building Modern Web Applications with Next.js

Next.js has revolutionized the way we build React applications. In this post, I'll share my experience and best practices.

## Key Features

- Server-side rendering
- Static site generation
- API routes
- Automatic code splitting

## Best Practices

1. Use TypeScript for better type safety
2. Implement proper SEO optimization
3. Optimize for performance
4. Follow modern development patterns

The future of web development is bright with tools like Next.js!`,
    date: "2025-08-17",
    tags: ["nextjs", "react", "web-development", "tutorial"],
    author: "IRedDragonICY",
    readTime: "8 min read",
    published: true,
    image: "https://picsum.photos/800/400?random=2",
    views: 2341,
    likes: 456,
    featured: true,
    category: "Tutorial",
  },
  {
    slug: "future-of-ai-development",
    id: "future-of-ai-development",
    title: "The Future of AI in Software Development",
    excerpt: "Exploring how artificial intelligence is transforming the software development landscape.",
    content: `# The Future of AI in Software Development

Artificial Intelligence is not just changing how we write code, but how we think about software development itself.

## Current Impact

- Code completion and suggestions
- Automated testing
- Bug detection and fixing
- Documentation generation

## Future Possibilities

The possibilities are endless as AI continues to evolve and integrate deeper into our development workflows.`,
    date: "2025-08-16",
    tags: ["ai", "artificial-intelligence", "development", "future"],
    author: "IRedDragonICY",
    readTime: "6 min read",
    published: true,
    image: "https://picsum.photos/800/400?random=3",
    views: 1892,
    likes: 234,
    featured: false,
    category: "AI Research",
  },
];

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.filter(post => post.published).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug && post.published);
}

export function getBlogPostSlugs(): string[] {
  return blogPosts
    .filter(post => post.published)
    .map(post => post.slug);
}
