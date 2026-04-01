import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { airtableRepository, isAirtableValidationError } from '@/lib/airtable/repository';

const hasPortalAccess = (value: unknown) => {
  if (typeof value !== 'string') return false;
  return value.trim().toLowerCase() === 'oui';
};

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const intervenantData = await airtableRepository.findIntervenantByEmailAndPassword(email, password);
    if (!intervenantData) {
      return NextResponse.json({ error: 'Aucun intervenant trouvé avec cet email' }, { status: 404 });
    }

    if (!hasPortalAccess(intervenantData.autorisePortail)) {
      return NextResponse.json({ error: 'Acces portail non autorise' }, { status: 403 });
    }

    const token = await createSessionToken({ intervenant: intervenantData });

    const responsePayload = NextResponse.json({
      success: true,
      intervenant: intervenantData,
    });

    responsePayload.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return responsePayload;
  } catch (error) {
    console.error('Error login:', error);
    if (isAirtableValidationError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
