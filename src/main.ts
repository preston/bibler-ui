/// <reference path="../node_modules/angular2/typings/browser.d.ts" />

import {bootstrap} from 'angular2/platform/browser';
import {HTTP_PROVIDERS} from 'angular2/http';
import {ROUTER_PROVIDERS} from 'angular2/router';
import {enableProdMode} from 'angular2/core';

// Custom app stuff.
import {BiblerUiApp} from './app/bibler-ui';
enableProdMode();
bootstrap(BiblerUiApp, [HTTP_PROVIDERS, ROUTER_PROVIDERS])
  	.catch(err => console.error(err));


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
