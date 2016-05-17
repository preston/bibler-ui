import {Component} from '@angular/core';

import {BiblerService} from '../services/bibler.service';
import {BibleService} from '../services/bible.service';

@Component({
	selector: 'bibler-verse',
	templateUrl: './verse.html',
	providers: [BiblerService, BibleService]
})
export class VerseComponent {

	constructor() {
		console.log("VerseComponent has been initialized.");
	}
}

// angular.module('BiblerApp').directive('biblerVerse', function() {
// 	return {
// 		restrict: 'E',
// 		// require: ['^bible', '^book', '^chapter', '^verse'],
// 		scope: {
// 			bible: '@',
// 			book: '@',
// 			chapter: '@',
// 			verse: '@'
// 		},
// 		controller: ['$scope', '$http', 'Restangular', function($scope, $http, Restangular) {
// 			$scope.loadVerse = function(bible, book, chapter, verse) {
// 				var path = '/' + bible + '/' + book + '/' + chapter;
// 				Restangular.one(path, verse).get().then(function(v) {
// 					$scope.verse = v;
// 				});
// 				Restangular.one('books', book).get().then(function(b) {
// 					$scope.book = b;
// 				});
// 				Restangular.one('bibles', bible).get().then(function(b) {
// 					$scope.bible = b;
// 				});
// 				// $scope.
// 			}
// 		}],
// 		link: function(scope, iElement, iAttrs, ctrl) {
// 			scope.verse = scope.loadVerse(iAttrs.bible, iAttrs.book, iAttrs.chapter, iAttrs.verse);
// 		}
// 	}
// });
