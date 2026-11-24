import type {
  BroadcastStatus,
  CmsBroadcastDeliveryItem,
  CmsBroadcastInput,
  CmsBroadcastRecord,
  CmsCourseClientWithProgress,
  CmsCourseSummary,
  CmsMediaAsset,
  CmsOverview,
  CmsScenarioInput,
  CmsScenarioRecord,
  CmsSubscriberDetail,
  CmsSubscriberSummary,
  CmsTeamUser,
} from '@shared/cms';

import { apiRequest } from './cabinet-api';

export async function fetchCmsOverview(): Promise<CmsOverview> {
  const data = await apiRequest<{ overview: CmsOverview }>('/api/admin/cms/overview');
  return data.overview;
}

export async function fetchBotSubscribers(params?: {
  readonly search?: string;
  readonly status?: string;
  readonly funnelKey?: string;
  readonly source?: string;
  readonly language?: string;
}): Promise<readonly CmsSubscriberSummary[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.status) query.set('status', params.status);
  if (params?.funnelKey) query.set('funnelKey', params.funnelKey);
  if (params?.source) query.set('source', params.source);
  if (params?.language) query.set('language', params.language);
  const qs = query.toString();
  const data = await apiRequest<{ subscribers: readonly CmsSubscriberSummary[] }>(
    `/api/admin/bot/subscribers${qs ? `?${qs}` : ''}`,
  );
  return data.subscribers;
}

export async function fetchBotSubscriberDetail(id: string): Promise<CmsSubscriberDetail> {
  const data = await apiRequest<{ subscriber: CmsSubscriberDetail }>(`/api/admin/bot/subscribers/${id}`);
  return data.subscriber;
}

export async function enrollSubscriberInScenario(subscriberId: string, scenarioId: string): Promise<void> {
  await apiRequest<void>(`/api/admin/bot/subscribers/${subscriberId}/enroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenarioId }),
  });
}

export async function uploadBotMediaFile(file: File): Promise<CmsMediaAsset> {
  const dataBase64 = await readFileAsDataUrl(file);
  const data = await apiRequest<{ asset: CmsMediaAsset }>('/api/admin/bot/media', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      mimeType: file.type,
      dataBase64,
    }),
  });
  return data.asset;
}

export async function fetchBroadcasts(): Promise<readonly CmsBroadcastRecord[]> {
  const data = await apiRequest<{ broadcasts: readonly CmsBroadcastRecord[] }>('/api/admin/bot/broadcasts');
  return data.broadcasts;
}

export async function createBroadcast(input: CmsBroadcastInput): Promise<CmsBroadcastRecord> {
  const data = await apiRequest<{ broadcast: CmsBroadcastRecord }>('/api/admin/bot/broadcasts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return data.broadcast;
}

export async function updateBroadcast(id: string, input: CmsBroadcastInput): Promise<CmsBroadcastRecord> {
  const data = await apiRequest<{ broadcast: CmsBroadcastRecord }>(`/api/admin/bot/broadcasts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return data.broadcast;
}

export async function deleteOrCancelBroadcast(id: string): Promise<'deleted' | 'cancelled'> {
  const data = await apiRequest<{ result: 'deleted' | 'cancelled' }>(`/api/admin/bot/broadcasts/${id}`, {
    method: 'DELETE',
  });
  return data.result;
}

export async function sendTestBroadcast(id: string, subscriberIds: readonly string[]): Promise<{ queued: number }> {
  return apiRequest<{ queued: number }>(`/api/admin/bot/broadcasts/${id}/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscriberIds }),
  });
}

export async function launchBroadcast(
  id: string,
  scheduledAt: string | null,
): Promise<{ queued: number; status: BroadcastStatus }> {
  return apiRequest<{ queued: number; status: BroadcastStatus }>(`/api/admin/bot/broadcasts/${id}/launch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scheduledAt }),
  });
}

export async function fetchBroadcastDeliveries(id: string): Promise<readonly CmsBroadcastDeliveryItem[]> {
  const data = await apiRequest<{ deliveries: readonly CmsBroadcastDeliveryItem[] }>(
    `/api/admin/bot/broadcasts/${id}/deliveries`,
  );
  return data.deliveries;
}

export async function fetchScenarios(): Promise<readonly CmsScenarioRecord[]> {
  const data = await apiRequest<{ scenarios: readonly CmsScenarioRecord[] }>('/api/admin/bot/scenarios');
  return data.scenarios;
}

export async function createScenario(input: CmsScenarioInput): Promise<CmsScenarioRecord> {
  const data = await apiRequest<{ scenario: CmsScenarioRecord }>('/api/admin/bot/scenarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return data.scenario;
}

export async function updateScenario(id: string, input: CmsScenarioInput): Promise<CmsScenarioRecord> {
  const data = await apiRequest<{ scenario: CmsScenarioRecord }>(`/api/admin/bot/scenarios/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return data.scenario;
}

export async function deleteScenario(id: string): Promise<void> {
  await apiRequest<void>(`/api/admin/bot/scenarios/${id}`, { method: 'DELETE' });
}

export async function fetchAdminCourses(): Promise<readonly CmsCourseSummary[]> {
  const data = await apiRequest<{ courses: readonly CmsCourseSummary[] }>('/api/admin/courses');
  return data.courses;
}

export async function fetchCourseClientsWithProgress(slug: string): Promise<readonly CmsCourseClientWithProgress[]> {
  const data = await apiRequest<{ clients: readonly CmsCourseClientWithProgress[] }>(
    `/api/admin/courses/${slug}/clients-progress`,
  );
  return data.clients;
}

export async function grantCourseAccess(slug: string, email: string): Promise<void> {
  await apiRequest<void>(`/api/admin/courses/${slug}/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export async function revokeCourseAccess(slug: string, userId: string): Promise<void> {
  await apiRequest<void>(`/api/admin/courses/${slug}/clients/${userId}`, {
    method: 'DELETE',
  });
}

export async function fetchTeamUsers(): Promise<readonly CmsTeamUser[]> {
  const data = await apiRequest<{ users: readonly CmsTeamUser[] }>('/api/admin/users');
  return data.users;
}

export async function updateUserRole(userId: string, role: 'student' | 'admin'): Promise<void> {
  await apiRequest<void>(`/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
