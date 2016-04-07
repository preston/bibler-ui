webpackJsonp([0],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../node_modules/angular2/typings/browser.d.ts" />
	"use strict";
	var browser_1 = __webpack_require__(1);
	var http_1 = __webpack_require__(226);
	var router_1 = __webpack_require__(241);
	var core_1 = __webpack_require__(22);
	// Custom app stuff.
	var bibler_ui_1 = __webpack_require__(271);
	core_1.enableProdMode();
	browser_1.bootstrap(bibler_ui_1.BiblerUiApp, [http_1.HTTP_PROVIDERS, router_1.ROUTER_PROVIDERS])
	    .catch(function (err) { return console.error(err); });
	// import {bootstrap} from 'angular2/platform/browser';
	// import {BiblerUiApp} from './app/bibler-ui';
	//
	// import {ServerService} from './app/services/server.service';
	// import {ChapterService} from './app/services/chapter.service';
	// import {BookService} from './app/services/book.service';
	//
	// // bootstrap(BiblerUiApp, []);
	//
	// // import {Http, ConnectionBackend, RequestOptions} from 'angular2/http';
	// import {Http} from 'angular2/http';
	// bootstrap(BiblerUiApp, [Http, ServerService, BookService, ChapterService]);


/***/ },

/***/ 271:
/***/ function(module, exports, __webpack_require__) {

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
	var core_1 = __webpack_require__(22);
	var router_1 = __webpack_require__(241);
	// import {CliRouteConfig} from './route-config';
	var reader_component_1 = __webpack_require__(272);
	var comparator_component_1 = __webpack_require__(282);
	var search_component_1 = __webpack_require__(283);
	var BiblerUiApp = (function () {
	    function BiblerUiApp() {
	        this.tab = 'reader';
	    }
	    BiblerUiApp = __decorate([
	        core_1.Component({
	            selector: 'bibler-ui-app',
	            providers: [router_1.ROUTER_PROVIDERS],
	            templateUrl: 'app/bibler-ui.html',
	            directives: [router_1.ROUTER_DIRECTIVES, reader_component_1.ReaderComponent, comparator_component_1.ComparatorComponent, search_component_1.SearchComponent],
	            pipes: [],
	            styleUrls: []
	        }), 
	        __metadata('design:paramtypes', [])
	    ], BiblerUiApp);
	    return BiblerUiApp;
	}());
	exports.BiblerUiApp = BiblerUiApp;


/***/ },

/***/ 272:
/***/ function(module, exports, __webpack_require__) {

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
	var core_1 = __webpack_require__(22);
	var bibler_service_1 = __webpack_require__(273);
	var bible_service_1 = __webpack_require__(274);
	var book_service_1 = __webpack_require__(277);
	var testament_service_1 = __webpack_require__(278);
	var verse_service_1 = __webpack_require__(279);
	var bookBased_component_1 = __webpack_require__(280);
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
	            templateUrl: 'app/components/reader.html',
	            providers: [bibler_service_1.BiblerService, bible_service_1.BibleService, book_service_1.BookService, testament_service_1.TestamentService, verse_service_1.VerseService]
	        }), 
	        __metadata('design:paramtypes', [bibler_service_1.BiblerService, bible_service_1.BibleService, testament_service_1.TestamentService, book_service_1.BookService, verse_service_1.VerseService])
	    ], ReaderComponent);
	    return ReaderComponent;
	}(bookBased_component_1.BookBasedComponent));
	exports.ReaderComponent = ReaderComponent;


/***/ },

/***/ 273:
/***/ function(module, exports, __webpack_require__) {

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
	var core_1 = __webpack_require__(22);
	var BiblerService = (function () {
	    function BiblerService() {
	        this.root = 'http://localhost:3000';
	    }
	    // private root = 'http://bibler.prestonlee.com';
	    BiblerService.prototype.getUrl = function () {
	        return this.root;
	    };
	    BiblerService.prototype.search = function (text) {
	        return [];
	    };
	    BiblerService = __decorate([
	        core_1.Injectable(), 
	        __metadata('design:paramtypes', [])
	    ], BiblerService);
	    return BiblerService;
	}());
	exports.BiblerService = BiblerService;


/***/ },

