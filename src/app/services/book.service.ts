// Author: Preston Lee

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {BiblerService} from './bibler.service';
import { Book } from '../models/book';
import { Bible } from '../models/bible';

@Injectable({
	providedIn: 'root'
})
export class BookService {

	private path = '/books';

	constructor(private biblerService: BiblerService, private http: HttpClient) {
	}

	index(bible?: Bible) {
		let url: string;
		if (bible) {
			// Use nested route: /bibles/:bible_slug/books.json
			url = this.biblerService.getUrl() + '/bibles/' + bible.slug + '/books.json';
		} else {
			// Fallback to old route for backward compatibility
			url = this.biblerService.getUrl() + this.path + '.json';
		}
		return this.http.get<Book[]>(url);
	}

	chaptersFor(bible: Bible, book: Book) {
		const url = this.biblerService.getUrl() + '/' + bible.slug + '/' + book.slug + '.json';
		return this.http.get<number[]>(url);
	}

}
