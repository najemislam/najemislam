import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, getSupabasePublic } from '@/lib/supabase/server-client';
import { verifyToken } from '@/lib/auth-utils';


export async function POST (req: NextRequest) {
  try {
    const token = req.cookies.get('sb-auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const authUserId = payload.userId as string;

    const { conversation_id, user_id } = await req.json();

    if (!conversation_id || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Enforce: only mark read for yourself
    if (user_id !== authUserId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversation_id)
      .neq('sender_id', user_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
