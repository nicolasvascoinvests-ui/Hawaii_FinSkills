export type AppRole = 'student' | 'parent' | 'educator' | 'admin';
export type AgeTier = '13_17' | '18_plus';
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: AppRole;
  age_tier: AgeTier | null;
  birth_year: number | null;
  school: string | null;
  grade_level: number | null;
  preferred_language: 'en' | 'haw';
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export type ThemeKey =
  | 'earning_income'
  | 'spending'
  | 'saving'
  | 'investing'
  | 'managing_credit'
  | 'managing_risk';

export interface DoeStandard {
  code: string;
  theme_key: ThemeKey;
  theme_label: string;
  title: string;
  description: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  theme: ThemeKey;
  age_tier: AgeTier | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  cover_image_url: string | null;
  estimated_minutes: number;
  order_index: number;
  standards_covered: string[];
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface LessonSection {
  title: string;
  body: string;
  type: 'text' | 'example' | 'tip';
}

export interface LessonContent {
  sections: LessonSection[];
}

export interface Lesson {
  id: string;
  course_id: string;
  slug: string | null;
  title: string;
  description: string | null;
  lesson_type: 'reading' | 'video' | 'interactive' | 'quiz' | 'simulation';
  content: LessonContent;
  duration_minutes: number;
  order_index: number;
  standards_covered: string[];
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  lesson_id: string;
  question_type: 'multiple_choice' | 'true_false' | 'fill_in' | 'drag_match' | 'matching' | 'numeric';
  question_text: string;
  options: unknown;
  correct_answer: string;
  explanation: string | null;
  standard_code: string;
  difficulty: 'easy' | 'medium' | 'hard';
  order_index: number;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  lesson_id: string;
  score: number;
  total_questions: number;
  total_correct: number;
  answers: unknown;
  per_standard: Record<string, { correct: number; total: number }>;
  time_taken_seconds: number;
  completed_at: string;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: ProgressStatus;
  score: number | null;
  attempts: number;
  time_spent_seconds: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StandardMastery {
  id: string;
  user_id: string;
  standard_code: string;
  mastery_level: number;
  attempts: number;
  correct_count: number;
  total_questions: number;
  last_assessed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClassRecord {
  id: string;
  educator_id: string;
  name: string;
  description: string | null;
  school_name: string | null;
  grade_level: number | null;
  join_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassMember {
  id: string;
  class_id: string;
  user_id: string;
  joined_at: string;
}

export interface Assignment {
  id: string;
  class_id: string;
  course_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  standards_covered: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  user_id: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'graded' | 'returned';
  score: number | null;
  feedback: string | null;
  submitted_at: string | null;
  graded_at: string | null;
  graded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AchievementDefinition {
  code: string;
  title: string;
  description: string;
  icon: string | null;
  category: 'progress' | 'mastery' | 'streak' | 'engagement' | 'milestone';
  points: number;
  age_tier: AgeTier | null;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_code: string;
  earned_at: string;
  metadata: Record<string, unknown> | null;
}

export interface UserStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  total_points: number;
  updated_at: string;
}
