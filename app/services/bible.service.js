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
var bibler_service_1 = require('./bibler.service');
var BibleService = (function () {
    // bibles = [
    // 	{"id":1,"name":"American Standard-ASV1901","abbreviation":"ASV","slug":"american-standard-asv1901"},
    // 	{"id":2,"name":"Bible in Basic English","abbreviation":"BBE","slug":"bible-in-basic-english"}];
    function BibleService(biblerService, http) {
        this.biblerService = biblerService;
        this.http = http;
        this.path = '/bibles.json';
    }
    BibleService.prototype.index = function () {
        var url = this.biblerService.getUrl() + this.path;
        return this.http.get(url).map(function (res) { return res.json(); });
    };
    BibleService = __decorate([
        core_1.Injectable(),
        core_1.Component({
            providers: [http_1.Http, bibler_service_1.BiblerService]
        }), 
        __metadata('design:paramtypes', [bibler_service_1.BiblerService, http_1.Http])
    ], BibleService);
    return BibleService;
}());
exports.BibleService = BibleService;
//# sourceMappingURL=bible.service.js.map