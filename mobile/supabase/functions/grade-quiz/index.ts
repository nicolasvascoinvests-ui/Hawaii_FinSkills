// grade-quiz — server-side quiz grader.
// Prevents tampered clients from self-awarding mastery. Enforces the
// 1-hour retake cooldown. Writes quiz_attempts using the service role,
// so client INSERT on quiz_attempts can be revoked.
//
// Request:  { lessonId: uuid, answers: [{ questionId: uuid, answer: string | object }], timeTakenSeconds?: number }
// Response: { score, total, pct, perStandard, results: [{questionId, correct, correctAnswer}] }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const COOLDOWN_MS = 60 * 60 * 1000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

interface ClientAnswer {
  questionId: string;
  answer: unknown;
}

interface QuizQuestionRow {
  id: string;
  lesson_id: string;
  question_type: string;
  correct_answer: string;
  options: unknown;
  standard_code: string;
}

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function gradeOne(q: QuizQuestionRow, given: unknown): boolean {
  if (given === null || given === undefined) return false;
  if (q.question_type === 'fill_in' || q.question_type === 'numeric') {
    return typeof given === 'string' && normalize(given) === normalize(q.correct_answer);
  }
  if (q.question_type === 'drag_match' || q.question_type === 'matching') {
    if (!Array.isArray(q.options)) return false;
    let provided: Record<string, string> = {};
    if (typeof given === 'string') {
      try {
        provided = JSON.parse(given);
      } catch {
        return false;
      }
    } else if (given && typeof given === 'object') {
      provided = given as Record<string, string>;
    } else {
      return false;
    }
    const items = q.options as Array<{ item: string; match: string }>;
    return items.every((it) => provided[it.item] === it.match);
  }
  return typeof given === 'string' && given === q.correct_answer;
}

// deno-lint-ignore no-explicit-any
(globalThis as any).Deno?.serve?.(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return json({ error: 'missing bearer token' }, 401);
  }

  // deno-lint-ignore no-explicit-any
  const env = (globalThis as any).Deno.env as { get: (k: string) => string | undefined };
  const SUPABASE_URL = env.get('SUPABASE_URL');
  const SERVICE_ROLE = env.get('SUPABASE_SERVICE_ROLE_KEY');
  const ANON_KEY = env.get('SUPABASE_ANON_KEY');
  if (!SUPABASE_URL || !SERVICE_ROLE || !ANON_KEY) {
    return json({ error: 'server misconfigured' }, 500);
  }

  // Identify the caller with their JWT (anon key client + auth header).
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) return json({ error: 'invalid session' }, 401);
  const userId = userData.user.id;

  let body: { lessonId?: string; answers?: ClientAnswer[]; timeTakenSeconds?: number };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid json' }, 400);
  }

  const lessonId = body.lessonId;
  const answers = body.answers;
  const timeTaken = Math.max(0, Math.min(24 * 3600, Number(body.timeTakenSeconds ?? 0) | 0));

  if (!lessonId || !UUID_RE.test(lessonId)) return json({ error: 'invalid lessonId' }, 400);
  if (!Array.isArray(answers) || answers.length === 0 || answers.length > 100) {
    return json({ error: 'invalid answers' }, 400);
  }
  for (const a of answers) {
    if (!a || typeof a !== 'object' || !UUID_RE.test(String(a.questionId ?? ''))) {
      return json({ error: 'invalid answer entry' }, 400);
    }
  }

  // Service-role client bypasses RLS — used for cooldown check + insert.
  const svc = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1) Enforce 1-hour cooldown server-side.
  const { data: last } = await svc
    .from('quiz_attempts')
    .select('completed_at')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (last?.completed_at) {
    const elapsed = Date.now() - new Date(last.completed_at).getTime();
    const remaining = COOLDOWN_MS - elapsed;
    if (remaining > 0) {
      return json({ error: 'cooldown_active', retryInMs: remaining }, 429);
    }
  }

  // 2) Load authoritative questions for this lesson.
  const { data: questions, error: qErr } = await svc
    .from('quiz_questions')
    .select('id, lesson_id, question_type, correct_answer, options, standard_code')
    .eq('lesson_id', lessonId);
  if (qErr) return json({ error: 'failed to load questions' }, 500);
  if (!questions || questions.length === 0) return json({ error: 'no questions for lesson' }, 404);

  const byId = new Map<string, QuizQuestionRow>();
  for (const q of questions as QuizQuestionRow[]) byId.set(q.id, q);

  // 3) Grade. Ignore answers for questions that don't belong to this lesson.
  type Result = { questionId: string; correct: boolean; correctAnswer: string };
  const results: Result[] = [];
  const perStandard: Record<string, { correct: number; total: number }> = {};
  const seen = new Set<string>();

  for (const a of answers) {
    const q = byId.get(a.questionId);
    if (!q || seen.has(q.id)) continue;
    seen.add(q.id);
    const correct = gradeOne(q, a.answer);
    results.push({ questionId: q.id, correct, correctAnswer: q.correct_answer });
    const bucket = perStandard[q.standard_code] ?? { correct: 0, total: 0 };
    bucket.total += 1;
    if (correct) bucket.correct += 1;
    perStandard[q.standard_code] = bucket;
  }

  if (results.length === 0) return json({ error: 'no valid answers for lesson' }, 400);

  const totalCorrect = results.filter((r) => r.correct).length;
  const total = results.length;
  const pct = Math.round((totalCorrect / total) * 100);

  // 4) Persist. RLS blocks client INSERT; service role succeeds.
  const { error: insErr } = await svc.from('quiz_attempts').insert({
    user_id: userId,
    lesson_id: lessonId,
    score: totalCorrect,
    total_questions: total,
    total_correct: totalCorrect,
    answers: results.map((r) => ({ questionId: r.questionId, correct: r.correct })),
    per_standard: perStandard,
    time_taken_seconds: timeTaken,
  });
  if (insErr) return json({ error: 'failed to record attempt' }, 500);

  return json({ score: totalCorrect, total, pct, perStandard, results });
});
