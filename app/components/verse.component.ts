import {Component} from '@angular/core';

import {BiblerService} from '../services/bibler.service';
import {BibleService} from '../services/bible.service';

@Component({
	selector: 'bibler-verse',
	templateUrl: './app/components/verse.html'
	// providers: [BiblerService, BibleService]
})
export class VerseComponent {

	constructor() {
		console.log("VerseComponent has been initialized.");
	}
}
