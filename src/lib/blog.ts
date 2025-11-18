import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'src/content/blog');

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

export function getAllBlogPosts(): BlogPost[] {
  // Create directory if it doesn't exist
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
    .map(fileName => {
      const slug = fileName.replace(/\.mdx?$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      let fileContents = fs.readFileSync(fullPath, 'utf8');
      
      // Strip Byte Order Mark (BOM) if present
      if (fileContents.charCodeAt(0) === 0xFEFF) {
        fileContents = fileContents.slice(1);
      }

      // Use gray-matter to parse the post metadata section
      const { data, content } = matter(fileContents);

      return {
        slug,
        id: slug,
        content,
        title: data.title || 'Untitled Post',
        excerpt: data.excerpt || '',
        date: data.date || new Date().toISOString(),
        tags: data.tags || [],
        author: data.author || 'Anonymous',
        readTime: data.readTime || '5 min read',
        published: data.published !== false,
        image: data.image || '/images/default-blog.jpg',
        views: Math.floor(Math.random() * 1000) + 500,
        likes: Math.floor(Math.random() * 500) + 50,
        featured: data.featured || false,
        category: data.category || 'Opinion',
      } as BlogPost;
    });

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getBlogPost(slug: string): BlogPost | undefined {
  try {
    const fullPathMdx = path.join(postsDirectory, `${slug}.mdx`);
    const fullPathMd = path.join(postsDirectory, `${slug}.md`);
    
    let fileContents;
    if (fs.existsSync(fullPathMdx)) {
      fileContents = fs.readFileSync(fullPathMdx, 'utf8');
    } else if (fs.existsSync(fullPathMd)) {
      fileContents = fs.readFileSync(fullPathMd, 'utf8');
    } else {
      return undefined;
    }

    // Strip Byte Order Mark (BOM) if present
    if (fileContents.charCodeAt(0) === 0xFEFF) {
      fileContents = fileContents.slice(1);
    }

    const { data, content } = matter(fileContents);

    return {
      slug,
      id: slug,
      content,
      title: data.title || 'Untitled Post',
      excerpt: data.excerpt || '',
      date: data.date || new Date().toISOString(),
      tags: data.tags || [],
      author: data.author || 'Anonymous',
      readTime: data.readTime || '5 min read',
      published: data.published !== false,
      image: data.image || '/images/default-blog.jpg',
      views: Math.floor(Math.random() * 1000) + 500,
      likes: Math.floor(Math.random() * 500) + 50,
      featured: data.featured || false,
      category: data.category || 'Opinion',
    } as BlogPost;
  } catch (error) {
    console.error("Error reading blog post:", error);
    return undefined;
  }
}

export function getBlogPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map(fileName => fileName.replace(/\.mdx?$/, ''));
}
