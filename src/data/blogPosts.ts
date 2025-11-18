export interface BlogPost {
  slug: string;
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  tags: string[];
  author: string;
  readTime: string;
  published: boolean;
  image: string;
  views: number;
  likes: number;
  featured?: boolean;
  category: 'AI Research' | 'Tutorial' | 'Case Study' | 'Opinion';
}

export const blogPosts: BlogPost[] = [
  {
    slug: "i-love-firefly",
    id: "i-love-firefly",
    title: "Why I Love Firefly: The Future of Generative Creativity",
    excerpt: "An in-depth look at how Firefly is redefining the boundaries of digital art and why it has become an indispensable tool in my creative workflow.",
    content: `# Why I Love Firefly: The Future of Generative Creativity

In the rapidly evolving landscape of generative AI, few tools have captured my imagination quite like Firefly. It represents not just a leap forward in technology, but a fundamental shift in how we approach digital creation.

## The Intersection of Ethics and Power

What sets Firefly apart is its foundation. Trained on safe, licensed content, it brings a level of professional reliability that is rare in the generative space. This isn't just about avoiding copyright issues; it's about building a sustainable future for AI art where creators and technology coexist in harmony.

## Creative Control Redefined

The level of granular control Firefly offers is staggering. From precise lighting adjustments to style matching, it feels less like a slot machine and more like a powerful extension of my own artistic intent.

### Key Features That Changed My Workflow

1.  **Generative Fill**: The ability to extend images and modify elements with context-aware generation is magic.
2.  **Text Effects**: Transforming typography into visual textures opens up new frontiers for branding.
3.  **Vector Recolor**: A game-changer for rapid iteration on color palettes.

## A New Era of Expression

We are standing at the precipice of a new renaissance in digital art. Firefly isn't replacing the artist; it is amplifying the human imagination. It allows us to dream bigger, iterate faster, and explore concepts that were previously out of reach.

For an agency like ours, specializing in diffusion and generative technologies, Firefly is more than a tool—it is a partner in creation. It embodies the perfect synthesis of technical precision and artistic soul.

This is why I love Firefly. It doesn't just generate images; it generates possibilities.`,
    date: "2025-11-18",
    tags: ["firefly", "generative-ai", "design", "creativity", "adobe"],
    author: "IRedDragonICY",
    readTime: "5 min read",
    published: true,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    views: 4021,
    likes: 892,
    featured: true,
    category: "Opinion",
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
