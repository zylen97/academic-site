import fs from 'node:fs';
import path from 'node:path';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  content: string;
}

function parseFrontmatter(raw: string): { meta: Record<string, any>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: raw };

  const meta: Record<string, any> = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+):\s*(.+)$/);
    if (m) {
      let val = m[2].trim();
      // Remove quotes
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      // Parse array
      if (val.startsWith('[') && val.endsWith(']')) {
        val = val.slice(1, -1).split(',').map((s: string) => s.trim().replace(/^"|"$/g, '')) as any;
      }
      meta[m[1]] = val;
    }
  }

  return { meta, content: match[2].trim() };
}

export function getBlogPosts(): BlogPost[] {
  const dir = path.resolve('src/data/blog');
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  const posts: BlogPost[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const { meta, content } = parseFrontmatter(raw);
    posts.push({
      slug: file.replace('.md', ''),
      title: meta.title ?? file,
      date: meta.date ?? '',
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      summary: meta.summary ?? '',
      content,
    });
  }

  // Sort by date descending
  posts.sort((a, b) => b.date.localeCompare(a.date));
  return posts;
}
