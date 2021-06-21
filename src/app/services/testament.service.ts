import { Component, OnInit, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Testament } from '../models/testament';

import { BiblerService } from './bibler.service';

@Injectable()
export class TestamentService implements OnInit {

	private path = '/testaments';
	// private testaments;

	constructor(private biblerService: BiblerService, private http: HttpClient) {
	}

	ngOnInit() {
	}

	index() {
		var url = this.biblerService.getUrl() + this.path + '.json';
		// console.log('URL: ' + url);
		return this.http.get<Testament[]>(url);
		// .map(res => res.json());
	}

}
