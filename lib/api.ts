import { neon } from '@neondatabase/serverless';
import {
  Task,
  TaskStep,
  TaskInput,
  TaskStepInput,
  MoodEntry,
  UserPreferences,
  PriorResource,
} from '@/types';

const DATABASE_URL =
  'postgresql://neondb_owner:npg_RL9da0BTpiws@ep-jolly-glade-akvjb297-pooler.c-3.us-west-2.aws.neon.tech/neondb?sslmode=require';

const sql = neon(DATABASE_URL);

// =================== TASKS ===================

export async function getTasks(userId: string, date?: string): Promise<Task[]> {
  if (date) {
    const rows = await sql`
      SELECT * FROM tasks
      WHERE user_id = ${userId} AND scheduled_date = ${date}
      ORDER BY scheduled_time ASC NULLS LAST, priority DESC, created_at ASC
    `;
    return rows as Task[];
  }
  const rows = await sql`
    SELECT * FROM tasks
    WHERE user_id = ${userId} AND completed = false
    ORDER BY scheduled_date ASC NULLS LAST, priority DESC
  `;
  return rows as Task[];
}

export async function getTasksByCategory(
  userId: string,
  category: string
): Promise<Task[]> {
  const rows = await sql`
    SELECT * FROM tasks
    WHERE user_id = ${userId} AND category = ${category}
    ORDER BY completed ASC, scheduled_date ASC NULLS LAST, priority DESC
  `;
  return rows as Task[];
}

export async function getTask(taskId: string): Promise<Task | null> {
  const rows = await sql`SELECT * FROM tasks WHERE id = ${taskId}`;
  return (rows[0] as Task) ?? null;
}

export async function createTask(
  userId: string,
  input: TaskInput
): Promise<Task> {
  const rows = await sql`
    INSERT INTO tasks (user_id, title, description, category, priority, estimated_minutes, scheduled_date, scheduled_time, is_recurring, recurrence_pattern)
    VALUES (${userId}, ${input.title}, ${input.description ?? null}, ${input.category}, ${input.priority ?? 3}, ${input.estimated_minutes ?? null}, ${input.scheduled_date ?? null}, ${input.scheduled_time ?? null}, ${input.is_recurring ?? false}, ${input.recurrence_pattern ? JSON.stringify(input.recurrence_pattern) : null})
    RETURNING *
  `;
  return rows[0] as Task;
}

export async function updateTask(
  taskId: string,
  input: Partial<TaskInput>
): Promise<Task> {
  const rows = await sql`
    UPDATE tasks SET
      title = COALESCE(${input.title ?? null}, title),
      description = COALESCE(${input.description ?? null}, description),
      category = COALESCE(${input.category ?? null}, category),
      priority = COALESCE(${input.priority ?? null}, priority),
      estimated_minutes = COALESCE(${input.estimated_minutes ?? null}, estimated_minutes),
      scheduled_date = COALESCE(${input.scheduled_date ?? null}, scheduled_date),
      scheduled_time = COALESCE(${input.scheduled_time ?? null}, scheduled_time)
    WHERE id = ${taskId}
    RETURNING *
  `;
  return rows[0] as Task;
}

export async function toggleTask(taskId: string): Promise<Task> {
  const rows = await sql`
    UPDATE tasks SET
      completed = NOT completed,
      completed_at = CASE WHEN completed THEN NULL ELSE now() END
    WHERE id = ${taskId}
    RETURNING *
  `;
  return rows[0] as Task;
}

export async function deleteTask(taskId: string): Promise<void> {
  await sql`DELETE FROM tasks WHERE id = ${taskId}`;
}

// =================== TASK STEPS ===================

export async function getTaskSteps(taskId: string): Promise<TaskStep[]> {
  const rows = await sql`
    SELECT * FROM task_steps WHERE task_id = ${taskId} ORDER BY step_number ASC
  `;
  return rows as TaskStep[];
}

export async function addTaskStep(
  taskId: string,
  input: TaskStepInput,
  stepNumber: number
): Promise<TaskStep> {
  const rows = await sql`
    INSERT INTO task_steps (task_id, step_number, title, description, estimated_minutes)
    VALUES (${taskId}, ${stepNumber}, ${input.title}, ${input.description ?? null}, ${input.estimated_minutes ?? null})
    RETURNING *
  `;
  return rows[0] as TaskStep;
}

