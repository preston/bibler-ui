// Author: Preston Lee

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Testament } from '../models/testament';

import { BiblerService } from './bibler.service';

@Injectable({
	providedIn: 'root'
})
export class TestamentService {

	private path = '/testaments';

	constructor(private biblerService: BiblerService, private http: HttpClient) {
	}

	index() {
		const url = this.biblerService.getUrl() + this.path + '.json';
		return this.http.get<Testament[]>(url);
	}

}
