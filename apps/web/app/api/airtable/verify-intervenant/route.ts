import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { airtableRepository, isAirtableValidationError } from '@/lib/airtable/repository';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { email } = await request.json();

    const intervenantData = await airtableRepository.findIntervenantByEmail(email);

    if (!intervenantData) {
      return NextResponse.json(
        { error: 'Aucun intervenant trouvé avec cet email' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      intervenant: intervenantData,
    });
  } catch (error) {
    console.error('Error verifying intervenant:', error);
    if (isAirtableValidationError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
