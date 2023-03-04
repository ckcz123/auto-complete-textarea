function autoComplete() {
    const textarea =
        document.querySelector('textarea#textarea');

    let awesomplete = new Awesomplete(textarea, {
        minChars: 1,
        maxItems: 12,
        autoFirst: true,
        filter: function () {
            return true;
        },
        item: function (text, input) {
            let id = text.label;
            let li = document.createElement('li');
            li.setAttribute('role', 'option');
            li.setAttribute('aria-selected', 'false');
            input = awesomplete.prefix.trim();
            if (input != '')
                text = text.replace(new RegExp('^' + input, 'i'), '<mark>$&</mark>');
            li.innerHTML = text;
            return li;
        },
        replace: function (text) {
            text = text.toString();
            let value = this.input.value, index = this.input.selectionEnd;
            if (index == null) index = value.length;
            if (index < awesomplete.prefix.length) index = awesomplete.prefix.length;
            let str = value.substring(0, index - awesomplete.prefix.length) + text +
                value.substring(index);
            this.input.value = str;
            index += text.length - awesomplete.prefix.length;
            this.input.setSelectionRange(index, index);
        },
    });
    awesomplete.container.style.width = '100%';
    awesomplete.ul.style.minWidth = 'auto';

    let getAutoCompletions = function (value, prefix) {
        prefix = prefix.trim();
        if (prefix.length == 0) return [];
        // TODO: Return dynamic list here.
        return [
            prefix + '_this_is_word_complete',
            prefix + '_this_is_word_complete',
            prefix + '_this_is_word_complete',
            prefix + '_this_is_word_complete',
        ];
    };

    textarea.oninput = function () {
        let value = textarea.value,
            index = textarea.selectionEnd;
        if (index == null) index = value.length;
        value = value.substring(0, index);
        // cal prefix
        awesomplete.prefix = value;
        for (let i = index - 1; i >= 0; i--) {
            let c = value.charAt(i);
            if (!/^\w$/.test(c)) {
                awesomplete.prefix = value.substring(i + 1);
                break;
            }
        }

        const list = getAutoCompletions(value, awesomplete.prefix);

        awesomplete.list = list;

        const caretPosition = getCaretCoordinates(
            textarea, textarea.selectionStart);
        awesomplete.ul.style.marginLeft =
            caretPosition.left - textarea.scrollLeft - 20 + 'px';
        const totalHeight =
            parseFloat(textarea.style.height.replace('px', ''));
        awesomplete.ul.style.marginTop =
            caretPosition.top + caretPosition.height - totalHeight + 10 + 'px';
        awesomplete.evaluate();
        console.log('margin-left: ' + awesomplete.ul.style.marginLeft + '; margin-top: ' + awesomplete.ul.style.marginTop);
    };

    console.log(awesomplete);
}

chrome.tabs.onUpdated.addListener(async function (tabId, info, tab) {
    if (info.status == 'complete' &&
        tab.url.includes('https://h5mota.com/test.html')) {
        await chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ['awesomplete.css'],
        });

        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['caret_position.js'],
            world: 'MAIN',
        });
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['awesomplete.js'],
            world: 'MAIN',
        });
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: autoComplete,
            world: 'MAIN',
        });
    }
});



