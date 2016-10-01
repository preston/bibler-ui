// import {OnInit} from '@angular/core';
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var bibleBased_component_1 = require('./bibleBased.component');
var BookBasedComponent = (function (_super) {
    __extends(BookBasedComponent, _super);
    function BookBasedComponent(biblerService, bibleService, testamentService, bookService, verseService) {
        _super.call(this, biblerService, bibleService, testamentService);
        this.bookService = bookService;
        this.verseService = verseService;
        this.books = [];
        this.chapters = [];
        console.log("BookBasedComponent created!");
    }
    BookBasedComponent.prototype.afterBibleLoad = function () {
        var _this = this;
        this.bookService.index().subscribe(function (d) {
            _this.books = d;
            if (_this.book == null && _this.books.length > 0)
                _this.selectBook(_this.books[0]['slug']);
        });
        console.log("afterBibleLoad");
    };
    BookBasedComponent.prototype.selectBook = function (slug) {
        console.log("Changing book to " + slug);
        this.book = this.bookForSlug(slug);
        this.afterBibleSelect();
    };
    BookBasedComponent.prototype.afterBibleSelect = function () {
        var _this = this;
        var bible = this.bible;
        var book = this.book;
        if (this.bible != null && this.book != null) {
            console.log("Updating chapter list.");
            this.bookService.chaptersFor(this.bible, this.book).subscribe(function (d) {
                _this.chapters = d;
                _this.selectChapter(_this.chapters[0]);
            });
        }
        else {
            console.log("Bible and book must be selected to update chapter counts.");
        }
    };
    BookBasedComponent.prototype.verseDataPermalink = function (verse, format) {
        return this.biblerService.getUrl() + '/' + this.bible['slug'] + '/' + this.book['slug'] + '/' + this.chapter + '/' + verse['ordinal'] + '.' + format;
    };
    BookBasedComponent.prototype.bookForSlug = function (slug) {
        return this.objectForSlug(this.books, slug);
    };
    ;
    return BookBasedComponent;
}(bibleBased_component_1.BibleBasedComponent));
exports.BookBasedComponent = BookBasedComponent;
//# sourceMappingURL=bookBased.component.js.map