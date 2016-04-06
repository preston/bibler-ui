import {bootstrap} from 'angular2/platform/browser';
import {BiblerUiApp} from './app/bibler-ui';

import {ServerService} from './app/services/server.service';
import {ChapterService} from './app/services/chapter.service';
import {BookService} from './app/services/book.service';

// bootstrap(BiblerUiApp, []);

// import {Http, ConnectionBackend, RequestOptions} from 'angular2/http';
import {Http} from 'angular2/http';
bootstrap(BiblerUiApp, [Http, ServerService, BookService, ChapterService]);
