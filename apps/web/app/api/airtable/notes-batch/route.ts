import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { airtableRepository, isAirtableValidationError } from '@/lib/airtable/repository';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { updates } = (await request.json()) as { updates: unknown };
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'Liste de mises a jour requise' }, { status: 400 });
    }

    const participantIds = updates.map((update) => {
      const candidate = update as { participantId?: unknown };
      return typeof candidate?.participantId === 'string' ? candidate.participantId.trim() : '';
    });

    if (participantIds.some((id) => id.length === 0)) {
      return NextResponse.json({ error: 'ID participant requis' }, { status: 400 });
    }

    const uniqueIds = Array.from(new Set(participantIds));
    const participants = await airtableRepository.listParticipantsByIds(uniqueIds);
    if (participants.length !== uniqueIds.length) {
      return NextResponse.json({ error: 'Participant introuvable' }, { status: 404 });
    }

    const allowedSessions = await airtableRepository.listSessions(session.intervenant.sessions || []);
    const allowedSessionNames = new Set(allowedSessions.map((s) => s.name));
    const expectedEquipe = session.intervenant.equipe || '';

    const unauthorized = participants.find((participant) => {
      if (!participant.sessionName) return true;
      if (expectedEquipe && participant.equipe !== expectedEquipe) return true;
      if (!allowedSessionNames.has(participant.sessionName)) return true;
      return false;
    });

    if (unauthorized) {
      return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });
    }

    const result = await airtableRepository.updateNotesInBatches(updates);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in batch update:', error);
    if (isAirtableValidationError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour par lots' },
      { status: 500 }
    );
  }
}
