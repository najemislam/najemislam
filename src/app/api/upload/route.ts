import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, getSupabasePublic } from '@/lib/supabase/server-client';
import { verifyToken } from '@/lib/auth-utils';

export const maxDuration = 60;

export const runtime = 'nodejs';


export async function POST (request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(c => {
      const idx = c.indexOf('=');
      return [c.slice(0, idx), c.slice(idx + 1)];
    })
  );
  const token = cookies['sb-auth-token'];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const bucket = (formData.get('bucket') as string) || 'posts';

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const fileExt = file.name.includes('.') ? file.name.split('.').pop() : '';
  const fileName = `${payload.userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(fileName, buffer, { contentType: file.type });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return a proxy URL so the raw Supabase storage URL is never exposed to the client
  const url = `/api/media/${bucket}/${fileName}`;
  return NextResponse.json({ url, path: fileName });
}
