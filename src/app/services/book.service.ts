import {Component, Injectable} from 'angular2/core';

import {ChapterService} from './chapter.service';

@Injectable()
@Component({
	providers: [ChapterService]
})
export class BookService {

	books: Object[] = [
		{"id":1,"name":"Genesis","ordinal":1,"slug":"genesis","testament":{"slug":"old","path":"/testaments/old.json"}},
		{"id":2,"name":"Exodus","ordinal":2,"slug":"exodus","testament":{"slug":"old","path":"/testaments/old.json"}}
	];

	// constructor(private chapterService: ChapterService) {
	//
	// }
	getBooks() {
		return this.books;
	}

}
