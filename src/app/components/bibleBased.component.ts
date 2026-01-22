import { Component, Injectable, signal, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { BiblerService } from '../services/bibler.service';
import { BibleService } from '../services/bible.service';
import { TestamentService } from '../services/testament.service';
import { Bible } from '../models/bible';
import { Testament } from '../models/testament';
import { Sluggable } from '../models/sluggable';
import { Verse } from '../models/verse';

@Injectable()
export abstract class BibleBasedComponent {

    protected biblerService = inject(BiblerService);
    protected bibleService = inject(BibleService);
    protected testamentService = inject(TestamentService);

    searchText = signal('');

    private biblesSignal = toSignal(this.bibleService.index(), { initialValue: [] as Bible[] });
    bibles = computed(() => this.biblesSignal() ?? []);

    selectedBibleSlug = signal<string | null>(null);
    bible = computed(() => {
        const slug = this.selectedBibleSlug();
        if (!slug) return null;
        return this.bibleForSlug(slug);
    });

    private testamentsSignal = toSignal(this.testamentService.index(), { initialValue: [] as Testament[] });
    testaments = computed(() => this.testamentsSignal() ?? []);

    constructor() {
        // Use effect to auto-select first bible when bibles load
        effect(() => {
            const bibles = this.bibles();
            const currentSlug = this.selectedBibleSlug();
            if (bibles.length > 0 && !currentSlug) {
                this.selectBible(bibles[0].slug);
            }
        });

        // Call afterBibleLoad when bibles are loaded
        effect(() => {
            const bibles = this.bibles();
            if (bibles.length > 0) {
                this.afterBibleLoad();
            }
        });

        // Call afterBibleSelect when bible changes
        effect(() => {
            const bible = this.bible();
            if (bible) {
                this.afterBibleSelect();
            }
        });

        console.log("BibleBasedComponent initialized!");
    }

    abstract afterBibleLoad(): void;
    abstract afterBibleSelect(): void;

    selectBible(slug: string) {
        console.log("Changing bible to " + slug);
        this.selectedBibleSlug.set(slug);
    }

    highlighted(words: string, inText: string): string {
        const s = words.trim();
        let result = inText;
        if (s.length > 0) {
            const terms = s.split(/\s+/);
            // Sort terms by length
            terms.sort(function (a, b) {
                return b.length - a.length;
            });
            // Regex to simultaneously replace terms
            const regex = new RegExp('(' + terms.join('|') + ')', 'gi');
            result = inText.replace(regex, '<span class="highlight">$&</span>');
        }
        return result;
    }

    verseMailTo(verse: Verse) {
        const bible = this.bible();
        const bookName = verse.book?.name ?? 'Unknown';
        return "mailto:?subject=" + bookName + '%20' + verse.chapter + ':' + verse.ordinal
            + '%20-%20' + (bible?.name ?? '')
            + '&body=%22' + verse.text
            + '%0D%0A%0D%0A--%0D%0APowered by Bibler.';
    }

    protected bibleForSlug(slug: string): Bible | null {
        return this.objectForSlug(this.bibles(), slug);
    }

    protected objectForSlug<T extends Sluggable>(array: Array<T>, slug: string): T | null {
        for (let i = 0; i < array.length; i++) {
            if (array[i].slug == slug) {
                return array[i];
            }
        }
        return null;
    }

}
