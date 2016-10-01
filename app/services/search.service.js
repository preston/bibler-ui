"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var http_1 = require('@angular/http');
require('rxjs/add/operator/map');
require('rxjs/add/operator/toPromise');
var bibler_service_1 = require('./bibler.service');
var SearchService = (function () {
    // private verses;
    function SearchService(biblerService, http) {
        this.biblerService = biblerService;
        this.http = http;
    }
    SearchService.prototype.search = function (bible, searchText) {
        // console.log("Search " + bible + " for " + searchText);
        var url = this.biblerService.getUrl() + '/' + bible + '/search.json';
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        var args = "text=" + searchText;
        return this.http.post(url, args, { headers: headers }).toPromise().then(function (res) { return res.json(); });
    };
    SearchService = __decorate([
        core_1.Injectable(),
        core_1.Component({
            providers: [http_1.Http, bibler_service_1.BiblerService]
        }), 
        __metadata('design:paramtypes', [bibler_service_1.BiblerService, http_1.Http])
    ], SearchService);
    return SearchService;
}());
exports.SearchService = SearchService;
//# sourceMappingURL=search.service.js.map