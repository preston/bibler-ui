// Author: Preston Lee

import {Injectable} from '@angular/core'
import {HttpClient} from '@angular/common/http';

import {BiblerService} from './bibler.service';
import { Book } from '../models/book';
import { Bible } from '../models/bible';
import { Verse } from '../models/verse';

@Injectable()
export class VerseService {

	constructor(private biblerService: BiblerService, private http: HttpClient) {
	}

	index(bible: Bible, book: Book, chapter: number) {
		var url = this.biblerService.getUrl() + '/' + bible.slug + '/' + book.slug + '/' + chapter;
		return this.http.get<Verse[]>(url);//.map(res => res.json());
	}

}
