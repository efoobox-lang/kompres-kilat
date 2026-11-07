export interface AIEmployeeRecord {
  id: string;
  record_type: 'task' | 'draft' | 'video_job';
  division_id: string;
  division_name: string;
  prompt: string;
  output: string;
  model: string;
  status: string;
  data: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

const TABLE = 'ai_employee_records';
export type SupabaseTable = typeof TABLE | 'site_analytics_events';

export function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return { url, key };
}

export function isAIEmployeeStoreConfigured() {
  return getSupabaseConfig() !== null;
}

export async function supabaseTableRequest<T>(
  table: SupabaseTable,
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error('Supabase belum dikonfigurasi. Atur SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY.');
  }

  const response = await fetch(`${config.url}/rest/v1/${table}${path}`, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const details = await response.text();
    console.error('Supabase AI Employee storage request failed:', response.status, details.slice(0, 500));
    throw new Error(`Penyimpanan AI Employee gagal (HTTP ${response.status}).`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function supabaseRpcRequest<T>(functionName: string, init: RequestInit = {}) {
  if (!/^[a-z_][a-z0-9_]*$/i.test(functionName)) {
    throw new Error('Nama Supabase RPC tidak valid.');
  }
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error('Supabase belum dikonfigurasi. Atur SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY.');
  }
  const response = await fetch(`${config.url}/rest/v1/rpc/${functionName}`, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    const details = await response.text();
    console.error('Supabase RPC request failed:', response.status, details.slice(0, 500));
    throw new Error(`Supabase RPC gagal (HTTP ${response.status}).`);
  }
  return (await response.json()) as T;
}

export async function aiEmployeeStoreRequest<T>(path: string, init: RequestInit = {}) {
  return supabaseTableRequest<T>(TABLE, path, init);
}
