import { Book } from "./book";
import { Uuidable } from "./sluggable";

export class Verse implements Uuidable {
    id!: string;
    uuid!: string;
    bible_id!: string;
    book_id!: string;
    book!: Book; // Is this needed?
    highlightedText!: string; // text highlighting feature
    chapter!: number;
    ordinal!: number;
    text!: string;
    created_at!: string;
    updated_at!: string;
}

export interface ComparatorAiVerseInput {
    ordinal: number;
    text: string;
}

export interface ComparatorAiCommentaryRequest {
    left_bible_uuid: string;
    right_bible_uuid: string;
    left_book_uuid: string;
    right_book_uuid: string;
    chapter: number;
    left_verses: ComparatorAiVerseInput[];
    right_verses: ComparatorAiVerseInput[];
}

export interface ComparatorAiVerseCommentary {
    ordinal: number;
    commentary: string;
    linguistic_notes?: string;
    translation_issues?: string;
    cultural_context?: string;
    anthropological_context?: string;
    interlinear_tokens?: Array<{
        token: string;
        transliteration?: string;
        lemma?: string;
        morphology?: string;
        gloss?: string;
        confidence?: number;
        ambiguity_note?: string;
    }>;
    translation_lens?: 'formal_equivalence' | 'dynamic_equivalence' | 'interpretive_expansion' | string;
    grammar_notes?: string;
    idiom_notes?: string[];
}

export interface ComparatorAiSseMessage {
    event: string;
    data: Record<string, unknown>;
}