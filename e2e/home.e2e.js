describe('angularjs homepage', function() {

    beforeEach(function() {
        browser.get('#/home');
    });

    it('should support navigation to all tabs and API', function() {
        expect(browser.getTitle()).toContain('Bibler');
        var reader = element(by.css('#reader_tab_link'));
        var comparator = element(by.css('#comparator_tab_link'));
        var search = element(by.css('#search_tab_link'));

        expect(reader.getText()).toContain('Reader');
        expect(comparator.getText()).toContain('Comparator');
        expect(search.getText()).toContain('Search');

        // reader.click()
        comparator.click();
        search.click();
        expect(element(by.css('search input[type="search"]')).getText()).toBe('');

        element(by.id('api_page_link')).click();

        expect(element(by.css('h2')).getText()).toContain('Developer');
    });

    // it('should switch bible translations', function() {
    //     var bibles = element.all(by.css('#bible_select option'));
    //     browser.wait(function() {
    //         return bibles.then(function() {
    //             expect(bibles.count()).toBeGreaterThan(2);
    //             return true; // causes the wait to end
    //         });
    //     }, 1000);
    //
    //     var b = element(by.cssContainingText('reader option', 'Bible in Basic English'));
    //     b.click();
    //     browser.wait(function() {
    //         var first = element.all(by.cssContainingText('reader tbody td', 'At the first God made the heaven and the earth.'))
    //         return first.then(function() {
    //             return true;
    //         });
    //     }, 1000);
    // });
});
