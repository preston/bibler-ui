// Author: Preston Lee

import { Component, Injectable } from '@angular/core';

@Injectable()
export class BiblerService {

	private root: string;

	constructor() {
		this.root = (window as any)["BIBLER_SERVER_URL"];
		if (this.root) {
			console.log('Server URL is: ' + this.root);
		} else {
			let msg = "BIBLER_SERVER_URL is not set. This UI application will not function without it!";
			console.error(msg);
			throw new Error(msg);
		}
	}

	getUrl(): string {
		return this.root;
	}

	search(text: string): Object[] {
		return [];
	}

}
