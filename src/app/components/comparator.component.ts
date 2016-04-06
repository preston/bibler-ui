import {Component} from 'angular2/core';

import {ServerService} from '../services/server.service';
import {BibleService} from '../services/bible.service';

@Component({
	selector: 'comparator',
	templateUrl: 'app/components/comparator.html',
	providers: [ServerService, BibleService]
})
export class ComparatorComponent {

	constructor() {
		console.log("ComparatorComponent has been initialized.");
	}
}

	// Restangular.all('bibles').getList().then(function(bibles) {
	// 	$scope.bibles = bibles;
	// 	$scope.selectedBibleLeft = bibles[0].slug;
	// 	$scope.selectedBibleRight = bibles[1].slug;
	// 	console.log("Loaded " + bibles.length + " bibles.");
	// 	$scope.updateChapters();
	// });
	//
	// Restangular.all('books').getList().then(function(books) {
	// 	$scope.books = books;
	// 	$scope.selectedBook = books[0].slug;
	// 	console.log("Loaded " + books.length + " books.");
	// 	$scope.updateChapters();
	// });
	//
	// $scope.selectChapter = function() {
	// 	console.log("Fetching verses...");
	// 	var book = $scope.selectedBook;
	// 	var chapter = $scope.selectedChapter;
	// 	Restangular.all($scope.selectedBibleLeft + '/' + book + '/' + chapter).getList().then(function(verses) {
	// 		$scope.versesLeft = verses;
	// 	});
	// 	Restangular.all($scope.selectedBibleRight + '/' + book + '/' + chapter).getList().then(function(verses) {
	// 		$scope.versesRight = verses;
	// 	});
	// };
	//
	// $scope.selectBibleLeft = function() { $scope.updateChapters(); }
	// $scope.selectBibleRight = function() {
	// 	$scope.selectChapter();
	// }
	//
	// $scope.bibleForSlug = function(slug) {
	// 	if($scope.bibles == null) {
	// 		return null;
	// 	}
	// 	for(var i = 0; i < $scope.bibles.length; i++) {
	// 		if($scope.bibles[i].slug == slug) {
	// 			return $scope.bibles[i];
	// 		}
	// 	}
	// };
	//
	// $scope.updateChapters = function() {
	// 	var bible = $scope.selectedBibleLeft;
	// 	var book = $scope.selectedBook;
	// 	if(bible != null && book != null) {
	// 		console.log("Updating chapter list.");
	// 		Restangular.all(bible + '/' + book).getList().then(function(chapters) {
	// 			$scope.chapters = chapters;
	// 			$scope.selectedChapter = chapters[0];
	// 			$scope.selectChapter();
	// 		});
	// 	} else {
	// 		console.log("Bible and book must be selected to update chapter counts.");
	// 	}
	// }
