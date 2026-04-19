export type StudyMode = 'leader' | 'co-leader' | 'participant';

/** Who may discover or open this study (server-enforced). */
export type StudyVisibility = 'private' | 'sharable' | 'public';

export interface StudyOwnerSummary {
  id: number;
  username: string;
  name: string;
}

export interface StudyCapabilities {
  mode: StudyMode;
  can_edit_structure: boolean;
  can_manage_tasks: boolean;
  can_reorder_content: boolean;
  can_delete_content: boolean;
  can_answer_questions: boolean;
  can_delete_study: boolean;
}

export interface Study {
  uuid: string;
  title: string;
  goal: string | null;
  visibility: StudyVisibility;
  metadata: Record<string, unknown>;
  capabilities: StudyCapabilities;
  owner?: StudyOwnerSummary;
  created_at?: string;
  updated_at?: string;
  ai_default_reference_bibles?: Record<string, unknown>;
  selected_bible_uuids?: string[];
  total_duration_minutes?: number;
}

export interface StudyAssistantSuggestion {
  id: string;
  type: 'add_verse' | 'add_commentary' | 'add_question' | 'add_task';
  title: string;
  summary: string;
  payload: Record<string, unknown>;
  duration?: number | null;
  /** 0-based index from server — display and bulk-apply in this order */
  order?: number;
}

export interface StudyPlanItem {
  uuid: string;
  title: string;
  item_type: 'verse' | 'commentary' | 'question' | 'task' | 'custom';
  notes: string | null;
  duration?: number | null;
  position: number;
  metadata: Record<string, unknown>;
  /** Current user's progress (present when signed in) */
  my_status?: 'todo' | 'revisit' | 'complete';
}

/** One SSE frame from POST /studies/:uuid/ai/assistant (stream mode). */
export interface StudyAssistantSseMessage {
  event: string;
  data: Record<string, unknown>;
}

export interface StudyVerse {
  uuid: string;
  bible_uuid: string;
  book_uuid: string;
  chapter: number;
  ordinal: number;
  verse_text: string | null;
  note: string | null;
  position: number;
}

export interface StudyCommentary {
  uuid: string;
  source_type: 'manual' | 'ai';
  title: string;
  body: string | null;
  prompt: string | null;
  context: Record<string, unknown>;
  position: number;
}

export interface StudyQuestion {
  uuid: string;
  prompt: string;
  question_type: string;
  guidance_notes: string | null;
  verse_anchor: Record<string, unknown>;
  position: number;
}

export interface StudyTask {
  uuid: string;
  instruction: string;
  task_type: string;
  status: string;
  assignee_label: string | null;
  due_at: string | null;
  context: Record<string, unknown>;
  position: number;
}

export interface StudyAnswer {
  uuid: string;
  response: string;
  author_label: string | null;
  visibility: string;
  study_commentary_uuid: string | null;
  /** Set when reply was created by a signed-in user */
  user_id?: number | null;
  username?: string | null;
}
