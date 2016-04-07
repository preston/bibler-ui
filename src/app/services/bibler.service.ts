import {Component, Injectable} from 'angular2/core';

@Injectable()
export class BiblerService {

	// private root = 'http://localhost:3000';
	private root = 'http://bibler-server.prestonlee.com';

	getUrl(): string {
		return this.root;
	}

	search(text: string): Object[] {
		return [];
	}

}
