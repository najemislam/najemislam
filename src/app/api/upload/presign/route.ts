import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, getSupabasePublic } from '@/lib/supabase/server-client';
import { verifyToken } from '@/lib/auth-utils';


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

  const { fileName, fileType, bucket = 'posts' } = await request.json();

  if (!fileName || !fileType) {
    return NextResponse.json({ error: 'fileName and fileType required' }, { status: 400 });
  }

  const fileExt = fileName.split('.').pop();
  const storagePath = `${payload.userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Failed to create signed URL' }, { status: 500 });
  }

  // Return a proxy URL so the raw Supabase storage URL is never exposed to the client
  const publicUrl = `/api/media/${bucket}/${storagePath}`;

  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    path: storagePath,
    publicUrl,
  });
}
