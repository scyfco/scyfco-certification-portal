import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      intervenant: session.intervenant,
    });
  } catch (error) {
    console.error('Error auth/me:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