export async function toggleStep(stepId: string): Promise<TaskStep> {
  const rows = await sql`
    UPDATE task_steps SET
      completed = NOT completed,
      completed_at = CASE WHEN completed THEN NULL ELSE now() END
    WHERE id = ${stepId}
    RETURNING *
  `;
  return rows[0] as TaskStep;
}

export async function deleteStep(stepId: string): Promise<void> {
  await sql`DELETE FROM task_steps WHERE id = ${stepId}`;
}

// =================== MOOD ===================

export async function addMoodEntry(
  userId: string,
  moodLevel: number,
  energyLevel: number,
  notes?: string
): Promise<MoodEntry> {
  const rows = await sql`
    INSERT INTO mood_entries (user_id, mood_level, energy_level, notes)
    VALUES (${userId}, ${moodLevel}, ${energyLevel}, ${notes ?? null})
    RETURNING *
  `;
  return rows[0] as MoodEntry;
}

export async function getTodayMood(
  userId: string
): Promise<MoodEntry | null> {
  const rows = await sql`
    SELECT * FROM mood_entries
    WHERE user_id = ${userId} AND created_at::date = CURRENT_DATE
    ORDER BY created_at DESC LIMIT 1
  `;
  return (rows[0] as MoodEntry) ?? null;
}

export async function getMoodHistory(
  userId: string,
  days: number = 7
): Promise<MoodEntry[]> {
  const rows = await sql`
    SELECT * FROM mood_entries
    WHERE user_id = ${userId} AND created_at > now() - ${days + ' days'}::interval
    ORDER BY created_at DESC
  `;
  return rows as MoodEntry[];
}

// =================== PREFERENCES ===================

export async function getPreferences(
  userId: string
): Promise<UserPreferences | null> {
  const rows = await sql`
    SELECT * FROM user_preferences WHERE user_id = ${userId}
  `;
  return (rows[0] as UserPreferences) ?? null;
}

export async function upsertPreferences(
  userId: string,
  prefs: Partial<Omit<UserPreferences, 'id' | 'user_id'>>
): Promise<UserPreferences> {
  const rows = await sql`
    INSERT INTO user_preferences (user_id, calm_mode, overwhelm_mode, break_interval_minutes, notification_style, wake_time, sleep_time)
    VALUES (
      ${userId},
      ${prefs.calm_mode ?? false},
      ${prefs.overwhelm_mode ?? false},
      ${prefs.break_interval_minutes ?? 25},
      ${prefs.notification_style ?? 'gentle'},
      ${prefs.wake_time ?? '08:00'},
      ${prefs.sleep_time ?? '23:00'}
    )
    ON CONFLICT (user_id) DO UPDATE SET
      calm_mode = COALESCE(${prefs.calm_mode ?? null}, user_preferences.calm_mode),
      overwhelm_mode = COALESCE(${prefs.overwhelm_mode ?? null}, user_preferences.overwhelm_mode),
      break_interval_minutes = COALESCE(${prefs.break_interval_minutes ?? null}, user_preferences.break_interval_minutes),
      notification_style = COALESCE(${prefs.notification_style ?? null}, user_preferences.notification_style),
      wake_time = COALESCE(${prefs.wake_time ?? null}, user_preferences.wake_time),
      sleep_time = COALESCE(${prefs.sleep_time ?? null}, user_preferences.sleep_time)
    RETURNING *
  `;
  return rows[0] as UserPreferences;
}

// =================== PRIOR RESOURCES ===================

export async function getPriorResources(
  taskId: string
): Promise<PriorResource[]> {
  const rows = await sql`
    SELECT * FROM prior_resources WHERE task_id = ${taskId} ORDER BY reminder_date ASC
  `;
  return rows as PriorResource[];
}

export async function getTomorrowReminders(
  userId: string
): Promise<(PriorResource & { task_title: string })[]> {
  const rows = await sql`
    SELECT pr.*, t.title as task_title
    FROM prior_resources pr
    JOIN tasks t ON t.id = pr.task_id
    WHERE t.user_id = ${userId} AND pr.reminder_date = CURRENT_DATE + 1
  `;
  return rows as (PriorResource & { task_title: string })[];
}

export async function addPriorResource(
  taskId: string,
  description: string,
  reminderDate: string
): Promise<PriorResource> {
  const rows = await sql`
    INSERT INTO prior_resources (task_id, description, reminder_date)
    VALUES (${taskId}, ${description}, ${reminderDate})
    RETURNING *
  `;
  return rows[0] as PriorResource;
}
