import {Component, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {BiblerService} from './bibler.service';
import { Bible } from '../models/bible';

@Injectable()
export class BibleService {

	private path = '/bibles.json';
	// private bibles;

	// bibles = [
	// 	{"id":1,"name":"American Standard-ASV1901","abbreviation":"ASV","slug":"american-standard-asv1901"},
	// 	{"id":2,"name":"Bible in Basic English","abbreviation":"BBE","slug":"bible-in-basic-english"}];

	constructor(private biblerService: BiblerService, private http: HttpClient) {
	}

	index() {
		var url = this.biblerService.getUrl() + this.path;
		return this.http.get<Bible[]>(url)
		// .map((res: { json: () => any; }) => {
		// 	return res.json();
		// });
	}

}
