import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { airtableRepository, isAirtableValidationError, resolveNoteFieldValue } from '@/lib/airtable/repository';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { participantId, note } = await request.json();
    if (!participantId || typeof participantId !== 'string') {
      return NextResponse.json({ error: 'ID participant requis' }, { status: 400 });
    }

    const participants = await airtableRepository.listParticipantsByIds([participantId]);
    if (participants.length !== 1) {
      return NextResponse.json({ error: 'Participant introuvable' }, { status: 404 });
    }

    const allowedSessions = await airtableRepository.listSessions(session.intervenant.sessions || []);
    const allowedSessionNames = new Set(allowedSessions.map((s) => s.name));
    const expectedEquipe = session.intervenant.equipe || '';
    const participant = participants[0];

    if (
      !participant.sessionName ||
      (expectedEquipe && participant.equipe !== expectedEquipe) ||
      !allowedSessionNames.has(participant.sessionName)
    ) {
      return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });
    }

    const data = await airtableRepository.updateNote(participantId, note);

    return NextResponse.json({
      success: true,
      participant: {
        id: data.id,
        noteReflexive: resolveNoteFieldValue(data.fields),
      },
    });
  } catch (error) {
    console.error('Error updating note:', error);
    if (isAirtableValidationError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
