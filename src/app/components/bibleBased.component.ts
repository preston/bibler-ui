import {OnInit} from 'angular2/core';

import {BiblerService} from '../services/bibler.service';
import {BibleService} from '../services/bible.service';
import {TestamentService} from '../services/testament.service';

export abstract class BibleBasedComponent  implements OnInit {

	searchText = '';

	bibles: Object[] = [];
	bible: Object;
	testaments: Object[] = [];

	constructor(
        protected biblerService: BiblerService,
        protected bibleService: BibleService,
        protected testamentService: TestamentService) {}

	ngOnInit() {
        this.bibleService.index().subscribe(d => {
            this.bibles = d;
            if (this.bible == null && this.bibles.length > 0)
                this.selectBible(this.bibles[0]['slug']);
			this.afterBibleLoad();
        });
        this.testamentService.index().subscribe(d => {
            this.testaments = d;
        });
        console.log("BibleBasedComponent initialized!");
    }

	afterBibleLoad() {}
	afterBibleSelect() {}

	selectBible(slug: string) {
        console.log("Changing bible to " + slug);
        this.bible = this.bibleForSlug(slug);
        this.afterBibleSelect();
    }

	highlighted(words: string, inText: string): string {
        var s = words.trim();
        var result = inText;
        if (s.length > 0) {
            var terms = s.split(/\s+/);
            // Sort terms by length
            terms.sort(function(a, b) {
                return b.length - a.length;
            });
            // Regex to simultaneously replace terms
            var regex = new RegExp('(' + terms.join('|') + ')', 'gi');
            var result = inText.replace(regex, '<span class="highlight">$&</span>');
        }
        return result
    }

	verseMailTo(verse) {
        return "mailto:?subject=" + verse.book.name + '%20' + verse.chapter + ':' + verse.ordinal
            + '%20-%20' + this.bible['name']
            + '&body=%22' + verse.text
            // + "%22%0D%0A%0D%0A%20%20%20%20" + this.versePermalink(verse, 'html')
            + '%0D%0A%0D%0A--%0D%0APowered by Bibler.';
    }

	protected bibleForSlug(slug: string): Object {
		return this.objectForSlug(this.bibles, slug);
	};

	protected objectForSlug(array, slug): Object {
		for (var i = 0; i < array.length; i++) {
			if (array[i].slug == slug) {
				return array[i];
			}
		}
		return null;
	};

}
