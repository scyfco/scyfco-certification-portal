import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { airtableRepository, isAirtableValidationError } from '@/lib/airtable/repository';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionIds = searchParams.get('ids');
    const allowedIds = session.intervenant.sessions || [];

    let ids: string[] | undefined;
    if (sessionIds) {
      ids = sessionIds
        .split(',')
        .filter((id) => allowedIds.includes(id));
    } else {
      ids = allowedIds;
    }

    if (!ids || ids.length === 0) {
      return NextResponse.json({ sessions: [] });
    }

    const sessions = await airtableRepository.listSessions(ids);

    return NextResponse.json({
      sessions,
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    if (isAirtableValidationError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
