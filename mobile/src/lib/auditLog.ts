import { supabase } from './supabase';

type AuditAction = 'view' | 'create' | 'update' | 'delete';
type ResourceType =
  | 'profile'
  | 'user_progress'
  | 'standard_mastery'
  | 'quiz_attempts'
  | 'classes'
  | 'class_members'
  | 'assignments'
  | 'assignment_submissions';

interface AuditEntry {
  action: AuditAction;
  resource_type: ResourceType;
  resource_id?: string;
  metadata?: Record<string, unknown>;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  const { data: sessionData } = await supabase.auth.getUser();
  const userId = sessionData.user?.id;
  if (!userId) return;

  await supabase.from('audit_log').insert({
    user_id: userId,
    action: entry.action,
    resource_type: entry.resource_type,
    resource_id: entry.resource_id ?? null,
    metadata: entry.metadata ?? null,
  });
}
