import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, getSupabasePublic } from '@/lib/supabase/server-client';


export async function GET (req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const follower_id = searchParams.get('follower_id');
    const following_id = searchParams.get('following_id');

    if (!follower_id || !following_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('follows')
      .select('id')
      .eq('follower_id', follower_id)
      .eq('following_id', following_id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({ isFollowing: !!data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