/***/ 274:
/***/ function(module, exports, __webpack_require__) {

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
	var core_1 = __webpack_require__(22);
	var http_1 = __webpack_require__(226);
	__webpack_require__(275);
	var bibler_service_1 = __webpack_require__(273);
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


/***/ },

/***/ 275:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(52);
	var map_1 = __webpack_require__(276);
	Observable_1.Observable.prototype.map = map_1.map;
	//# sourceMappingURL=map.js.map

/***/ },

/***/ 276:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(57);
	/**
	 * Similar to the well known `Array.prototype.map` function, this operator
	 * applies a projection to each value and emits that projection in the returned observable
	 *
	 * <img src="./img/map.png" width="100%">
	 *
	 * @param {Function} project the function to create projection
	 * @param {any} [thisArg] an optional argument to define what `this` is in the project function
	 * @returns {Observable} a observable of projected values
	 */
	function map(project, thisArg) {
	    if (typeof project !== 'function') {
	        throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');
	    }
	    return this.lift(new MapOperator(project, thisArg));
	}
	exports.map = map;
	var MapOperator = (function () {
	    function MapOperator(project, thisArg) {
	        this.project = project;
	        this.thisArg = thisArg;
	    }
	    MapOperator.prototype.call = function (subscriber) {
	        return new MapSubscriber(subscriber, this.project, this.thisArg);
	    };
	    return MapOperator;
	}());
	var MapSubscriber = (function (_super) {
	    __extends(MapSubscriber, _super);
	    function MapSubscriber(destination, project, thisArg) {
	        _super.call(this, destination);
	        this.project = project;
	        this.count = 0;
	        this.thisArg = thisArg || this;
	    }
	    // NOTE: This looks unoptimized, but it's actually purposefully NOT
	    // using try/catch optimizations.
	    MapSubscriber.prototype._next = function (value) {
	        var result;
	        try {
	            result = this.project.call(this.thisArg, value, this.count++);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        this.destination.next(result);
	    };
	    return MapSubscriber;
	}(Subscriber_1.Subscriber));
	//# sourceMappingURL=map.js.map

/***/ },

/***/ 277:
/***/ function(module, exports, __webpack_require__) {

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
	var core_1 = __webpack_require__(22);
	var http_1 = __webpack_require__(226);
	__webpack_require__(275);
	var bibler_service_1 = __webpack_require__(273);
	var BookService = (function () {
	    function BookService(biblerService, http) {
	        this.biblerService = biblerService;
	        this.http = http;
	        this.path = '/books';
	    }
	    BookService.prototype.index = function () {
	        var url = this.biblerService.getUrl() + this.path + '.json';
	        return this.http.get(url).map(function (res) { return res.json(); });
	    };
	    BookService.prototype.chaptersFor = function (bible, book) {
	        var url = this.biblerService.getUrl() + '/' + bible['slug'] + '/' + book['slug'] + '.json';
	        return this.http.get(url).map(function (res) { return res.json(); });
	    };
	    BookService = __decorate([
	        core_1.Injectable(),
	        core_1.Component({
	            providers: [http_1.Http, bibler_service_1.BiblerService]
	        }), 
	        __metadata('design:paramtypes', [bibler_service_1.BiblerService, http_1.Http])
	    ], BookService);
	    return BookService;
	}());
	exports.BookService = BookService;


/***/ },

/***/ 278:
/***/ function(module, exports, __webpack_require__) {

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
	var core_1 = __webpack_require__(22);
	var http_1 = __webpack_require__(226);
	__webpack_require__(275);
	var bibler_service_1 = __webpack_require__(273);
	var TestamentService = (function () {
	    function TestamentService(biblerService, http) {
	        this.biblerService = biblerService;
	        this.http = http;
	        this.path = '/testaments';
	    }
	    TestamentService.prototype.ngOnInit = function () {
	    };
	    TestamentService.prototype.index = function () {
	        var url = this.biblerService.getUrl() + this.path + '.json';
	        // console.log('URL: ' + url);
	        this.testaments = this.http.get(url).map(function (res) { return res.json(); });
	        return this.testaments;
	    };
	    TestamentService = __decorate([
	        core_1.Injectable(),
	        core_1.Component({
	            providers: [bibler_service_1.BiblerService, http_1.Http]
	        }), 
	        __metadata('design:paramtypes', [bibler_service_1.BiblerService, http_1.Http])
	    ], TestamentService);
	    return TestamentService;
	}());
	exports.TestamentService = TestamentService;


/***/ },

