var TextProcessor = {
    constants: {
        reservedCharacters: ';,/?:@%&=+$',
        unescapedCharacters: 'a-z0-9_.!~*()\\[\\]#-',
        brackets: [{left: '(', right: ')'}, {left: '[', right: ']'}, {right: ','}, {right: '.'}, {right: ';'}],
        endings: '[.,;?]$'
    },
    process: (items)=> {
        items.map(TextProcessor.paragraphs).reduce((a, b) => a.concat(b)).map(TextProcessor.links);
    },
    paragraphs: (item) => {
        let paragraphs = item.text.split('\n');
        let items = [];

        for (let p in paragraphs) {
            let paragraph = paragraphs[p];
            let element = document.createElement('p');
            item.element.appendChild(element);

            items.push({'element': element, text: paragraph});
        }
        return items;
    },
    links: (item)=> {
        let text = item.text;
        let element = item.element;

        let re = new RegExp('https?://([a-z0-9.-]+\\.[a-z]+)(/)?([' + TextProcessor.constants.reservedCharacters + TextProcessor.constants.unescapedCharacters + ']*)', 'gi');
        let link = re.exec(text);

        let firstChunk = link ? text.substring(0, link.index) : text;
        element.insertAdjacentText('beforeEnd', firstChunk);

        while (link) {
            let url = link[0];
            let title = link[1];
            let i = re.lastIndex;

            if (new RegExp(TextProcessor.constants.endings).test(url)) {
                url = url.substr(0, url.length - 1);
                i = i - 1;
            }
            for (let b in TextProcessor.constants.brackets) {
                let bracket = TextProcessor.constants.brackets[b];
                if (link.index > 0 && url.endsWith(bracket.right) && (bracket.left === undefined || text.substr(link.index - 1, 1) === bracket.left)) {
                    url = url.substr(0, url.length - 1);
                    i = i - 1;
                    break;
                }
            }

            if (link[3] && link[3].length > 2) {
                title += '/…';
            }

            let a = document.createElement('a');
            a.href = encodeURI(url);
            a.textContent = title;
            element.appendChild(a);

            link = re.exec(text);
            let lastChunk = text.substring(i, link ? link.index : text.length);
            element.insertAdjacentText('beforeEnd', lastChunk);
        }
    }
};
