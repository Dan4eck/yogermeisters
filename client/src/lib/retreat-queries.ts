import { useQuery } from '@tanstack/react-query';

import { fetchJson } from '@/lib/query-client';
import type { Language } from '@/lib/i18n';
import type { RetreatListResponse, RetreatRecord, RetreatView } from '@shared/retreat-content';

interface RetreatDetailResponse {
  readonly language: Language;
  readonly retreat: RetreatRecord;
}

export function useRetreats(view: RetreatView, language: Language) {
  return useQuery({
    queryKey: ['retreats', view, language],
    queryFn: () => fetchJson<RetreatListResponse>(`/api/retreats?view=${view}&language=${language}`),
  });
}

export function useRetreat(slug: string, language: Language) {
  return useQuery({
    queryKey: ['retreat', slug, language],
    queryFn: () => fetchJson<RetreatDetailResponse>(`/api/retreats/${slug}?language=${language}`),
  });
}