/***/ 279:
/***/ function(module, exports, __webpack_require__) {

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
	var core_1 = __webpack_require__(22);
	var http_1 = __webpack_require__(226);
	__webpack_require__(275);
	var bibler_service_1 = __webpack_require__(273);
	var VerseService = (function () {
	    function VerseService(biblerService, http) {
	        this.biblerService = biblerService;
	        this.http = http;
	    }
	    VerseService.prototype.index = function (bible, book, chapter) {
	        var url = this.biblerService.getUrl() + '/' + bible['slug'] + '/' + book['slug'] + '/' + chapter;
	        return this.http.get(url).map(function (res) { return res.json(); });
	    };
	    VerseService = __decorate([
	        core_1.Injectable(),
	        core_1.Component({
	            providers: [http_1.Http, bibler_service_1.BiblerService]
	        }), 
	        __metadata('design:paramtypes', [bibler_service_1.BiblerService, http_1.Http])
	    ], VerseService);
	    return VerseService;
	}());
	exports.VerseService = VerseService;


/***/ },

/***/ 280:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var bibleBased_component_1 = __webpack_require__(281);
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


/***/ },

/***/ 281:
/***/ function(module, exports) {

	"use strict";
	var BibleBasedComponent = (function () {
	    function BibleBasedComponent(biblerService, bibleService, testamentService) {
	        this.biblerService = biblerService;
	        this.bibleService = bibleService;
	        this.testamentService = testamentService;
	        this.searchText = '';
	        this.bibles = [];
	        this.testaments = [];
	    }
	    BibleBasedComponent.prototype.ngOnInit = function () {
	        var _this = this;
	        this.bibleService.index().subscribe(function (d) {
	            _this.bibles = d;
	            if (_this.bible == null && _this.bibles.length > 0)
	                _this.selectBible(_this.bibles[0]['slug']);
	            _this.afterBibleLoad();
	        });
	        this.testamentService.index().subscribe(function (d) {
	            _this.testaments = d;
	        });
	        console.log("BibleBasedComponent initialized!");
	    };
	    BibleBasedComponent.prototype.afterBibleLoad = function () { };
	    BibleBasedComponent.prototype.afterBibleSelect = function () { };
	    BibleBasedComponent.prototype.selectBible = function (slug) {
	        console.log("Changing bible to " + slug);
	        this.bible = this.bibleForSlug(slug);
	        this.afterBibleSelect();
	    };
	    BibleBasedComponent.prototype.highlighted = function (words, inText) {
	        var s = words.trim();
	        var result = inText;
	        if (s.length > 0) {
	            var terms = s.split(/\s+/);
	            // Sort terms by length
	            terms.sort(function (a, b) {
	                return b.length - a.length;
	            });
	            // Regex to simultaneously replace terms
	            var regex = new RegExp('(' + terms.join('|') + ')', 'gi');
	            var result = inText.replace(regex, '<span class="highlight">$&</span>');
	        }
	        return result;
	    };
	    BibleBasedComponent.prototype.verseMailTo = function (verse) {
	        return "mailto:?subject=" + verse.book.name + '%20' + verse.chapter + ':' + verse.ordinal
	            + '%20-%20' + this.bible['name']
	            + '&body=%22' + verse.text
	            + '%0D%0A%0D%0A--%0D%0APowered by Bibler.';
	    };
	    BibleBasedComponent.prototype.bibleForSlug = function (slug) {
	        return this.objectForSlug(this.bibles, slug);
	    };
	    ;
	    BibleBasedComponent.prototype.objectForSlug = function (array, slug) {
	        for (var i = 0; i < array.length; i++) {
	            if (array[i].slug == slug) {
	                return array[i];
	            }
	        }
	        return null;
	    };
	    ;
	    return BibleBasedComponent;
	}());
	exports.BibleBasedComponent = BibleBasedComponent;


/***/ },

