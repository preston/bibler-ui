// Author: Preston Lee

import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { STUDY_DETAIL_API } from './study-detail-api.token';
import { Observable, Subscription, concatMap, EMPTY, filter, finalize, from, map, merge, of, switchMap, tap } from 'rxjs';
import { BibleService } from '../services/bible.service';
import { BookService } from '../services/book.service';
import { VerseService } from '../services/verse.service';
import { StudiesService } from '../services/studies.service';
import { ToastService } from '../services/toast.service';
import { SessionService } from '../services/session.service';
import { StudiesUiStateService } from '../services/studies-ui-state.service';
import { Bible } from '../models/bible';
import { Book } from '../models/book';
import { Verse } from '../models/verse';
import {
  Study,
  StudyAnswer,
  StudyAiAvailableModel,
  StudyPlanItem,
  StudyAssistantSuggestion,
  StudyVerse,
  StudyCommentary,
  StudyQuestion,
  StudyMode,
  StudyTask,
  StudyVisibility
} from '../models/study';

@Component({
  selector: 'app-study-detail',
  templateUrl: 'study-detail.html',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, RouterOutlet, RouterLink, RouterLinkActive],
  providers: [{ provide: STUDY_DETAIL_API, useExisting: StudyDetailComponent }]
})
export class StudyDetailComponent implements OnInit, OnDestroy {
  private readonly studiesUiState = inject(StudiesUiStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  readonly session = inject(SessionService);

  /** Same signal as {@link StudiesUiStateService.studyMode} — survives route-driven remounts. */
  readonly studyMode = this.studiesUiState.studyMode;

  study = signal<Study | null>(null);
  studyUuidInput = signal('');
  editTitle = signal('');
  editGoal = signal('');
  editVisibility = signal<StudyVisibility>('private');
  /** Brief hint after copy-to-clipboard */
  copyFeedback = signal('');
  private copyFeedbackTimer: ReturnType<typeof setTimeout> | undefined;

  bibles = signal<Bible[]>([]);
  books = signal<Book[]>([]);
  chapters = signal<number[]>([]);
  verses = signal<Verse[]>([]);

  selectedBibleUuid = signal<string>('');
  selectedBookUuid = signal<string>('');
  selectedChapter = signal<number>(1);

  studyVerses = signal<StudyVerse[]>([]);
  commentaries = signal<StudyCommentary[]>([]);
  questions = signal<StudyQuestion[]>([]);
  tasks = signal<StudyTask[]>([]);
  planItems = signal<StudyPlanItem[]>([]);
  /** True while batch-updating plan item statuses (Mark All). */
  markingAllPlanProgress = signal(false);
  selectedPlanItemUuid = signal<string>('');
  answersByQuestion = signal<Record<string, StudyAnswer[]>>({});
  studyVerseNoteDrafts = signal<Record<string, string>>({});
  commentaryDrafts = signal<Record<string, { title: string; body: string; prompt: string }>>({});
  questionDrafts = signal<Record<string, { prompt: string; question_type: string; guidance_notes: string }>>({});
  taskDrafts = signal<Record<string, { instruction: string; task_type: string; assignee_label: string }>>({});
  planItemDrafts = signal<Record<string, { title: string; notes: string; duration: string }>>({});

  commentaryTitle = signal('');
  commentaryBody = signal('');
  commentaryPrompt = signal('');
  aiCommand = signal('');
  aiOutput = signal('');

  questionPrompt = signal('');
  questionType = signal('discussion');
  questionGuidance = signal('');

  taskInstruction = signal('');
  taskType = signal('discussion');
  taskAssignee = signal('');

  answerDrafts = signal<Record<string, string>>({});
  error = signal('');
  loading = signal(false);

  aiSystemPromptDraft = signal('');
  assistantMessage = signal('');
  assistantModel = signal('');
  availableAssistantModels = signal<StudyAiAvailableModel[]>([]);
  defaultAssistantModel = signal('');
  assistantModelsLoading = signal(false);
  assistantModelsError = signal('');
  showAdvancedModelPicker = signal(false);
  assistantSuggestions = signal<StudyAssistantSuggestion[]>([]);
  dismissedSuggestionIds = signal<Set<string>>(new Set());
  assistantLoading = signal(false);
  assistantError = signal('');
  /** Short status line while the streaming assistant runs */
  assistantActivityPhase = signal('');
  /** Human-readable search summary after plan / DB search */
  assistantSearchSummary = signal('');
  /** Truncated live model output during streaming rounds (not scripture; activity only) */
  assistantStreamPreview = signal('');
  selectedReferenceBibleUuids = signal<string[]>([]);
  showReferenceBibleSelector = signal(false);
  selectedStudyBibleUuids = signal<string[]>([]);
  studyBibleFilter = signal('');
  showStudyBibleDropdown = signal(false);
  /** When true, show the custom-instructions textarea (for users replacing default rules). */
  showCustomAiPromptEditor = signal(false);

  private assistantRunSub: Subscription | undefined;
  private openStudyRequestSeq = 0;
  private workspaceLoadSeq = 0;

  visibleAssistantSuggestions = computed(() => {
    const dismissed = this.dismissedSuggestionIds();
    return this.assistantSuggestions().filter((s) => !dismissed.has(s.id));
  });

  selectedPlanItem = computed(() => this.planItems().find((x) => x.uuid === this.selectedPlanItemUuid()) ?? null);
  readonly totalEstimatedMinutes = computed(() =>
    this.planItems().reduce((sum, item) => sum + (this.itemDisplayDuration(item) ?? 0), 0)
  );
  readonly remainingEstimatedMinutes = computed(() =>
    this.planItems().reduce((sum, item) => {
      if ((item.my_status ?? 'todo') === 'complete') return sum;
      return sum + (this.itemDisplayDuration(item) ?? 0);
    }, 0)
  );

  /** URL snapshot for workspace context (AI helper blurbs). */
  private readonly studyWorkspaceUrl = toSignal(
    merge(of(null), this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))).pipe(
      map(() => this.router.url.split('?')[0])
    ),
    { initialValue: this.router.url.split('?')[0] }
  );

  /**
   * What the main panel is focused on for Study AI copy: study-level, a workspace browse route, or a step route.
   * Replaces the old selectedPlanItem + detailPaneMode heuristic.
   */
  readonly planWorkspaceContextKind = computed((): 'study' | StudyPlanItem['item_type'] => {
    const st = this.study();
    if (!st) return 'study';
    const tree = this.router.parseUrl(this.studyWorkspaceUrl());
    const primary = tree.root.children['primary'];
    if (!primary) return 'study';
    const segments = primary.segments.map((s) => s.path);
    if (segments[0] !== 'studies' || segments[1] !== st.uuid) return 'study';
    const rest = segments.slice(2);
    if (rest.length === 0) return 'study';
    if (rest[0] === 'ai' || rest[0] === 'details') return 'study';
    if (rest[0] === 'workspace' && rest[1]) return rest[1] as StudyPlanItem['item_type'];
    if (rest[0] === 'step' && rest[2]) return rest[2] as StudyPlanItem['item_type'];
    return 'study';
  });
  filteredStudyBibles = computed(() => {
    const q = this.studyBibleFilter().trim().toLowerCase();
    if (!q) return this.bibles();
    return this.bibles().filter((b) =>
      b.name.toLowerCase().includes(q) ||
      b.uuid.toLowerCase().includes(q) ||
      (b.language ?? '').toLowerCase().includes(q) ||
      (b.abbreviation ?? '').toLowerCase().includes(q)
    );
  });
  scopedBibles = computed(() => {
    const uuids = new Set(this.selectedStudyBibleUuids());
    if (uuids.size === 0) return this.bibles();
    return this.bibles().filter((b) => uuids.has(b.uuid));
  });
  selectedStudyBiblePills = computed(() => {
    const selected = new Set(this.selectedStudyBibleUuids());
    return this.bibles().filter((b) => selected.has(b.uuid));
  });

  /** Details route / edit UI is for leaders and co-leaders only. */
  readonly showStudyDetailsEdit = computed(() => {
    const m = this.studyMode();
    return m === 'leader' || m === 'co-leader';
  });

  constructor(
    private studiesService: StudiesService,
    private bibleService: BibleService,
    private bookService: BookService,
    private verseService: VerseService
  ) {}

  private syncRouteSub?: Subscription;

  ngOnDestroy(): void {
    this.cancelAssistantRun();
    this.syncRouteSub?.unsubscribe();
    if (this.copyFeedbackTimer) clearTimeout(this.copyFeedbackTimer);
  }

  ngOnInit(): void {
    this.bibleService.index().subscribe((bibles) => {
      this.bibles.set(bibles);
      if (bibles.length > 0) {
        this.selectedBibleUuid.set(bibles[0].uuid);
        this.loadBooks();
      }
    });

    this.route.paramMap.subscribe((params) => {
      const uuid = params.get('uuid');
      if (uuid) {
        this.studyUuidInput.set(uuid);
        this.openStudy(uuid);
      }
    });

    this.syncRouteSub = merge(
      of(null),
      this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
    ).subscribe(() => this.syncSelectionFromUrl());
  }

  /**
   * Keeps sidebar highlight in sync with `step/:planItemUuid/:kind` and clears it for `workspace/*` and the default child.
   */
  private syncSelectionFromUrl(): void {
    const st = this.study();
    if (!st) return;
    const tree = this.router.parseUrl(this.router.url.split('?')[0]);
    const primary = tree.root.children['primary'];
    if (!primary) return;
    const segments = primary.segments.map((s) => s.path);
    if (segments[0] !== 'studies' || segments[1] !== st.uuid) return;
    const rest = segments.slice(2);
    if (rest[0] === 'step' && rest[1] && rest[2]) {
      const uuid = rest[1];
      const kind = rest[2];
      const items = this.planItems();
      if (items.length === 0) return;
      const item = items.find((p) => p.uuid === uuid);
      if (!item) {
        this.toast.danger('Plan step not found.');
        void this.router.navigate(['/studies', st.uuid], { replaceUrl: true });
        return;
      }
      if (item.item_type !== kind) {
        void this.router.navigate(['/studies', st.uuid, 'step', uuid, item.item_type], { replaceUrl: true });
        return;
      }
      this.selectedPlanItemUuid.set(uuid);
      return;
    }
    if (rest[0] === 'workspace' || rest.length === 0) {
      this.selectedPlanItemUuid.set('');
    }
  }

  changeStudyMode(mode: StudyMode): void {
    this.studyMode.set(mode);
    const currentStudy = this.study();
    if (currentStudy) {
      this.openStudy(currentStudy.uuid);
    }
  }

  openStudy(studyUuid?: string): void {
    const requestSeq = ++this.openStudyRequestSeq;
    const uuid = (studyUuid ?? this.studyUuidInput()).trim();
    if (!uuid) return;
    this.loading.set(true);
    this.studiesService.show(uuid, this.studyMode()).subscribe({
      next: (response) => {
        if (requestSeq !== this.openStudyRequestSeq) return;
        this.loading.set(false);
        this.study.set(response.study);
        this.studyUuidInput.set(response.study.uuid);
        const meta = response.study.metadata;
        const ap = meta && typeof meta['ai_system_prompt'] === 'string' ? meta['ai_system_prompt'] : '';
        this.aiSystemPromptDraft.set(ap);
        this.selectedReferenceBibleUuids.set(this.defaultReferenceBibleUuids(response.study));
        this.selectedStudyBibleUuids.set(
          response.study.selected_bible_uuids?.length ? response.study.selected_bible_uuids : this.defaultReferenceBibleUuids(response.study)
        );
        this.editTitle.set(response.study.title ?? '');
        this.editGoal.set(response.study.goal ?? '');
        this.editVisibility.set(response.study.visibility ?? 'private');
        const customized = !!response.study.ai_system_prompt_customized;
        this.showCustomAiPromptEditor.set(customized);
        this.loadAssistantModels();
        const mode = this.studyMode();
        const tree = this.router.parseUrl(this.router.url);
        const primary = tree.root.children['primary'];
        const segments = primary?.segments.map((s) => s.path) ?? [];
        const studyPathOnly =
          segments.length === 2 && segments[0] === 'studies' && segments[1] === response.study.uuid;
        if (studyPathOnly) {
          if (mode === 'leader' || mode === 'co-leader') {
            void this.router.navigate(['/studies', response.study.uuid, 'ai'], { replaceUrl: true });
          } else {
            void this.router.navigate(['/studies', response.study.uuid], { replaceUrl: true });
          }
        }
        this.loadStudyWorkspace(response.study.uuid, {
          selectFirstPlanOnOpenForParticipant: mode === 'participant'
        });
      },
      error: () => {
        if (requestSeq !== this.openStudyRequestSeq) return;
        this.loading.set(false);
        this.error.set('Study could not be opened.');
      }
    });
  }

  saveStudyDetails(): void {
    const st = this.study();
    if (!st) return;
    this.loading.set(true);
    this.studiesService.update(
      st.uuid,
      {
        title: this.editTitle().trim(),
        goal: this.editGoal().trim(),
        visibility: this.editVisibility()
      },
      this.studyMode()
    ).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.study.set(response.study);
        this.editTitle.set(response.study.title ?? '');
        this.editGoal.set(response.study.goal ?? '');
        this.editVisibility.set(response.study.visibility ?? 'private');
        this.toast.success('Saved.');
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Could not save study details.');
        this.toast.danger('Could not save study details.');
      }
    });
  }

  loadStudyWorkspace(
    studyUuid: string,
    options?: {
      selectFirstPlanOnOpenForParticipant?: boolean;
      thenNavigate?: { uuid: string; kind: StudyPlanItem['item_type'] };
    }
  ): void {
    const loadSeq = ++this.workspaceLoadSeq;
    const rm = this.studyMode();
    this.loadStudyVersesWorkspace(studyUuid, rm, loadSeq);
    this.loadCommentariesWorkspace(studyUuid, rm, loadSeq);
    this.loadQuestionsWorkspace(studyUuid, rm, loadSeq);
    this.loadTasksWorkspace(studyUuid, rm, loadSeq);
    this.studiesService.planItems(studyUuid, rm).subscribe((response) => {
      if (loadSeq !== this.workspaceLoadSeq) return;
      this.planItems.set(response.plan_items);
      const currentSelection = this.selectedPlanItemUuid();
      const selectionStillExists = response.plan_items.some((x) => x.uuid === currentSelection);
      if (
        options?.selectFirstPlanOnOpenForParticipant &&
        this.studyMode() === 'participant' &&
        response.plan_items.length > 0
      ) {
        const first = response.plan_items[0];
        this.selectedPlanItemUuid.set(first.uuid);
        void this.router.navigate(['/studies', studyUuid, 'step', first.uuid, first.item_type], { replaceUrl: true });
      } else if (selectionStillExists) {
        this.selectedPlanItemUuid.set(currentSelection);
      } else {
        this.selectedPlanItemUuid.set(response.plan_items[0]?.uuid ?? '');
      }
      const drafts: Record<string, { title: string; notes: string; duration: string }> = {};
      for (const p of response.plan_items) {
        drafts[p.uuid] = { title: p.title ?? '', notes: p.notes ?? '', duration: this.durationInputValue(p.duration) };
      }
      this.planItemDrafts.set(drafts);
      if (options?.thenNavigate) {
        const { uuid, kind } = options.thenNavigate;
        void this.router.navigate(['/studies', studyUuid, 'step', uuid, kind]).then(() => this.syncSelectionFromUrl());
      } else {
        this.syncSelectionFromUrl();
      }
    });
  }

  private loadStudyVersesWorkspace(studyUuid: string, mode: StudyMode, loadSeq: number): void {
    this.studiesService.studyVerses(studyUuid, mode).subscribe((response) => {
      if (loadSeq !== this.workspaceLoadSeq) return;
      this.studyVerses.set(response.verses);
      const drafts: Record<string, string> = {};
      for (const sv of response.verses) drafts[sv.uuid] = sv.note ?? '';
      this.studyVerseNoteDrafts.set(drafts);
    });
  }

  private loadCommentariesWorkspace(studyUuid: string, mode: StudyMode, loadSeq: number): void {
    this.studiesService.commentaries(studyUuid, mode).subscribe((response) => {
      if (loadSeq !== this.workspaceLoadSeq) return;
      this.commentaries.set(response.commentaries);
      const drafts: Record<string, { title: string; body: string; prompt: string }> = {};
      for (const c of response.commentaries) {
        drafts[c.uuid] = { title: c.title ?? '', body: c.body ?? '', prompt: c.prompt ?? '' };
      }
      this.commentaryDrafts.set(drafts);
    });
  }

  private loadQuestionsWorkspace(studyUuid: string, mode: StudyMode, loadSeq: number): void {
    this.studiesService.questions(studyUuid, mode).subscribe((response) => {
      if (loadSeq !== this.workspaceLoadSeq) return;
      this.questions.set(response.questions);
      const drafts: Record<string, { prompt: string; question_type: string; guidance_notes: string }> = {};
      for (const q of response.questions) {
        drafts[q.uuid] = { prompt: q.prompt ?? '', question_type: q.question_type ?? 'discussion', guidance_notes: q.guidance_notes ?? '' };
      }
      this.questionDrafts.set(drafts);
      response.questions.forEach((question) => this.loadAnswers(question.uuid, loadSeq));
    });
  }

  private loadTasksWorkspace(studyUuid: string, mode: StudyMode, loadSeq: number): void {
    this.studiesService.tasks(studyUuid, mode).subscribe((response) => {
      if (loadSeq !== this.workspaceLoadSeq) return;
      this.tasks.set(response.tasks);
      const drafts: Record<string, { instruction: string; task_type: string; assignee_label: string }> = {};
      for (const t of response.tasks) {
        drafts[t.uuid] = { instruction: t.instruction ?? '', task_type: t.task_type ?? 'discussion', assignee_label: t.assignee_label ?? '' };
      }
      this.taskDrafts.set(drafts);
    });
  }

  loadBooks(): void {
    const available = this.scopedBibles();
    if (available.length === 0) return;
    if (!available.some((b) => b.uuid === this.selectedBibleUuid())) {
      this.selectedBibleUuid.set(available[0].uuid);
    }
    const bible = available.find((b) => b.uuid === this.selectedBibleUuid());
    if (!bible) return;
    this.bookService.index(bible).subscribe((books) => {
      this.books.set(books);
      if (books.length > 0) {
        this.selectedBookUuid.set(books[0].uuid);
        this.loadChapters();
      }
    });
  }

  loadChapters(): void {
    const bible = this.bibles().find((b) => b.uuid === this.selectedBibleUuid());
    const book = this.books().find((b) => b.uuid === this.selectedBookUuid());
    if (!bible || !book) return;
    this.bookService.chaptersFor(bible, book).subscribe((chapters) => {
      this.chapters.set(chapters);
      if (chapters.length > 0) {
        this.selectedChapter.set(chapters[0]);
        this.loadVerses();
      }
    });
  }

  loadVerses(): void {
    const bible = this.bibles().find((b) => b.uuid === this.selectedBibleUuid());
    const book = this.books().find((b) => b.uuid === this.selectedBookUuid());
    if (!bible || !book) return;
    this.verseService.index(bible, book, this.selectedChapter()).subscribe((verses) => this.verses.set(verses));
  }

  addStudyVerseFromReader(verse: Verse): void {
    const currentStudy = this.study();
    if (!currentStudy) return;
    this.studiesService
      .createStudyVerse(
        currentStudy.uuid,
        {
          bible_uuid: this.selectedBibleUuid(),
          book_uuid: this.selectedBookUuid(),
          chapter: this.selectedChapter(),
          ordinal: verse.ordinal,
          verse_text: verse.text,
          note: ''
        },
        this.studyMode()
      )
      .subscribe({
        next: () => {
          this.toast.success('Saved.');
          this.loadStudyWorkspace(currentStudy.uuid);
        },
        error: (err: unknown) => this.toastHttpError(err, 'Could not save verse.')
      });
  }

  createManualCommentary(): void {
    const currentStudy = this.study();
    if (!currentStudy) return;
    this.studiesService.createCommentary(currentStudy.uuid, {
      source_type: 'manual',
      title: this.commentaryTitle().trim(),
      body: this.commentaryBody().trim(),
      prompt: this.commentaryPrompt().trim(),
      context: {}
    }, this.studyMode()).subscribe({
      next: () => {
        this.commentaryTitle.set('');
        this.commentaryBody.set('');
        this.commentaryPrompt.set('');
        this.toast.success('Saved.');
        this.loadStudyWorkspace(currentStudy.uuid);
      },
      error: (err: unknown) => this.toastHttpError(err, 'Could not create commentary.')
    });
  }

  generateAiCommentary(): void {
    const currentStudy = this.study();
    if (!currentStudy) return;
    this.studiesService.aiGenerateCommentary(
      currentStudy.uuid,
      this.aiCommand().trim(),
      this.commentaryPrompt().trim(),
      this.studyMode()
    ).subscribe((response) => {
      this.aiOutput.set(response.output ?? response.error ?? '');
      if (response.output) {
        this.studiesService.createCommentary(currentStudy.uuid, {
          source_type: 'ai',
          title: 'AI Generated Commentary',
          body: response.output,
          prompt: this.aiCommand().trim(),
          context: {}
        }, this.studyMode()).subscribe({
          next: () => {
            this.toast.success('Saved.');
            this.loadStudyWorkspace(currentStudy.uuid);
          },
          error: (err: unknown) => this.toastHttpError(err, 'Could not create commentary.')
        });
      }
    });
  }

  createQuestion(): void {
    const currentStudy = this.study();
    if (!currentStudy) return;
    this.studiesService.createQuestion(currentStudy.uuid, {
      prompt: this.questionPrompt().trim(),
      question_type: this.questionType(),
      guidance_notes: this.questionGuidance().trim()
    }, this.studyMode()).subscribe({
      next: () => {
        this.questionPrompt.set('');
        this.questionGuidance.set('');
        this.toast.success('Saved.');
        this.loadStudyWorkspace(currentStudy.uuid);
      },
      error: (err: unknown) => this.toastHttpError(err, 'Could not create question.')
    });
  }

  createTask(): void {
    const currentStudy = this.study();
    if (!currentStudy) return;
    this.studiesService.createTask(currentStudy.uuid, {
      instruction: this.taskInstruction().trim(),
      task_type: this.taskType(),
      status: 'open',
      assignee_label: this.taskAssignee().trim()
    }, this.studyMode()).subscribe({
      next: () => {
        this.taskInstruction.set('');
        this.taskAssignee.set('');
        this.toast.success('Saved.');
        this.loadStudyWorkspace(currentStudy.uuid);
      },
      error: (err: unknown) => this.toastHttpError(err, 'Could not create task.')
    });
  }

  updateTaskStatus(task: StudyTask, status: string): void {
    const currentStudy = this.study();
    if (!currentStudy) return;
    this.studiesService.updateTask(currentStudy.uuid, task.uuid, { status }, this.studyMode()).subscribe({
      next: () => {
        this.toast.success('Saved.');
        this.loadStudyWorkspace(currentStudy.uuid);
      },
      error: (err: unknown) => this.toastHttpError(err, 'Could not update task.')
    });
  }

  moveQuestion(question: StudyQuestion, direction: number): void {
    const currentStudy = this.study();
    if (!currentStudy) return;
    const current = [...this.questions()];
    const index = current.findIndex((item) => item.uuid === question.uuid);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= current.length) return;
    const temp = current[index];
    current[index] = current[targetIndex];
    current[targetIndex] = temp;
    this.studiesService.reorderQuestions(currentStudy.uuid, current.map((q) => q.uuid), this.studyMode()).subscribe({
      next: (response) => {
        this.questions.set(response.questions);
        this.toast.success('Saved.');
      },
      error: (err: unknown) => this.toastHttpError(err, 'Could not reorder questions.')
    });
  }

  moveTask(task: StudyTask, direction: number): void {
    const currentStudy = this.study();
    if (!currentStudy) return;
    const current = [...this.tasks()];
    const index = current.findIndex((item) => item.uuid === task.uuid);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= current.length) return;
    const temp = current[index];
    current[index] = current[targetIndex];
    current[targetIndex] = temp;
    this.studiesService.reorderTasks(currentStudy.uuid, current.map((t) => t.uuid), this.studyMode()).subscribe({
      next: (response) => {
        this.tasks.set(response.tasks);
        this.toast.success('Saved.');
      },
      error: (err: unknown) => this.toastHttpError(err, 'Could not reorder tasks.')
    });
  }

  loadAnswers(questionUuid: string, loadSeq?: number): void {
    const currentStudy = this.study();
    if (!currentStudy) return;
    this.studiesService.answers(currentStudy.uuid, questionUuid, this.studyMode()).subscribe((response) => {
      if (loadSeq !== undefined && loadSeq !== this.workspaceLoadSeq) return;
      this.answersByQuestion.update((current) => ({
        ...current,
        [questionUuid]: response.answers
      }));
    });
  }

  setAnswerDraft(questionUuid: string, value: string): void {
    this.answerDrafts.update((drafts) => ({ ...drafts, [questionUuid]: value }));
  }

  submitAnswer(questionUuid: string): void {
    const currentStudy = this.study();
    if (!currentStudy) return;
    const draft = (this.answerDrafts()[questionUuid] ?? '').trim();
    if (!draft) return;
    this.studiesService.createAnswer(currentStudy.uuid, questionUuid, {
      response: draft,
      visibility: 'study'
    }, this.studyMode()).subscribe({
      next: () => {
        this.setAnswerDraft(questionUuid, '');
        this.toast.success('Saved.');
        this.loadAnswers(questionUuid);
      },
      error: (err: unknown) => this.toastHttpError(err, 'Could not save answer.')
    });
  }

  createPlanItem(): void {
    const st = this.study();
    if (!st) return;
    this.studiesService.createPlanItem(st.uuid, {
      title: 'New plan step',
      item_type: 'custom',
      notes: '',
      duration: this.defaultDurationForItemType('custom'),
      metadata: {}
    }, this.studyMode()).subscribe({
      next: (r) => {
        this.toast.success('Saved.');
        this.loadStudyWorkspace(st.uuid, {
          thenNavigate: { uuid: r.plan_item.uuid, kind: r.plan_item.item_type }
        });
      },
      error: (err: unknown) => this.toastHttpError(err, 'Could not create plan step.')
    });
  }

  createPlanItemOfType(itemType: StudyPlanItem['item_type']): void {
    const st = this.study();
    if (!st) return;
    const titles: Record<StudyPlanItem['item_type'], string> = {
      custom: 'Custom step',
      commentary: 'Commentary step',
      verse: 'Verse step',
      question: 'Discussion step',
      task: 'Task step'
    };
    this.studiesService.createPlanItem(st.uuid, {
      title: titles[itemType],
      item_type: itemType,
      notes: '',
      duration: this.defaultDurationForItemType(itemType),
      metadata: {}
    }, this.studyMode()).subscribe({
      next: (r) => {
        this.toast.success('Saved.');
        this.loadStudyWorkspace(st.uuid, {
          thenNavigate: { uuid: r.plan_item.uuid, kind: r.plan_item.item_type }
        });
      },
      error: (err: unknown) => this.toastHttpError(err, 'Could not create plan step.')
    });
  }

  movePlanItem(item: StudyPlanItem, direction: number): void {
    const st = this.study();
    if (!st) return;
    const current = [...this.planItems()];
    const i = current.findIndex((x) => x.uuid === item.uuid);
    const j = i + direction;
    if (i < 0 || j < 0 || j >= current.length) return;
    const temp = current[i];
    current[i] = current[j];
    current[j] = temp;
    this.studiesService.reorderPlanItems(st.uuid, current.map((x) => x.uuid), this.studyMode()).subscribe({
      next: (r) => {
        this.planItems.set(r.plan_items);
        this.toast.success('Saved.');
      },
      error: (err: unknown) => this.toastHttpError(err, 'Could not reorder plan steps.')
    });
  }

  onPlanDrop(event: CdkDragDrop<StudyPlanItem[]>): void {
    if (!this.canReorderContent() || event.previousIndex === event.currentIndex) return;
    const st = this.study();
    if (!st) return;
    const items = [...this.planItems()];
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    this.studiesService.reorderPlanItems(st.uuid, items.map((x) => x.uuid), this.studyMode()).subscribe({
      next: (r) => {
        this.planItems.set(r.plan_items);
        this.toast.success('Saved.');
      },
      error: () => {
        this.error.set('Could not reorder plan steps.');
        this.toast.danger('Could not reorder plan steps.');
      }
    });
  }

  setStudyVerseNoteDraft(verseUuid: string, value: string): void {
    this.studyVerseNoteDrafts.update((d) => ({ ...d, [verseUuid]: value }));
  }

  saveStudyVerseNote(sv: StudyVerse): void {
    const st = this.study();
    if (!st) return;
    this.studiesService.updateStudyVerse(st.uuid, sv.uuid, { note: this.studyVerseNoteDrafts()[sv.uuid] ?? '' }, this.studyMode()).subscribe({
      next: () => {
        this.toast.success('Saved.');
        this.loadStudyWorkspace(st.uuid);
      },
      error: () => {
        this.error.set('Could not save verse note.');
        this.toast.danger('Could not save verse note.');
      }
    });
  }

  setCommentaryDraft(commentaryUuid: string, field: 'title' | 'body' | 'prompt', value: string): void {
    this.commentaryDrafts.update((d) => ({ ...d, [commentaryUuid]: { ...(d[commentaryUuid] ?? { title: '', body: '', prompt: '' }), [field]: value } }));
  }

  saveCommentary(commentary: StudyCommentary): void {
    const st = this.study();
    if (!st) return;
    const d = this.commentaryDrafts()[commentary.uuid];
    if (!d) return;
    this.studiesService.updateCommentary(st.uuid, commentary.uuid, { title: d.title.trim(), body: d.body.trim(), prompt: d.prompt.trim() }, this.studyMode()).subscribe({
      next: () => {
        this.toast.success('Saved.');
        this.loadStudyWorkspace(st.uuid);
      },
      error: () => {
        this.error.set('Could not save commentary.');
        this.toast.danger('Could not save commentary.');
      }
    });
  }

  setQuestionDraft(questionUuid: string, field: 'prompt' | 'question_type' | 'guidance_notes', value: string): void {
    this.questionDrafts.update((d) => ({ ...d, [questionUuid]: { ...(d[questionUuid] ?? { prompt: '', question_type: 'discussion', guidance_notes: '' }), [field]: value } }));
  }

  saveQuestion(question: StudyQuestion): void {
    const st = this.study();
    if (!st) return;
    const d = this.questionDrafts()[question.uuid];
    if (!d) return;
    this.studiesService.updateQuestion(st.uuid, question.uuid, {
      prompt: d.prompt.trim(),
      question_type: d.question_type,
      guidance_notes: d.guidance_notes.trim()
    }, this.studyMode()).subscribe({
      next: () => {
        this.toast.success('Saved.');
        this.loadStudyWorkspace(st.uuid);
      },
      error: () => {
        this.error.set('Could not save question.');
        this.toast.danger('Could not save question.');
      }
    });
  }

  setTaskDraft(taskUuid: string, field: 'instruction' | 'task_type' | 'assignee_label', value: string): void {
    this.taskDrafts.update((d) => ({ ...d, [taskUuid]: { ...(d[taskUuid] ?? { instruction: '', task_type: 'discussion', assignee_label: '' }), [field]: value } }));
  }

  saveTask(task: StudyTask): void {
    const st = this.study();
    if (!st) return;
    const d = this.taskDrafts()[task.uuid];
    if (!d) return;
    this.studiesService.updateTask(st.uuid, task.uuid, {
      instruction: d.instruction.trim(),
      task_type: d.task_type,
      assignee_label: d.assignee_label.trim()
    }, this.studyMode()).subscribe({
      next: () => {
        this.toast.success('Saved.');
        this.loadStudyWorkspace(st.uuid);
      },
      error: () => {
        this.error.set('Could not save task.');
        this.toast.danger('Could not save task.');
      }
    });
  }

  setPlanItemDraft(planItemUuid: string, field: 'title' | 'notes', value: string): void {
    this.planItemDrafts.update((d) => ({
      ...d,
      [planItemUuid]: {
        ...(d[planItemUuid] ?? { title: '', notes: '', duration: '' }),
        [field]: value
      }
    }));
  }

  setPlanItemDurationDraft(planItemUuid: string, value: string): void {
    this.planItemDrafts.update((d) => ({
      ...d,
      [planItemUuid]: {
        ...(d[planItemUuid] ?? { title: '', notes: '', duration: '' }),
        duration: value
      }
    }));
  }

  savePlanItem(item: StudyPlanItem): void {
    const st = this.study();
    if (!st) return;
    const d = this.planItemDrafts()[item.uuid];
    if (!d) return;
    this.studiesService.updatePlanItem(st.uuid, item.uuid, {
      title: d.title.trim(),
      notes: d.notes.trim(),
      duration: this.durationPayloadFromInput(d.duration)
    }, this.studyMode()).subscribe({
      next: () => {
        this.toast.success('Saved.');
        this.loadStudyWorkspace(st.uuid);
      },
      error: () => {
        this.error.set('Could not save plan item.');
        this.toast.danger('Could not save plan item.');
      }
    });
  }

  openPlanItem(item: StudyPlanItem): void {
    const st = this.study();
    if (!st) return;
    void this.router.navigate(['/studies', st.uuid, 'step', item.uuid, item.item_type]);
  }

  toggleStudyBible(uuid: string, checked: boolean): void {
    const set = new Set(this.selectedStudyBibleUuids());
    if (checked) set.add(uuid);
    else set.delete(uuid);
    const next = Array.from(set);
    this.selectedStudyBibleUuids.set(next);
    this.selectedReferenceBibleUuids.set(next);
    this.loadBooks();
    // Keep filtering usable for all roles, but only persist for roles
    // that can edit study structure.
    if (this.canEditStructure()) {
      this.saveStudyBibleSelection();
    }
  }

  removeStudyBible(uuid: string): void {
    this.toggleStudyBible(uuid, false);
  }

  openStudyBibleDropdown(): void {
    this.showStudyBibleDropdown.set(true);
  }

  closeStudyBibleDropdown(): void {
    this.showStudyBibleDropdown.set(false);
  }

  saveStudyBibleSelection(): void {
    const st = this.study();
    if (!st) return;
    this.studiesService.update(st.uuid, {
      metadata: { selected_bible_uuids: this.selectedStudyBibleUuids() }
    }, this.studyMode()).subscribe({
      next: (r) => {
        this.study.set(r.study);
        this.toast.success('Saved.');
      },
      error: () => {
        this.error.set('Could not save selected study Bibles.');
        this.toast.danger('Could not save selected study Bibles.');
      }
    });
  }

  closeStudy(): void {
    this.study.set(null);
    this.planItems.set([]);
    this.selectedPlanItemUuid.set('');
    void this.router.navigate(['/studies'], { replaceUrl: true });
  }

  canDeleteStudy(): boolean {
    return this.study()?.capabilities.can_delete_study ?? false;
  }

  deleteEntireStudy(): void {
    const st = this.study();
    if (!st || !this.canDeleteStudy()) return;
    if (!confirm('Delete this study and all of its content? This cannot be undone.')) return;
    this.loading.set(true);
    this.studiesService.destroy(st.uuid, this.studyMode()).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Study deleted.');
        this.closeStudy();
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Could not delete study.');
        this.toast.danger('Could not delete study.');
      }
    });
  }

  private defaultReferenceBibleUuids(study: Study): string[] {
    const refs = (study.ai_default_reference_bibles ?? {}) as Record<string, unknown>;
    const values = Object.values(refs).filter((v): v is Record<string, unknown> => !!v && typeof v === 'object');
    const uuids = values.map((v) => String(v['uuid'] ?? '')).filter((s) => !!s);
    return [...new Set(uuids)];
  }

  toggleReferenceBible(uuid: string, checked: boolean): void {
    const set = new Set(this.selectedReferenceBibleUuids());
    if (checked) set.add(uuid);
    else set.delete(uuid);
    this.selectedReferenceBibleUuids.set(Array.from(set));
  }

  canEditStructure(): boolean {
    return this.study()?.capabilities.can_edit_structure ?? false;
  }

  canManageTasks(): boolean {
    return this.study()?.capabilities.can_manage_tasks ?? false;
  }

  canReorderContent(): boolean {
    return this.study()?.capabilities.can_reorder_content ?? false;
  }

  revealCustomAiInstructions(): void {
    this.showCustomAiPromptEditor.set(true);
  }

  saveAiSystemPrompt(): void {
    const st = this.study();
    if (!st) return;
    this.loading.set(true);
    this.studiesService.update(st.uuid, { metadata: { ai_system_prompt: this.aiSystemPromptDraft() } }, this.studyMode()).subscribe({
      next: (r) => {
        this.loading.set(false);
        this.study.set(r.study);
        this.showCustomAiPromptEditor.set(!!r.study.ai_system_prompt_customized);
        this.toast.success('Saved.');
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Could not save AI system prompt.');
        this.toast.danger('Could not save AI system prompt.');
      }
    });
  }

  resetAiSystemPrompt(): void {
    this.aiSystemPromptDraft.set('');
    const st = this.study();
    if (!st) return;
    this.loading.set(true);
    this.studiesService.update(st.uuid, { metadata: { ai_system_prompt: '' } }, this.studyMode()).subscribe({
      next: (r) => {
        this.loading.set(false);
        this.study.set(r.study);
        this.showCustomAiPromptEditor.set(false);
        this.toast.success('Saved.');
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Could not reset AI system prompt.');
        this.toast.danger('Could not reset AI system prompt.');
      }
    });
  }

  /**
   * Stop streaming assistant work (e.g. when leaving the AI tab). Avoids leaving `assistantLoading` stuck true.
   */
  cancelAssistantRun(): void {
    this.assistantRunSub?.unsubscribe();
    this.assistantRunSub = undefined;
    this.assistantLoading.set(false);
  }

  runStudyAssistant(): void {
    const st = this.study();
    if (!st) {
      this.toast.danger('Study is not loaded. Open the study again from the list.');
      return;
    }
    const msg = this.assistantMessage().trim();
    if (!msg) {
      this.assistantError.set('Enter a message for the assistant above, then click Get suggestions.');
      return;
    }
    this.assistantLoading.set(true);
    this.assistantError.set('');
    this.dismissedSuggestionIds.set(new Set());
    this.assistantActivityPhase.set('Starting…');
    this.assistantSearchSummary.set('');
    this.assistantStreamPreview.set('');

    const model = this.resolvedAssistantModelForRequest();
    const referenceBibleUuids = this.selectedReferenceBibleUuids();
    this.assistantRunSub?.unsubscribe();
    this.assistantRunSub = this.studiesService
      .runStudyAssistantStream(st.uuid, msg, this.studyMode(), model || undefined, referenceBibleUuids)
      .subscribe({
        next: (ev) => this.onAssistantSse(ev),
        error: (err: Error) => {
          this.assistantLoading.set(false);
          this.assistantError.set(err?.message ?? 'Assistant request failed.');
          this.assistantSuggestions.set([]);
        },
        complete: () => {
          this.assistantLoading.set(false);
        }
      });
  }

  toggleAdvancedModelPicker(): void {
    this.showAdvancedModelPicker.set(!this.showAdvancedModelPicker());
  }

  assistantModelOptionLabel(model: StudyAiAvailableModel): string {
    const name = model.label?.trim() || model.id;
    const extras = [model.summary?.trim(), model.context_window ? `${model.context_window.toLocaleString()} ctx` : '', model.size_label?.trim()]
      .filter((x): x is string => !!x);
    return extras.length > 0 ? `${name} - ${extras.join(' | ')}` : name;
  }

  private loadAssistantModels(): void {
    this.assistantModelsLoading.set(true);
    this.assistantModelsError.set('');
    this.availableAssistantModels.set([]);
    this.defaultAssistantModel.set('');
    this.studiesService.availableAssistantModels().subscribe({
      next: (response) => {
        const models = this.normalizeAssistantModelsPayload(response);
        const ids = new Set(models.map((m) => m.id.trim()));
        const preferred =
          this.readStringField(response, 'default_model')?.trim() ||
          models.find((m) => m.default)?.id?.trim() ||
          models[0]?.id?.trim() ||
          '';
        this.availableAssistantModels.set(models);
        this.defaultAssistantModel.set(preferred);
        if (!ids.has(this.assistantModel().trim())) {
          this.assistantModel.set(preferred);
        }
        this.assistantModelsLoading.set(false);
      },
      error: () => {
        this.assistantModelsLoading.set(false);
        this.assistantModelsError.set('Using server default model.');
        this.availableAssistantModels.set([]);
        this.defaultAssistantModel.set('');
        this.assistantModel.set('');
      }
    });
  }

  /**
   * Server returns Ollama `/api/tags` JSON (`name` per model) or our planned `{ models: [{ id }] }` shape.
   */
  private normalizeAssistantModelsPayload(raw: unknown): StudyAiAvailableModel[] {
    if (!raw || typeof raw !== 'object') return [];
    const envelope = raw as Record<string, unknown>;
    const list = envelope['models'];
    if (!Array.isArray(list)) return [];
    const out: StudyAiAvailableModel[] = [];
    for (const item of list) {
      if (!item || typeof item !== 'object') continue;
      const m = item as Record<string, unknown>;
      const id = String(m['id'] ?? m['name'] ?? m['model'] ?? '').trim();
      if (!id) continue;
      const details =
        m['details'] && typeof m['details'] === 'object' ? (m['details'] as Record<string, unknown>) : {};
      const paramSize = details['parameter_size'] != null ? String(details['parameter_size']) : '';
      const family = details['family'] != null ? String(details['family']) : '';
      const quant = details['quantization_level'] != null ? String(details['quantization_level']) : '';
      const summaryParts = [
        family && paramSize ? `${family} · ${paramSize}` : paramSize || family || undefined,
        quant || undefined
      ].filter((x): x is string => !!x);
      const summary = summaryParts.length > 0 ? summaryParts.join(' · ') : undefined;
      const sizeRaw = m['size'];
      const size_label =
        typeof sizeRaw === 'number' && sizeRaw > 0 ? this.formatModelDiskSize(sizeRaw) : undefined;
      out.push({
        id,
        label: typeof m['label'] === 'string' && m['label'].trim() ? String(m['label']).trim() : id,
        summary,
        size_label,
        default: m['default'] === true
      });
    }
    return out;
  }

  private readStringField(obj: unknown, key: string): string | undefined {
    if (!obj || typeof obj !== 'object') return undefined;
    const v = (obj as Record<string, unknown>)[key];
    return typeof v === 'string' ? v : undefined;
  }

  private formatModelDiskSize(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) return '';
    if (bytes < 1024) return `${Math.round(bytes)} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  }

  private resolvedAssistantModelForRequest(): string | undefined {
    const selected = this.assistantModel().trim();
    const available = this.availableAssistantModels();
    if (available.length === 0) return undefined;
    return available.some((m) => m.id.trim() === selected) ? selected : undefined;
  }

  private onAssistantSse(ev: { event: string; data: Record<string, unknown> }): void {
    switch (ev.event) {
      case 'started':
        this.assistantActivityPhase.set('Working with the assistant…');
        break;
      case 'status': {
        const phase = ev.data['phase'] as string | undefined;
        const message = (ev.data['message'] as string) || '';
        if (message) {
          this.assistantActivityPhase.set(message);
        } else if (phase === 'planning') {
          this.assistantActivityPhase.set('Planning searches…');
        } else if (phase === 'searching') {
          this.assistantActivityPhase.set('Searching your Bibles…');
        } else if (phase === 'drafting') {
          this.assistantActivityPhase.set('Drafting suggestions…');
        }
        break;
      }
      case 'plan': {
        const searches = ev.data['searches'] as Array<{ query_preview?: string; bible_name?: string }> | undefined;
        const n = searches?.length ?? 0;
        this.assistantSearchSummary.set(
          n === 0 ? 'No search phrases in the plan yet.' : `Ready to run ${n} search${n === 1 ? '' : 'es'}.`
        );
        break;
      }
      case 'search_results': {
        const vc = Number(ev.data['verse_count'] ?? 0);
        const byBible = ev.data['by_bible'] as Array<{ bible_uuid?: string; bible_name?: string | null; count?: number }> | undefined;
        const parts =
          byBible?.map((b) => `${b.bible_name || b.bible_uuid || 'Bible'}: ${b.count ?? 0}`) ?? [];
        const errList = ev.data['errors'] as string[] | undefined;
        const errSuffix = errList?.length ? ` (${errList.join('; ')})` : '';
        this.assistantSearchSummary.set(
          `Found ${vc} verse${vc === 1 ? '' : 's'} in the library` +
            (parts.length ? ` — ${parts.join(', ')}` : '') +
            errSuffix
        );
        this.assistantStreamPreview.set('');
        break;
      }
      case 'llm_delta': {
        const round = ev.data['round'] as string;
        const content = (ev.data['content'] as string) ?? '';
        const label = round === 'b' ? 'Drafting suggestions' : 'Planning search terms';
        const snippet = content.length > 1500 ? '…' + content.slice(-1500) : content;
        this.assistantStreamPreview.set(`${label} (live output, not verified text):\n${snippet}`);
        break;
      }
      case 'complete': {
        const raw = ev.data['suggestions'];
        this.assistantSuggestions.set(this.normalizeAssistantSuggestions(raw));
        this.assistantStreamPreview.set('');
        this.assistantActivityPhase.set('Suggestions ready.');
        break;
      }
      case 'error': {
        const errMsg = (ev.data['error'] as string) || 'Assistant failed.';
        const hint = ev.data['hint'] as string | undefined;
        this.assistantError.set(hint ? `${errMsg} (${hint})` : errMsg);
        this.assistantSuggestions.set([]);
        this.assistantLoading.set(false);
        break;
      }
      default:
        break;
    }
  }

  private normalizeAssistantSuggestions(raw: unknown): StudyAssistantSuggestion[] {
    if (!Array.isArray(raw)) return [];
    const mapped = raw.map((item, index) => {
      const o = item as Record<string, unknown>;
      const ordRaw = o['order'];
      const order =
        typeof ordRaw === 'number' && !Number.isNaN(ordRaw)
          ? ordRaw
          : typeof ordRaw === 'string' && ordRaw.trim() !== ''
            ? Number(ordRaw)
            : index;
      return {
        id: String(o['id'] ?? ''),
        type: o['type'] as StudyAssistantSuggestion['type'],
        title: String(o['title'] ?? ''),
        summary: String(o['summary'] ?? ''),
        payload: (o['payload'] as Record<string, unknown>) ?? {},
        duration: this.normalizeDuration(o['duration'] ?? (o['payload'] as Record<string, unknown> | undefined)?.['duration']),
        order: Number.isFinite(order) ? order : index
      };
    });
    return mapped.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  dismissSuggestion(id: string): void {
    this.dismissedSuggestionIds.update((set) => new Set(set).add(id));
  }

  /** Dismiss every currently visible suggestion without applying. */
  rejectAllAssistantSuggestions(): void {
    const ids = this.visibleAssistantSuggestions().map((s) => s.id);
    if (ids.length === 0) return;
    this.dismissedSuggestionIds.update((set) => new Set([...set, ...ids]));
  }

  /**
   * Apply visible suggestions in server order (sequential HTTP). Stops on first error.
   * One workspace reload at the end; one success toast.
   */
  acceptAllAssistantSuggestions(): void {
    const st = this.study();
    if (!st) return;
    const ordered = [...this.visibleAssistantSuggestions()].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    if (ordered.length === 0) return;
    from(ordered)
      .pipe(concatMap((s) => this.applySuggestionPipeline(s)))
      .subscribe({
        next: () => {},
        complete: () => {
          this.loadStudyWorkspace(st.uuid);
          this.toast.success('Applied all suggestions.');
        },
        error: () => {
          this.error.set('Could not apply all suggestions.');
          this.toast.danger('Stopped: could not apply a suggestion.');
        }
      });
  }

  /** Create suggested content then plan step; dismiss id on success. */
  private applySuggestionPipeline(s: StudyAssistantSuggestion): Observable<void> {
    const st = this.study();
    if (!st) return EMPTY;
    const p = s.payload;
    const rm = this.studyMode();
    let create$: Observable<unknown>;
    switch (s.type) {
      case 'add_verse':
        create$ = this.studiesService.createStudyVerse(
          st.uuid,
          {
            bible_uuid: String(p['bible_uuid'] ?? ''),
            book_uuid: String(p['book_uuid'] ?? ''),
            chapter: Number(p['chapter'] ?? 0),
            ordinal: Number(p['ordinal'] ?? 0),
            verse_text: p['verse_text'] != null ? String(p['verse_text']) : null,
            note: p['note'] != null ? String(p['note']) : ''
          },
          rm
        );
        break;
      case 'add_commentary':
        create$ = this.studiesService.createCommentary(
          st.uuid,
          {
            source_type: p['source_type'] === 'ai' ? 'ai' : 'manual',
            title: String(p['title'] ?? 'Suggestion'),
            body: p['body'] != null ? String(p['body']) : null,
            prompt: p['prompt'] != null ? String(p['prompt']) : null,
            context: {}
          },
          rm
        );
        break;
      case 'add_question':
        create$ = this.studiesService.createQuestion(
          st.uuid,
          {
            prompt: String(p['prompt'] ?? ''),
            question_type: String(p['question_type'] ?? 'discussion'),
            guidance_notes: p['guidance_notes'] != null ? String(p['guidance_notes']) : ''
          },
          rm
        );
        break;
      case 'add_task':
        create$ = this.studiesService.createTask(
          st.uuid,
          {
            instruction: String(p['instruction'] ?? ''),
            task_type: String(p['task_type'] ?? 'discussion'),
            status: String(p['status'] ?? 'open'),
            assignee_label: p['assignee_label'] != null ? String(p['assignee_label']) : null
          },
          rm
        );
        break;
      default:
        return EMPTY;
    }
    return create$.pipe(
      switchMap(() => this.createPlanItemFromSuggestion$(st.uuid, s)),
      tap(() => this.dismissSuggestion(s.id)),
      map(() => void 0)
    );
  }

  applySuggestion(s: StudyAssistantSuggestion): void {
    const st = this.study();
    if (!st) return;
    const onErr = (): void => {
      this.error.set('Could not apply suggestion.');
      this.toast.danger('Could not apply suggestion.');
    };
    this.applySuggestionPipeline(s).subscribe({
      next: () => {
        this.toast.success('Saved.');
        this.loadStudyWorkspace(st.uuid);
      },
      error: onErr
    });
  }

  private createPlanItemFromSuggestion$(studyUuid: string, s: StudyAssistantSuggestion) {
    const typeMap: Record<StudyAssistantSuggestion['type'], StudyPlanItem['item_type']> = {
      add_verse: 'verse',
      add_commentary: 'commentary',
      add_question: 'question',
      add_task: 'task'
    };
    return this.studiesService.createPlanItem(
      studyUuid,
      {
        title: s.title || 'Study step',
        item_type: typeMap[s.type] || 'custom',
        notes: s.summary,
        duration: this.normalizeDuration(s.duration) ?? this.defaultDurationForItemType(typeMap[s.type] || 'custom'),
        metadata: { suggestion_id: s.id }
      },
      this.studyMode()
    );
  }

  itemDisplayDuration(item: StudyPlanItem): number | null {
    const minutes = this.normalizeDuration(item.duration);
    if (minutes === null || minutes <= 0) return null;
    return minutes;
  }

  formatMinutes(minutes: number | null | undefined): string {
    if (!minutes || minutes <= 0) return '';
    return `${minutes}m`;
  }

  /** Return URL for login redirect back to this study view */
  returnUrlForLogin(): string {
    return this.router.url;
  }

  private static readonly PLAN_PROGRESS_ORDER: Array<'todo' | 'revisit' | 'complete'> = ['todo', 'complete', 'revisit'];

  planProgressIcon(item: StudyPlanItem): string {
    const s = item.my_status ?? 'todo';
    if (s === 'revisit') return 'bi bi-arrow-repeat';
    if (s === 'complete') return 'bi bi-check-circle-fill';
    return 'bi bi-circle';
  }

  planProgressTitle(item: StudyPlanItem): string {
    const s = item.my_status ?? 'todo';
    if (s === 'todo') return 'To do — click to mark complete';
    if (s === 'complete') return 'Complete — click to mark revisit';
    return 'Revisit — click to mark to do';
  }

  cyclePlanItemProgress(item: StudyPlanItem, ev: Event): void {
    ev.stopPropagation();
    ev.preventDefault();
    const st = this.study();
    if (!st || !this.session.isLoggedIn()) return;
    const cur = item.my_status ?? 'todo';
    const idx = StudyDetailComponent.PLAN_PROGRESS_ORDER.indexOf(cur);
    const next = StudyDetailComponent.PLAN_PROGRESS_ORDER[(idx + 1) % StudyDetailComponent.PLAN_PROGRESS_ORDER.length];
    this.studiesService.updatePlanItemState(st.uuid, item.uuid, next, this.studyMode()).subscribe({
      next: (r) => {
        const ms = r.plan_item.my_status;
        this.planItems.update((items) =>
          items.map((i) => (i.uuid === item.uuid ? { ...i, my_status: ms ?? next } : i))
        );
      },
      error: () => this.toast.danger('Could not update progress.')
    });
  }

  /** Batch-set every plan item's status for the current user (sequential HTTP). */
  markAllPlanItemsStatus(status: 'todo' | 'complete' | 'revisit', ev?: Event): void {
    ev?.preventDefault();
    ev?.stopPropagation();
    const st = this.study();
    if (!st || !this.session.isLoggedIn() || this.markingAllPlanProgress()) return;
    const items = this.planItems().filter((i) => (i.my_status ?? 'todo') !== status);
    if (items.length === 0) {
      this.toast.success('Every step already has that status.');
      return;
    }
    const label =
      status === 'todo' ? 'To do' : status === 'complete' ? 'Complete' : 'Revisit';
    this.markingAllPlanProgress.set(true);
    from(items)
      .pipe(
        concatMap((item) =>
          this.studiesService.updatePlanItemState(st.uuid, item.uuid, status, this.studyMode()).pipe(
            tap((r) => {
              const ms = r.plan_item.my_status;
              this.planItems.update((list) =>
                list.map((x) => (x.uuid === item.uuid ? { ...x, my_status: ms ?? status } : x))
              );
            })
          )
        ),
        finalize(() => this.markingAllPlanProgress.set(false))
      )
      .subscribe({
        complete: () => this.toast.success(`Marked all steps as ${label}.`),
        error: () => this.toast.danger('Could not update all steps.')
      });
  }

  copyId(text: string, label: string): void {
    if (!text) return;
    void navigator.clipboard.writeText(text).then(() => {
      this.copyFeedback.set(`${label} copied`);
      if (this.copyFeedbackTimer) clearTimeout(this.copyFeedbackTimer);
      this.copyFeedbackTimer = setTimeout(() => this.copyFeedback.set(''), 2000);
    });
  }

  studyVerseBookLabel(sv: StudyVerse): string {
    const name = this.books().find((b) => b.uuid === sv.book_uuid)?.name;
    return name ?? '';
  }

  canDeleteContent(): boolean {
    return this.study()?.capabilities.can_delete_content ?? false;
  }

  deletePlanItem(item: StudyPlanItem): void {
    const st = this.study();
    if (!st || !this.canDeleteContent()) return;
    if (!confirm(`Remove plan step “${item.title}”?`)) return;
    this.studiesService.destroyPlanItem(st.uuid, item.uuid, this.studyMode()).subscribe({
      next: () => {
        if (this.selectedPlanItemUuid() === item.uuid) {
          this.selectedPlanItemUuid.set('');
          void this.router.navigate(['/studies', st.uuid]);
        }
        this.toast.success('Deleted.');
        this.loadStudyWorkspace(st.uuid);
      },
      error: () => {
        this.error.set('Could not delete plan step.');
        this.toast.danger('Could not delete plan step.');
      }
    });
  }

  deleteCommentary(c: StudyCommentary): void {
    const st = this.study();
    if (!st || !this.canDeleteContent()) return;
    if (!confirm(`Delete commentary “${c.title}”?`)) return;
    this.studiesService.destroyCommentary(st.uuid, c.uuid, this.studyMode()).subscribe({
      next: () => {
        this.toast.success('Deleted.');
        this.loadStudyWorkspace(st.uuid);
      },
      error: () => {
        this.error.set('Could not delete commentary.');
        this.toast.danger('Could not delete commentary.');
      }
    });
  }

  deleteStudyVerse(sv: StudyVerse): void {
    const st = this.study();
    if (!st || !this.canDeleteContent()) return;
    if (!confirm('Remove this saved verse?')) return;
    this.studiesService.destroyStudyVerse(st.uuid, sv.uuid, this.studyMode()).subscribe({
      next: () => {
        this.toast.success('Deleted.');
        this.loadStudyWorkspace(st.uuid);
      },
      error: () => {
        this.error.set('Could not delete verse.');
        this.toast.danger('Could not delete verse.');
      }
    });
  }

  deleteQuestion(q: StudyQuestion): void {
    const st = this.study();
    if (!st || !this.canDeleteContent()) return;
    if (!confirm('Delete this question and its answers?')) return;
    this.studiesService.destroyQuestion(st.uuid, q.uuid, this.studyMode()).subscribe({
      next: () => {
        this.toast.success('Deleted.');
        this.loadStudyWorkspace(st.uuid);
      },
      error: () => {
        this.error.set('Could not delete question.');
        this.toast.danger('Could not delete question.');
      }
    });
  }

  deleteTask(t: StudyTask): void {
    const st = this.study();
    if (!st || !this.canDeleteContent()) return;
    if (!confirm('Delete this task?')) return;
    this.studiesService.destroyTask(st.uuid, t.uuid, this.studyMode()).subscribe({
      next: () => {
        this.toast.success('Deleted.');
        this.loadStudyWorkspace(st.uuid);
      },
      error: () => {
        this.error.set('Could not delete task.');
        this.toast.danger('Could not delete task.');
      }
    });
  }

  deleteAnswer(questionUuid: string, answer: StudyAnswer): void {
    const st = this.study();
    if (!st || this.studyMode() !== 'leader') return;
    if (!confirm('Delete this answer?')) return;
    this.studiesService.destroyAnswer(st.uuid, questionUuid, answer.uuid, this.studyMode()).subscribe({
      next: () => {
        this.toast.success('Deleted.');
        this.loadAnswers(questionUuid);
      },
      error: () => {
        this.error.set('Could not delete answer.');
        this.toast.danger('Could not delete answer.');
      }
    });
  }

  private toastHttpError(err: unknown, fallback: string): void {
    const e = err as { error?: { error?: string; errors?: string[] } };
    const msg =
      e.error?.errors && Array.isArray(e.error.errors) && e.error.errors.length > 0
        ? e.error.errors.join(', ')
        : e.error?.error ?? fallback;
    this.toast.danger(msg);
  }

  private normalizeDuration(raw: unknown): number | null {
    if (raw === null || raw === undefined || raw === '') return null;
    const n = Number(raw);
    if (!Number.isFinite(n)) return null;
    const rounded = Math.trunc(n);
    if (rounded < 0) return null;
    return rounded;
  }

  private durationInputValue(duration: number | null | undefined): string {
    const n = this.normalizeDuration(duration);
    return !n || n <= 0 ? '' : String(n);
  }

  private durationPayloadFromInput(input: string): number | null {
    const n = this.normalizeDuration(input.trim());
    return !n || n <= 0 ? null : n;
  }

  private defaultDurationForItemType(itemType: StudyPlanItem['item_type']): number {
    if (itemType === 'verse') return 2;
    if (itemType === 'question') return 7;
    if (itemType === 'commentary') return 5;
    if (itemType === 'task') return 5;
    return 5;
  }
}
