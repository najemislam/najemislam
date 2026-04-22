import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sharableId = searchParams.get('sharable_id') || searchParams.get('username');

    if (!sharableId || sharableId.length < 3) {
      return NextResponse.json({ available: false, error: 'Sharable ID must be at least 3 characters' }, { status: 400 });
    }

    // Validate format: alphanumeric and underscores only
    if (!/^[a-zA-Z0-9_]+$/.test(sharableId)) {
      return NextResponse.json({ available: false, error: 'Sharable ID can only contain letters, numbers, and underscores' }, { status: 400 });
    }

    const { data } = await supabaseAdmin
      .from('profiles')
      .select('sharable_id')
      .eq('sharable_id', sharableId.toLowerCase())
      .single();

    return NextResponse.json({ available: !data });
  } catch (error: any) {
    return NextResponse.json({ available: true });
  }
}
