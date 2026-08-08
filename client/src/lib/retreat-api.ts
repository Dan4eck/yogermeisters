import type { RetreatLanguage, RetreatListResponse, RetreatRecord, RetreatView } from '@shared/retreat-content';

interface RetreatResponse {
  readonly retreat: RetreatRecord;
}

export async function fetchRetreats(
  language: RetreatLanguage,
  view: RetreatView,
  signal?: AbortSignal,
): Promise<RetreatListResponse> {
  return requestJson<RetreatListResponse>(
    `/api/retreats?language=${encodeURIComponent(language)}&view=${encodeURIComponent(view)}`,
    signal,
  );
}

export async function fetchRetreat(
  slug: string,
  language: RetreatLanguage,
  signal?: AbortSignal,
): Promise<RetreatRecord> {
  const response = await requestJson<RetreatResponse>(
    `/api/retreats/${encodeURIComponent(slug)}?language=${encodeURIComponent(language)}`,
    signal,
  );
  return response.retreat;
}

async function requestJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error(`Retreat API request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}
