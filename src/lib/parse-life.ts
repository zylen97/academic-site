import fs from 'node:fs';
import path from 'node:path';

export interface TravelEntry {
  title: string;
  location: string;
  date: string;
  duration: string;
  highlights: string;
  emoji: string;
}

export interface RunningEntry {
  race: string;
  location: string;
  date: string;
  target?: string;
  emoji: string;
}

export interface LifeData {
  travel: TravelEntry[];
  running: RunningEntry[];
}

/** Simple YAML parser for our flat-list structure */
function parseLifeYaml(content: string): LifeData {
  const result: LifeData = { travel: [], running: [] };
  let currentSection: 'travel' | 'running' | null = null;
  let currentItem: Record<string, string> | null = null;

  for (const line of content.split('\n')) {
    if (line.startsWith('#') || line.trim() === '') continue;

    if (line.match(/^travel:\s*$/)) { currentSection = 'travel'; currentItem = null; continue; }
    if (line.match(/^running:\s*$/)) { currentSection = 'running'; currentItem = null; continue; }
    if (!currentSection) continue;

    const newItemMatch = line.match(/^\s+-\s+(\w+):\s*"?([^"]*)"?\s*$/);
    if (newItemMatch) {
      currentItem = { [newItemMatch[1]]: newItemMatch[2] };
      (result[currentSection] as any[]).push(currentItem);
      continue;
    }

    const propMatch = line.match(/^\s+(\w+):\s*"?([^"]*)"?\s*$/);
    if (propMatch && currentItem) {
      currentItem[propMatch[1]] = propMatch[2];
    }
  }

  return result;
}

export function getLifeData(): LifeData {
  const filePath = path.resolve('src/data/life.yaml');
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseLifeYaml(content);
}
