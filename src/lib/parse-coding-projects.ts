import fs from 'node:fs';
import path from 'node:path';

export interface CodingProject {
  name: string;
  slug: string;
  description: string;
  repo: string;
  tags: string[];
  featured: boolean;
}

/** Simple YAML parser for coding projects flat-list structure */
function parseCodingProjectsYaml(content: string): CodingProject[] {
  const projects: CodingProject[] = [];
  let currentItem: Record<string, any> | null = null;

  for (const line of content.split('\n')) {
    if (line.startsWith('#') || line.trim() === '') continue;

    // New list item: "- name: ..."
    const newItemMatch = line.match(/^\s*-\s+(\w+):\s*(.+)$/);
    if (newItemMatch) {
      currentItem = { [newItemMatch[1]]: newItemMatch[2].trim() };
      projects.push(currentItem as any);
      continue;
    }

    // Continuation property
    const propMatch = line.match(/^\s+(\w+):\s*(.+)$/);
    if (propMatch && currentItem) {
      const key = propMatch[1];
      let value: any = propMatch[2].trim();

      // Parse inline array: [a, b, c]
      const arrayMatch = value.match(/^\[(.+)\]$/);
      if (arrayMatch) {
        value = arrayMatch[1].split(',').map((s: string) => s.trim());
      }

      // Parse boolean
      if (value === 'true') value = true;
      if (value === 'false') value = false;

      currentItem[key] = value;
    }
  }

  return projects;
}

export function getCodingProjects(): CodingProject[] {
  const filePath = path.resolve('src/data/coding-projects.yaml');
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseCodingProjectsYaml(content);
}
