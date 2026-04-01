type AirtableConfig = {
  apiKey: string;
  baseId: string;
};

type AirtableResponse<T> = {
  records: T[];
  offset?: string;
};

export type AirtableRecord<TFields> = {
  id: string;
  fields: TFields;
};

const getConfig = (): AirtableConfig => {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID || 'appFxs2dtqdiAbGVM';

  if (!apiKey) {
    throw new Error('AIRTABLE_API_KEY manquant');
  }

  return { apiKey, baseId };
};

const buildUrl = (baseId: string, table: string, params?: URLSearchParams) => {
  const url = new URL(`https://api.airtable.com/v0/${baseId}/${table}`);
  if (params) {
    url.search = params.toString();
  }
  return url.toString();
};

const request = async <T>(table: string, init?: RequestInit, params?: URLSearchParams) => {
  const { apiKey, baseId } = getConfig();
  const url = buildUrl(baseId, table, params);

  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error('Airtable request failed');
    (error as Error & { data?: unknown; status?: number }).data = errorData;
    (error as Error & { data?: unknown; status?: number }).status = response.status;
    throw error;
  }

  return response.json() as Promise<T>;
};

export const airtable = {
  list: async <TFields>(table: string, params?: URLSearchParams) => {
    const data = await request<AirtableResponse<AirtableRecord<TFields>>>(table, undefined, params);
    return data;
  },
  listAll: async <TFields>(table: string, params?: URLSearchParams) => {
    const records: AirtableRecord<TFields>[] = [];
    let offset: string | undefined;
    do {
      const nextParams = new URLSearchParams(params?.toString());
      if (offset) {
        nextParams.set('offset', offset);
      }
      const data = await request<AirtableResponse<AirtableRecord<TFields>>>(table, undefined, nextParams);
      records.push(...data.records);
      offset = data.offset;
    } while (offset);
    return { records };
  },
  patch: async <TFields>(table: string, body: unknown) => {
    const data = await request<AirtableResponse<AirtableRecord<TFields>>>(table, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return data;
  },
  patchRecord: async <TFields>(table: string, recordId: string, body: unknown) => {
    const data = await request<AirtableRecord<TFields>>(`${table}/${recordId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return data;
  },
};
