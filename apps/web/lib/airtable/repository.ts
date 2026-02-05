import { airtable, type AirtableRecord } from './client';



const TABLES = {

  INTERVENANT: 'Intervenant',

  SESSIONS: 'Sessions',

  EVALUATIONS_REFLEXIVES: 'Evaluations_Reflexives',

} as const;



const NOTE_FIELD_CANDIDATES = ['Note Reflexives', 'Note Reflexive', 'Note réflexive', 'Note réflexives'] as const;


const DEFAULT_BATCH_SIZE = 10;

const DEFAULT_BATCH_DELAY_MS = 200;



export class AirtableValidationError extends Error {

  status = 400;

  constructor(message: string) {

    super(message);

    this.name = 'AirtableValidationError';

  }

}



export const isAirtableValidationError = (error: unknown): error is AirtableValidationError =>

  error instanceof AirtableValidationError;



type ParticipantFields = {

  Nom?: string;

  Name?: string;

  'Nom complet'?: string;

  'Prénom'?: string;

  'First Name'?: string;

  Email?: string;
  Equipe?: string | number;
  'Nom_Session (from Session)'?: string;

  'Note Reflexives'?: string | number | null;
  'Note Reflexive'?: string | number | null;
  'Note réflexive'?: string | number | null;
  'Note réflexives'?: string | number | null;
  'Analyser et prévenir les risques liés à une situation complexe'?: string;

  'Définir un plan d’action collectif dans un environnement complexe'?: string;

  'Gérer les relations entre les parties prenantes dans le cadre du pilotage d’un projet complexe'?: string;

  'Les apports de la formation pour votre activité sont'?: string;

  "La qualité de l'animation de la formation est"?: string;

  'La qualité des conditions matérielles est selon vous'?: string;

  "A l'issue de la session, vous êtes"?: string;

  'Quelle est la probabilité que vous recommandiez SCYFCO à un ami / collègue / collaborateur ou membre de la famille ?'?: string;

  'Seriez-vous intéressé par une autre action de formation ?'?: string;

  'Autorisez-vous SCYFCO à vous contacter afin de répondre à votre demande?'?: string;

  "Quels seraient, selon vous, les points d'amélioration de la formation?"?: string;

  'Quels outils ou principes pensez-vous mettre en application, demain, dans votre contexte professionnel ?'?: string;

  'Votre témoignage - Libre expression'?: string;

  "Qu'avez-vous appris sur l'analyse des situations complexes (Méthodes, outils...)?"?: string;

  "Qu'avez-vous appris sur la prise de décision en situation complexe (Méthodes, outils...)?"?: string;

  "Quelles sont, selon vous, vos pistes personnelles d'amélioration?"?: string;

};



type SessionFields = {

  'Sessions de formation'?: string;

  Nom?: string;

  ID?: string;

  Session?: string;

  Date?: string;

  'Date de début'?: string;

  Statut?: string;

  Status?: string;

  Participants?: string[];

};



type IntervenantFields = {
  Nom?: string;
  Name?: string;
  Email?: string;
  Sessions?: string[];
  Equipe?: string | number;
};


export type Participant = {

  id: string;

  name: string;

  firstName: string;

  email: string;

  noteReflexive: number | null;

  analyserPrevenir?: string;

  definirPlan?: string;

  gererRelations?: string;

  apportsFormation?: string;

  qualiteAnimation?: string;

  qualiteConditions?: string;

  aLissue?: string;

  probabiliteRecommandation?: string;

  interetAutreFormation?: string;

  autorisationContact?: string;

  pointsAmelioration?: string;

  outilsPrincipes?: string;

  temoignage?: string;

  apprisAnalyse?: string;

  apprisPriseDecision?: string;

  pistesAmelioration?: string;

};



export type Session = {

  id: string;

  name: string;

  date: string;

  status: string;

  participants: string[];

};



export type Intervenant = {
  id: string;
  name: string;
  email: string;
  sessions: string[];
  equipe: string;
};


export type NoteUpdate = {

  participantId: string;

  note: number;

};

export type ParticipantAccess = {
  id: string;
  sessionName: string;
  equipe: string;
};



type BatchResult = {

  batchIndex: number;

  success: boolean;

  records?: unknown;

  error?: unknown;

};



