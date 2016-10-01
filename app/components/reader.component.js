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
var ReaderComponent = (function (_super) {
    __extends(ReaderComponent, _super);
    function ReaderComponent(biblerService, bibleService, testamentService, bookService, verseService) {
        _super.call(this, biblerService, bibleService, testamentService, bookService, verseService);
        this.verses = [];
        console.log("ReaderComponent created!");
    }
    ReaderComponent.prototype.selectChapter = function (n) {
        var _this = this;
        console.log("Updating verses for chapter " + n);
        this.chapter = n;
        this.verseService.index(this.bible, this.book, this.chapter).subscribe(function (d) {
            _this.verses = d;
            _this.updateHighlights();
        });
    };
    ReaderComponent.prototype.updateHighlights = function () {
        console.log("Updating highlights...");
        // console.log(s);
        for (var i = 0; i < this.verses.length; i++) {
            // console.log(this.verses[i]['text']);
            this.verses[i]['highlightedText'] = this.highlighted(this.searchText, this.verses[i]['text']);
        }
    };
    ReaderComponent = __decorate([
        core_1.Component({
            selector: 'reader',
            templateUrl: 'app/components/reader.html'
        }), 
        __metadata('design:paramtypes', [bibler_service_1.BiblerService, bible_service_1.BibleService, testament_service_1.TestamentService, book_service_1.BookService, verse_service_1.VerseService])
    ], ReaderComponent);
    return ReaderComponent;
}(bookBased_component_1.BookBasedComponent));
exports.ReaderComponent = ReaderComponent;
//# sourceMappingURL=reader.component.js.map