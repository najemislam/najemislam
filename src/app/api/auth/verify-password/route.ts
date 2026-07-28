import { getSupabaseAdmin, getSupabasePublic } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';
import { comparePassword } from '@/lib/auth-utils';


export async function POST (request: Request) {
  try {
    const { password, userId } = await request.json();
    
    if (!password || !userId) {
      return NextResponse.json({ error: 'Password and userId required' }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('password_hash')
      .or(`id.eq.${userId},user_id.eq.${userId}`)
      .single();

    if (profileError || !profile || !profile.password_hash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await comparePassword(password, profile.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
