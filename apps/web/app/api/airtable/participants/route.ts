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
    const sessionName = searchParams.get('sessionName');
    const equipe = session.intervenant.equipe || undefined;

    if (sessionName) {
      const allowedSessions = await airtableRepository.listSessions(session.intervenant.sessions || []);
      const allowedSessionNames = new Set(allowedSessions.map((s) => s.name));
      if (!allowedSessionNames.has(sessionName)) {
        return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });
      }
    }

    const participants = await airtableRepository.listParticipants(sessionName || undefined, equipe || undefined);

    return NextResponse.json({
      participants,
    });
  } catch (error) {
    if (isAirtableValidationError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