/***/ 282:
/***/ function(module, exports, __webpack_require__) {

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
	var core_1 = __webpack_require__(22);
	var bibler_service_1 = __webpack_require__(273);
	var bible_service_1 = __webpack_require__(274);
	var book_service_1 = __webpack_require__(277);
	var testament_service_1 = __webpack_require__(278);
	var verse_service_1 = __webpack_require__(279);
	var bookBased_component_1 = __webpack_require__(280);
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
	            this.verseService.index(this.bible, this.book, this.chapter).subscribe(function (d) {
	                _this.versesLeft = d;
	                _this.verseService.index(_this.bibleRight, _this.book, _this.chapter).subscribe(function (d) {
	                    _this.versesRight = d;
	                    _this.updateHighlights();
	                });
	            });
	        }
	    };
	    ComparatorComponent.prototype.updateHighlights = function () {
	        console.log("Updating highlights for both bibles...");
	        for (var i = 0; i < this.versesLeft.length; i++) {
	            this.versesLeft[i]['highlightedText'] = this.highlighted(this.searchText, this.versesLeft[i]['text']);
	        }
	        for (var i = 0; i < this.versesRight.length; i++) {
	            this.versesRight[i]['highlightedText'] = this.highlighted(this.searchText, this.versesRight[i]['text']);
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
	            templateUrl: 'app/components/comparator.html',
	            providers: [bibler_service_1.BiblerService, bible_service_1.BibleService, book_service_1.BookService, testament_service_1.TestamentService, verse_service_1.VerseService]
	        }), 
	        __metadata('design:paramtypes', [bibler_service_1.BiblerService, bible_service_1.BibleService, book_service_1.BookService, testament_service_1.TestamentService, verse_service_1.VerseService])
	    ], ComparatorComponent);
	    return ComparatorComponent;
	}(bookBased_component_1.BookBasedComponent));
	exports.ComparatorComponent = ComparatorComponent;


/***/ },

/***/ 283:
/***/ function(module, exports, __webpack_require__) {

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
	var core_1 = __webpack_require__(22);
	var bibleBased_component_1 = __webpack_require__(281);
	var bibler_service_1 = __webpack_require__(273);
	var bible_service_1 = __webpack_require__(274);
	var book_service_1 = __webpack_require__(277);
	var testament_service_1 = __webpack_require__(278);
	var verse_service_1 = __webpack_require__(279);
	var search_service_1 = __webpack_require__(284);
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
	            obs.subscribe(function (d) {
	                _this.verses = d;
	                for (var i = 0; i < _this.verses.length; i++) {
	                    _this.verses[i]['highlightedText'] = _this.highlighted(_this.searchText, _this.verses[i]['text']);
	                }
	                _this.resort();
	                // console.log(d);
	            });
	        }
	        return false;
	    };
	    SearchComponent.prototype.validSearch = function () {
	        return this.bible != null && this.searchText != null && this.searchText.length >= 3;
	    };
	    SearchComponent = __decorate([
	        core_1.Component({
	            selector: 'search',
	            templateUrl: 'app/components/search.html',
	            providers: [bibler_service_1.BiblerService, bible_service_1.BibleService, book_service_1.BookService, testament_service_1.TestamentService, verse_service_1.VerseService, search_service_1.SearchService]
	        }), 
	        __metadata('design:paramtypes', [bibler_service_1.BiblerService, bible_service_1.BibleService, testament_service_1.TestamentService, book_service_1.BookService, verse_service_1.VerseService, search_service_1.SearchService])
	    ], SearchComponent);
	    return SearchComponent;
	}(bibleBased_component_1.BibleBasedComponent));
	exports.SearchComponent = SearchComponent;


/***/ },

/***/ 284:
/***/ function(module, exports, __webpack_require__) {

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
	var core_1 = __webpack_require__(22);
	var http_1 = __webpack_require__(226);
	__webpack_require__(275);
	var bibler_service_1 = __webpack_require__(273);
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
	        return this.http.post(url, args, { headers: headers }).map(function (res) { return res.json(); });
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


/***/ }

});