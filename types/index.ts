export type Category = 'cotidianas' | 'trabajo' | 'social' | 'salud';

export type NotificationStyle = 'gentle' | 'minimal' | 'off';

export type RecurrenceType = 'daily' | 'weekly' | 'monthly';

export interface RecurrencePattern {
  type: RecurrenceType;
  days?: number[]; // 0=Sun, 1=Mon, ... 6=Sat
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: Category;
  priority: number; // 1-5
  estimated_minutes: number | null;
  scheduled_date: string | null; // YYYY-MM-DD
  scheduled_time: string | null; // HH:MM
  is_recurring: boolean;
  recurrence_pattern: RecurrencePattern | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface TaskStep {
  id: string;
  task_id: string;
  step_number: number;
  title: string;
  description: string | null;
  estimated_minutes: number | null;
  completed: boolean;
  completed_at: string | null;
}

export interface PriorResource {
  id: string;
  task_id: string;
  description: string;
  reminder_date: string; // YYYY-MM-DD
}

export interface MoodEntry {
  id: string;
  user_id: string;
  mood_level: number; // 1-5
  energy_level: number; // 1-5
  notes: string | null;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  calm_mode: boolean;
  overwhelm_mode: boolean;
  break_interval_minutes: number;
  notification_style: NotificationStyle;
  wake_time: string; // HH:MM
  sleep_time: string; // HH:MM
}

// Para crear/editar tareas
export interface TaskInput {
  title: string;
  description?: string;
  category: Category;
  priority?: number;
  estimated_minutes?: number;
  scheduled_date?: string;
  scheduled_time?: string;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
}

export interface TaskStepInput {
  title: string;
  description?: string;
  estimated_minutes?: number;
}

// Smart Plan
export interface PlannedBlock {
  task: Task;
  steps: TaskStep[];
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isBreak: boolean;
}
