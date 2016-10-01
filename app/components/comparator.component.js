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
var bibler_service_1 = require('../services/bibler.service');
var bible_service_1 = require('../services/bible.service');
var book_service_1 = require('../services/book.service');
var testament_service_1 = require('../services/testament.service');
var verse_service_1 = require('../services/verse.service');
var bookBased_component_1 = require('./bookBased.component');
var ComparatorComponent = (function (_super) {
    __extends(ComparatorComponent, _super);
    function ComparatorComponent(biblerService, bibleService, bookService, testamentService, verseService) {
        _super.call(this, biblerService, bibleService, testamentService, bookService, verseService);
        this.bibleRight = null;
        this.versesLeft = [];
        this.versesRight = [];
        console.log("ComparatorComponent has been initialized.");
    }
    ComparatorComponent.prototype.afterBibleLoad = function () {
        _super.prototype.afterBibleLoad.call(this);
        if (this.bibleRight == null && this.bibles.length > 1)
            this.selectBibleRight(this.bibles[1]['slug']);
    };
    ComparatorComponent.prototype.selectChapter = function (n) {
        var _this = this;
        console.log("Updating verses for chapter " + n);
        this.chapter = n;
        if (this.bible && this.bibleRight) {
            this.verseService.index(this.bible, this.book, this.chapter).subscribe(function (left) {
                _this.updateHighlights(left);
                _this.versesLeft = left;
                _this.verseService.index(_this.bibleRight, _this.book, _this.chapter).subscribe(function (right) {
                    _this.updateHighlights(right);
                    _this.versesRight = right;
                });
            });
        }
    };
    ComparatorComponent.prototype.updateAllHighlights = function () {
        this.updateHighlights(this.versesLeft);
        this.updateHighlights(this.versesRight);
    };
    ComparatorComponent.prototype.updateHighlights = function (data) {
        console.log("Updating highlights for both bibles...");
        for (var i = 0; i < data.length; i++) {
            data[i]['highlightedText'] = this.highlighted(this.searchText, data[i]['text']);
        }
    };
    ComparatorComponent.prototype.selectBibleRight = function (slug) {
        console.log("Changing right bible to " + slug);
        this.bibleRight = this.bibleForSlug(slug);
        this.afterBibleSelect();
    };
    ComparatorComponent = __decorate([
        core_1.Component({
            selector: 'comparator',
            templateUrl: 'app/components/comparator.html'
        }), 
        __metadata('design:paramtypes', [bibler_service_1.BiblerService, bible_service_1.BibleService, book_service_1.BookService, testament_service_1.TestamentService, verse_service_1.VerseService])
    ], ComparatorComponent);
    return ComparatorComponent;
}(bookBased_component_1.BookBasedComponent));
exports.ComparatorComponent = ComparatorComponent;
//# sourceMappingURL=comparator.component.js.map