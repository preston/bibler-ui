// Author: Preston Lee

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {BiblerService} from './bibler.service';
import { Book } from '../models/book';
import { Bible } from '../models/bible';

@Injectable()
export class BookService {

	private path = '/books';


	constructor(private biblerService: BiblerService, private http: HttpClient) {
	}

	index() {
		var url = this.biblerService.getUrl() + this.path + '.json';
		return this.http.get<Book[]>(url);
		// .map(res => res.json());
	}

	chaptersFor(bible: Bible, book: Book) {
		var url = this.biblerService.getUrl() + '/' + bible.slug + '/' + book.slug + '.json';
		return this.http.get<number[]>(url);
		// .map(res => res.json());
	}

}
