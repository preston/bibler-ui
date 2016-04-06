import {Component} from 'angular2/core';

import {ServerService} from '../services/server.service';
import {BibleService} from '../services/bible.service';

@Component({
	selector: 'search',
	templateUrl: 'app/components/search.html',
	providers: [ServerService, BibleService]
})

export class SearchComponent {

	constructor(private bibleService: BibleService) {
		console.log("SearchComponent has been initialized.");
	}
}

	// Restangular.all('bibles').getList().then(function(bibles) {
	// 	$scope.bibles = bibles;
	// 	$scope.selectedBible = bibles[0].slug;
	// 	console.log("Loaded " + bibles.length + " bibles.");
	// });
	//
	// $scope.search = function() {
	// 	var bible = $scope.selectedBible;
	// 	var text = $scope.search.text;
	// 	if($scope.validSearch()) {
	// 		Restangular.all(bible + '/search').post({'text' : $scope.search.text}).then(function(verses) {
	// 			$scope.verses = verses;
	// 		});
	//
	// 	} else {
	// 		$scope.verses = [];
	// 	}
	// }
	//
	// $scope.validSearch = function() {
	// 	return $scope.selectedBible != null && $scope.search.text != null && $scope.search.text.length >= 3
	// }
