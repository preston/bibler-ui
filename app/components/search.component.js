"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var bibleBased_component_1 = require('./bibleBased.component');
var bibler_service_1 = require('../services/bibler.service');
var bible_service_1 = require('../services/bible.service');
var book_service_1 = require('../services/book.service');
var testament_service_1 = require('../services/testament.service');
var verse_service_1 = require('../services/verse.service');
var search_service_1 = require('../services/search.service');
var SearchComponent = (function (_super) {
    __extends(SearchComponent, _super);
    function SearchComponent(biblerService, bibleService, testamentService, bookService, verseService, searchService) {
        _super.call(this, biblerService, bibleService, testamentService);
        this.bookService = bookService;
        this.verseService = verseService;
        this.searchService = searchService;
        this.verses = [];
        this.ascending = true;
        console.log("SearchComponent has been initialized.");
    }
    SearchComponent.prototype.resort = function () {
        this.ascending = !this.ascending;
        if (this.ascending) {
            this.verses = this.verses.sort(function (a, b) { return b['book']['name'].localeCompare(a['book']['name']); });
        }
        else {
            this.verses = this.verses.sort(function (a, b) { return a['book']['name'].localeCompare(b['book']['name']); });
        }
    };
    SearchComponent.prototype.afterBibleSelect = function () { this.search(); };
    SearchComponent.prototype.search = function () {
        var _this = this;
        console.log("Searching...");
        if (this.validSearch()) {
            var obs = this.searchService.search(this.bible['slug'], this.searchText);
            obs.then(function (d) {
                _this.verses = d;
                for (var i = 0; i < _this.verses.length; i++) {
                    _this.verses[i]['highlightedText'] = _this.highlighted(_this.searchText, _this.verses[i]['text']);
                }
                _this.resort();
                // console.log(d);
            });
        }
        // return false;
    };
    SearchComponent.prototype.validSearch = function () {
        return this.bible != null && this.searchText != null && this.searchText.length >= 3;
    };
    SearchComponent = __decorate([
        core_1.Component({
            selector: 'search',
            templateUrl: 'app/components/search.html'
        }), 
        __metadata('design:paramtypes', [bibler_service_1.BiblerService, bible_service_1.BibleService, testament_service_1.TestamentService, book_service_1.BookService, verse_service_1.VerseService, search_service_1.SearchService])
    ], SearchComponent);
    return SearchComponent;
}(bibleBased_component_1.BibleBasedComponent));
exports.SearchComponent = SearchComponent;
//# sourceMappingURL=search.component.js.map