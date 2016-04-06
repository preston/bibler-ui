import {Component, Injectable} from 'angular2/core';

@Injectable()
export class ChapterService {

	chapters: number[] = [1, 2, 3];

	getChapters() {
		return this.chapters;
	}

}