type UpdateNotesResult = {

  success: boolean;

  totalUpdates: number;

  successCount: number;

  errorCount: number;

  batchesProcessed: number;

  results: BatchResult[];

};



const toNumberOrNull = (value: unknown) => {
  if (value === null || value === undefined || value === '') return null;
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isNaN(num) ? null : num;
};

const getNoteFieldValue = (fields: ParticipantFields) => {
  for (const field of NOTE_FIELD_CANDIDATES) {
    const value = fields[field];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return fields[NOTE_FIELD_CANDIDATES[0]];
};

const isUnknownFieldError = (error: unknown) => {
  const data = (error as { data?: { error?: { type?: string } } })?.data;
  return data?.error?.type === 'UNKNOWN_FIELD_NAME';
};

const serializeAirtableError = (error: unknown) => {
  const err = error as Error & { data?: unknown; status?: number };
  const data = err?.data as { error?: { type?: string; message?: string } } | undefined;
  return {
    message: err?.message,
    status: err?.status,
    type: data?.error?.type,
    details: data?.error?.message,
  };
};

const patchNoteRecordWithFallback = async (recordId: string, note: number) => {
  let lastError: unknown;
  for (const field of NOTE_FIELD_CANDIDATES) {
    try {
      return await airtable.patchRecord<ParticipantFields>(TABLES.EVALUATIONS_REFLEXIVES, recordId, {
        fields: {
          [field]: String(note),
        },
      });
    } catch (error) {
      lastError = error;
      if (!isUnknownFieldError(error)) {
        throw error;
      }
    }
  }
  throw lastError;
};

const patchNotesBatchWithFallback = async (updates: NoteUpdate[]) => {
  let lastError: unknown;
  for (const field of NOTE_FIELD_CANDIDATES) {
    try {
      return await airtable.patch<ParticipantFields>(TABLES.EVALUATIONS_REFLEXIVES, {
        records: updates.map((update) => ({
          id: update.participantId,
          fields: {
            [field]: String(update.note),
          },
        })),
      });
    } catch (error) {
      lastError = error;
      if (!isUnknownFieldError(error)) {
        throw error;
      }
    }
  }
  throw lastError;
};

export const resolveNoteFieldValue = (fields: ParticipantFields) => getNoteFieldValue(fields);


const mapParticipant = (record: AirtableRecord<ParticipantFields>): Participant => ({

  id: record.id,

  name: record.fields.Nom || record.fields.Name || record.fields['Nom complet'] || '',

  firstName: record.fields['Prénom'] || record.fields['First Name'] || '',

  email: record.fields.Email || '',

  noteReflexive: toNumberOrNull(getNoteFieldValue(record.fields)),
  analyserPrevenir: record.fields['Analyser et prévenir les risques liés à une situation complexe'] || '',

  definirPlan: record.fields['Définir un plan d’action collectif dans un environnement complexe'] || '',

  gererRelations:

    record.fields['Gérer les relations entre les parties prenantes dans le cadre du pilotage d’un projet complexe'] || '',

  apportsFormation: record.fields['Les apports de la formation pour votre activité sont'] || '',

  qualiteAnimation: record.fields["La qualité de l'animation de la formation est"] || '',

  qualiteConditions: record.fields['La qualité des conditions matérielles est selon vous'] || '',

  aLissue: record.fields["A l'issue de la session, vous êtes"] || '',

  probabiliteRecommandation:

    record.fields[

      'Quelle est la probabilité que vous recommandiez SCYFCO à un ami / collègue / collaborateur ou membre de la famille ?'

    ] || '',

  interetAutreFormation: record.fields['Seriez-vous intéressé par une autre action de formation ?'] || '',

  autorisationContact:

    record.fields['Autorisez-vous SCYFCO à vous contacter afin de répondre à votre demande?'] || '',

  pointsAmelioration:

    record.fields["Quels seraient, selon vous, les points d'amélioration de la formation?"] || '',

  outilsPrincipes:

    record.fields['Quels outils ou principes pensez-vous mettre en application, demain, dans votre contexte professionnel ?'] ||

    '',

  temoignage: record.fields['Votre témoignage - Libre expression'] || '',

  apprisAnalyse:

    record.fields["Qu'avez-vous appris sur l'analyse des situations complexes (Méthodes, outils...)?" ] || '',

  apprisPriseDecision:

    record.fields["Qu'avez-vous appris sur la prise de décision en situation complexe (Méthodes, outils...)?" ] || '',

  pistesAmelioration:

    record.fields["Quelles sont, selon vous, vos pistes personnelles d'amélioration?"] || '',

});

const mapParticipantAccess = (record: AirtableRecord<ParticipantFields>): ParticipantAccess => ({
  id: record.id,
  sessionName: record.fields['Nom_Session (from Session)'] || '',
  equipe:
    record.fields.Equipe === undefined || record.fields.Equipe === null
      ? ''
      : String(record.fields.Equipe),
});



const mapSession = (record: AirtableRecord<SessionFields>): Session => ({

  id: record.id,

  name:

    record.fields['Sessions de formation'] ||

    record.fields.Nom ||

    record.fields.ID ||

    record.fields.Session ||

    'Session sans nom',

  date: record.fields.Date || record.fields['Date de début'] || '',

  status: record.fields.Statut || record.fields.Status || '',

  participants: record.fields.Participants || [],

});



const mapIntervenant = (record: AirtableRecord<IntervenantFields>, fallbackEmail: string): Intervenant => ({
  id: record.id,
  name: record.fields.Nom || record.fields.Name || '',
  email: record.fields.Email || fallbackEmail,
  sessions: record.fields.Sessions || [],
  equipe:
    record.fields.Equipe === undefined || record.fields.Equipe === null
      ? ''
      : String(record.fields.Equipe),
});


const normalizeString = (value: unknown, fieldLabel: string, maxLength = 200) => {

  if (value === undefined || value === null) return undefined;

  if (typeof value !== 'string') {

    throw new AirtableValidationError(`${fieldLabel} invalide`);

  }

  const trimmed = value.trim();

  if (!trimmed) return undefined;

  if (trimmed.length > maxLength) {

    throw new AirtableValidationError(`${fieldLabel} trop long`);

  }

  return trimmed;

};



const normalizeEmail = (value: unknown) => {

  const email = normalizeString(value, 'Email', 254);

  if (!email) {

    throw new AirtableValidationError('Email requis');

  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {

    throw new AirtableValidationError('Email invalide');

  }

  return email.toLowerCase();

};



const escapeFormulaValue = (value: string) =>

  value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\\s+/g, ' ').trim();



const validateNote = (note: unknown) => {

  if (note === null || note === undefined || typeof note !== 'number' || Number.isNaN(note)) {

    throw new AirtableValidationError('Note invalide');

  }

  if (note < 0 || note > 100) {

    throw new AirtableValidationError('Note invalide (0-100)');

  }

  return note;

};



const normalizeRecordIds = (ids?: string[]) => {

  if (!ids || ids.length === 0) return [];

  const normalized = ids

    .filter((id) => typeof id === 'string')

    .map((id) => id.trim())

    .filter((id) => id.length > 0);

  if (normalized.length === 0) return [];

  const invalid = normalized.find((id) => !/^rec[A-Za-z0-9]{10,}$/.test(id));

  if (invalid) {

    throw new AirtableValidationError('ID session invalide');

  }

  return Array.from(new Set(normalized));

};



const buildFilterFormula = (filters: string[]) => {

  if (filters.length === 0) return undefined;

  if (filters.length === 1) return filters[0];

  return `AND(${filters.join(',')})`;

};



const chunk = <T>(items: T[], size: number) => {

  const result: T[][] = [];

  for (let i = 0; i < items.length; i += size) {

    result.push(items.slice(i, i + size));

  }

  return result;

};



export const airtableRepository = {

  findIntervenantByEmail: async (emailInput: unknown) => {

    const email = normalizeEmail(emailInput);

    const params = new URLSearchParams();

    params.set('filterByFormula', `{Email} = '${escapeFormulaValue(email)}'`);

    const data = await airtable.listAll<IntervenantFields>(TABLES.INTERVENANT, params);

    if (!data.records || data.records.length === 0) return null;

    return mapIntervenant(data.records[0], email);

  },

  listSessions: async (sessionIds?: string[]) => {

    const ids = normalizeRecordIds(sessionIds);

    if (ids.length === 0) return [];

    const params = new URLSearchParams();

    params.set('filterByFormula', `OR(${ids.map((id) => `RECORD_ID() = '${id}'`).join(',')})`);

    const data = await airtable.listAll<SessionFields>(TABLES.SESSIONS, params);

    return data.records.map(mapSession);

  },

  listParticipants: async (sessionName?: string, equipe?: string) => {
    const filters: string[] = [];
    const safeSessionName = normalizeString(sessionName, 'Nom de session', 200);
    let equipeFilter: string | undefined;
    if (equipe !== undefined && equipe !== null && equipe !== '') {
      if (typeof equipe === 'number' && !Number.isNaN(equipe)) {
        equipeFilter = `{Equipe} = ${equipe}`;
      } else {
        const safeEquipe = normalizeString(String(equipe), 'Equipe', 200);
        if (safeEquipe) {
          const isNumeric = /^[0-9]+(?:\\.[0-9]+)?$/.test(safeEquipe);
          equipeFilter = isNumeric ? `{Equipe} = ${safeEquipe}` : `{Equipe} = '${escapeFormulaValue(safeEquipe)}'`;
        }
      }
    }

    if (safeSessionName) {
      filters.push(`{Nom_Session (from Session)} = '${escapeFormulaValue(safeSessionName)}'`);
    }
    if (equipeFilter) {
      filters.push(equipeFilter);
    }


    const params = new URLSearchParams();

    const filterFormula = buildFilterFormula(filters);

    if (filterFormula) {

      params.set('filterByFormula', filterFormula);

    }



    const data = await airtable.listAll<ParticipantFields>(TABLES.EVALUATIONS_REFLEXIVES, params);

    return data.records.map(mapParticipant);

  },
  listParticipantsByIds: async (participantIds?: string[]) => {
    const ids = normalizeRecordIds(participantIds);
    if (ids.length === 0) return [];
    const params = new URLSearchParams();
    params.set('filterByFormula', `OR(${ids.map((id) => `RECORD_ID() = '${id}'`).join(',')})`);
    const data = await airtable.listAll<ParticipantFields>(TABLES.EVALUATIONS_REFLEXIVES, params);
    return data.records.map(mapParticipantAccess);
  },

  updateNote: async (participantId: unknown, noteInput: unknown) => {
    if (typeof participantId !== 'string' || participantId.trim().length === 0) {
      throw new AirtableValidationError('ID participant requis');
    }
    const note = validateNote(noteInput);
    return patchNoteRecordWithFallback(participantId.trim(), note);
  },
  updateNotesInBatches: async (

    updatesInput: unknown,

    options?: { batchSize?: number; delayMs?: number }

  ): Promise<UpdateNotesResult> => {

    if (!Array.isArray(updatesInput) || updatesInput.length === 0) {

      throw new AirtableValidationError('Liste de mises a jour requise');

    }

    const updates = updatesInput.map((update) => {

      const candidate = update as NoteUpdate;

      if (!candidate || typeof candidate !== 'object') {

        throw new AirtableValidationError('Mise a jour invalide');

      }

      if (!candidate.participantId || typeof candidate.participantId !== 'string') {

        throw new AirtableValidationError('ID participant requis');

      }

      const note = validateNote(candidate.note);

      return { participantId: candidate.participantId.trim(), note };

    });



    const batchSize = options?.batchSize ?? DEFAULT_BATCH_SIZE;

    if (batchSize > DEFAULT_BATCH_SIZE) {

      throw new AirtableValidationError('Batch trop grand');

    }

    const delayMs = options?.delayMs ?? DEFAULT_BATCH_DELAY_MS;

    const batches = chunk(updates, batchSize);



    const results: BatchResult[] = [];

    let successCount = 0;

    let errorCount = 0;



    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {

      const batch = batches[batchIndex];

      try {

        const data = await patchNotesBatchWithFallback(batch);
        successCount += batch.length;

        results.push({

          batchIndex: batchIndex + 1,

          success: true,

          records: data.records,

        });

      } catch (error) {
        errorCount += batch.length;
        results.push({
          batchIndex: batchIndex + 1,
          success: false,
          error: serializeAirtableError(error),
        });
      }


      if (batchIndex < batches.length - 1) {

        await new Promise((resolve) => setTimeout(resolve, delayMs));

      }

    }



    return {

      success: errorCount === 0,

      totalUpdates: updates.length,

      successCount,

      errorCount,

      batchesProcessed: batches.length,

      results,

    };

  },

};

