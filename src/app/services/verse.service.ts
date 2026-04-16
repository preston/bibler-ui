// Author: Preston Lee

import {Injectable} from '@angular/core'
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';

import {BiblerService} from './bibler.service';
import { Book } from '../models/book';
import { Bible } from '../models/bible';
import { ComparatorAiCommentaryRequest, ComparatorAiSseMessage, Verse } from '../models/verse';

@Injectable({
	providedIn: 'root'
})
export class VerseService {

	constructor(private biblerService: BiblerService, private http: HttpClient) {
	}

	index(bible: Bible, book: Book, chapter: number) {
		var url = this.biblerService.getUrl() + '/' + bible.uuid + '/' + book.uuid + '/' + chapter;
		return this.http.get<Verse[]>(url);//.map(res => res.json());
	}

	streamComparatorAiCommentary(payload: ComparatorAiCommentaryRequest): Observable<ComparatorAiSseMessage> {
		return new Observable<ComparatorAiSseMessage>((subscriber) => {
			const ac = new AbortController();
			(async () => {
				try {
					await this.runComparatorFallbackChat(payload, subscriber, ac.signal);
				} catch (e) {
					if ((e as Error).name === 'AbortError') {
						subscriber.complete();
					} else {
						subscriber.error(e);
					}
				}
			})();

			return () => ac.abort();
		});
	}

	private async runComparatorFallbackChat(
		payload: ComparatorAiCommentaryRequest,
		subscriber: {
			next: (v: ComparatorAiSseMessage) => void;
			error: (e: unknown) => void;
			complete: () => void;
		},
		signal: AbortSignal
	): Promise<void> {
		subscriber.next({ event: 'status', data: { message: 'Generating AI commentary...' } });
		const url = `${this.biblerService.getUrl()}/ai/chat`;
		const prompt = [
			'You are a biblical linguistic assistant.',
			'Return strict JSON only, no markdown.',
			'Schema: {"verses":[{"ordinal":number,"commentary":string,"linguistic_notes":string,"translation_issues":string,"cultural_context":string,"anthropological_context":string,"translation_lens":string,"grammar_notes":string,"idiom_notes":[string]}]}',
			'Create one object per verse ordinal in left_verses.',
			'Use right_verses as comparison context for translation differences.',
			'Do not invent ordinals.'
		].join(' ');

		const response = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				prompt,
				context: payload
			}),
			signal
		});
		const bodyText = await response.text();
		if (!response.ok) {
			subscriber.error(new Error(bodyText || 'Comparator AI fallback failed.'));
			return;
		}

		let outputText = '';
		try {
			const parsed = JSON.parse(bodyText) as { output?: string; error?: string };
			if (parsed.error) {
				subscriber.error(new Error(parsed.error));
				return;
			}
			outputText = parsed.output ?? '';
		} catch {
			subscriber.error(new Error('Comparator AI fallback returned malformed JSON.'));
			return;
		}

		const normalized = this.extractJsonObject(outputText);
		if (!normalized) {
			subscriber.error(new Error('Comparator AI fallback could not parse model output.'));
			return;
		}

		try {
			const parsed = JSON.parse(normalized) as { verses?: Array<Record<string, unknown>> };
			const verses = parsed.verses ?? [];
			for (const verse of verses) {
				subscriber.next({ event: 'verse', data: verse });
			}
			subscriber.next({ event: 'complete', data: {} });
			subscriber.complete();
		} catch {
			subscriber.error(new Error('Comparator AI fallback output did not match expected verse schema.'));
		}
	}

	private extractJsonObject(text: string): string | null {
		const start = text.indexOf('{');
		const end = text.lastIndexOf('}');
		if (start < 0 || end < start) return null;
		return text.slice(start, end + 1);
	}

	private consumeSseBuffer(
		buffer: string,
		subscriber: { next: (v: ComparatorAiSseMessage) => void }
	): string {
		const parts = buffer.split(/\n\n/);
		const rest = parts.pop() ?? '';
		for (const block of parts) {
			if (!block.trim()) continue;
			let eventName = 'message';
			const dataLines: string[] = [];
			for (const line of block.split('\n')) {
				if (line.startsWith('event:')) {
					eventName = line.slice(6).trim();
				} else if (line.startsWith('data:')) {
					dataLines.push(line.slice(5).trimStart());
				}
			}
			if (dataLines.length === 0) continue;
			const dataStr = dataLines.join('\n');
			try {
				const data = JSON.parse(dataStr) as Record<string, unknown>;
				subscriber.next({ event: eventName, data });
			} catch {
				subscriber.next({ event: eventName, data: { raw: dataStr } });
			}
		}
		return rest;
	}

}
