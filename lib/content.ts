import { promises as fs } from 'fs';
import path from 'path';
import { timingSafeEqual } from 'crypto';
import type { Content } from './types';

const CONTENT_PATH = path.join(process.cwd(), 'data', 'content.json');

export async function readContent(): Promise<Content> {
  const raw = await fs.readFile(CONTENT_PATH, 'utf8');
  return JSON.parse(raw) as Content;
}

export async function writeContent(content: Content): Promise<void> {
  await fs.writeFile(CONTENT_PATH, JSON.stringify(content, null, 2) + '\n', 'utf8');
}

/** If ADMIN_PASSWORD is not set, editing is allowed only in development. */
export function checkPassword(given: string | null | undefined): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return process.env.NODE_ENV === 'development';
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
