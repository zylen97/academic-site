import fs from 'node:fs';
import path from 'node:path';

export interface Project {
  title: string;
  method: string;
  journal: string;
  role: '一作' | '通讯';
  year?: number;
  isPublic: boolean;
  status: 'published' | 'under-review' | 'in-progress';
}

export interface ProjectGroups {
  published: Project[];
  underReview: Project[];
  inProgress: Project[];
}

const STATUS_MAP: Record<string, Project['status']> = {
  '已发表': 'published',
  '投稿中': 'under-review',
  '撰写中': 'in-progress',
};

function parseTableRow(row: string): string[] {
  return row
    .split('|')
    .map((cell) => cell.trim())
    .filter((cell) => cell !== '');
}

function isSeparatorRow(row: string): boolean {
  return /^\|[\s-|]+\|$/.test(row.trim());
}

export function parseProjects(): ProjectGroups {
  const filePath = path.resolve('src/data/projects.md');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const groups: ProjectGroups = {
    published: [],
    underReview: [],
    inProgress: [],
  };

  let currentStatus: Project['status'] | null = null;
  let headers: string[] = [];
  let headerParsed = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect section heading
    const headingMatch = trimmed.match(/^##\s+(.+)/);
    if (headingMatch) {
      const sectionName = headingMatch[1].trim();
      currentStatus = STATUS_MAP[sectionName] ?? null;
      headerParsed = false;
      headers = [];
      continue;
    }

    if (!currentStatus) continue;

    // Skip empty lines
    if (!trimmed || !trimmed.startsWith('|')) continue;

    // Skip separator row
    if (isSeparatorRow(trimmed)) continue;

    const cells = parseTableRow(trimmed);

    // Parse header row
    if (!headerParsed) {
      headers = cells;
      headerParsed = true;
      continue;
    }

    // Parse data row
    const record: Record<string, string> = {};
    headers.forEach((h, i) => {
      record[h] = cells[i] ?? '';
    });

    const project: Project = {
      title: record['标题'] ?? '',
      method: record['方法'] ?? '',
      journal: record['期刊'] || record['目标期刊'] || '',
      role: (record['身份'] as Project['role']) ?? '一作',
      isPublic: record['公开'] === '✅',
      status: currentStatus,
    };

    if (record['年份']) {
      project.year = parseInt(record['年份'], 10);
    }

    // Group
    switch (currentStatus) {
      case 'published':
        groups.published.push(project);
        break;
      case 'under-review':
        groups.underReview.push(project);
        break;
      case 'in-progress':
        groups.inProgress.push(project);
        break;
    }
  }

  return groups;
}

/** Get only public projects */
export function getPublicProjects(): ProjectGroups {
  const all = parseProjects();
  return {
    published: all.published.filter((p) => p.isPublic),
    underReview: all.underReview.filter((p) => p.isPublic),
    inProgress: all.inProgress.filter((p) => p.isPublic),
  };
}
