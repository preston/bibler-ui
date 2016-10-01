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
//# sourceMappingURL=bibleBased.component.js.map