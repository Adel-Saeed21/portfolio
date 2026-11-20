import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { readContent, writeContent } from '@/lib/content';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import { LANGS } from '@/lib/site';
import { isContent } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(await readContent());
}

export async function PUT(req: Request) {
  if (!verifySessionToken(cookies().get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const body: unknown = await req.json().catch(() => null);
  if (!isContent(body)) {
    return NextResponse.json({ error: 'invalid content' }, { status: 400 });
  }
  try {
    await writeContent(body);
  } catch (e) {
    // e.g. read-only file system on serverless hosts
    return NextResponse.json({ error: 'write failed', detail: String(e) }, { status: 500 });
  }
  // Pages are statically generated; rebuild them with the new content.
  for (const lang of LANGS) revalidatePath(`/${lang}`, 'layout');
  return NextResponse.json({ ok: true });
}
