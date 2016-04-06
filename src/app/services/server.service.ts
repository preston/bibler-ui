import {Component, Injectable} from 'angular2/core';

@Injectable()
export class ServerService {

	getUrl(): string {
		return 'http://localhost:3000';
		// var port = $location.port();
		// var proto = $location.protocol();
		// $scope.urlRoot = proto + "://" + $location.host();
		// if((proto == 'http' && port == 80) || (proto == 'https' && port == 443)) {
		// 	// We don't need to explicitly set the port.
		// } else {
		// 	$scope.urlRoot += ":" + port;
		// }
	}

	search(text: string): Object[] {
		return [];
	}

}
