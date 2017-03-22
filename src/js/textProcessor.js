var TextProcessor = {
    constants: {
        reservedCharacters: ';,/?:@%&=+$',
        unescapedCharacters: 'a-z0-9_.!~*()\\[\\]#-',
        brackets: [{left: '(', right: ')'}, {left: '[', right: ']'}, {right: ','}, {right: '.'}, {right: ';'}],
        endings: '[.,;?]$'
    },
    paragraphs: (item) => {
        let paragraphs = item.text.split('\n');
        let paragraphContents = [];

        for (let p in paragraphs) {
            let paragraph = paragraphs[p];
            let p = document.createElement('p');
            item.element.appendChild(p);

            paragraphContents.push({'element': p, text: paragraph});
        }
        return paragraphContents;
    },
    links: (item) => {
        let textChunks = [];

        let text = item.text;
        let element = item.element;

        let re = new RegExp('https?://([a-z0-9.-]+\\.[a-z]+)(/)?([' + TextProcessor.constants.reservedCharacters + TextProcessor.constants.unescapedCharacters + ']*)', 'gi');
        let link = re.exec(text);

        let firstChunk = link ? text.substring(0, link.index) : text;
        let span = document.createElement('span');
        element.appendChild(span);
        textChunks.push({'element': span, 'text': firstChunk});

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
            let span = document.createElement('span');
            element.appendChild(span);
            textChunks.push({'element': span, 'text': lastChunk});
        }

        return textChunks;
    },
    replies: (item) => {
        console.log(item)

//         let reply = item.message.replyTo.shift();
//         if (reply) {
//             let theirChunks = TextProcessor.replies(item);
//             let myChunks = [];
//             for (let i = 0; i < theirChunks.length; i++) {
//                 let theirChunk = theirChunks[i];
//
//                 let index = theirChunk.text.indexOf(reply.key);
//                 if(index !== -1) {
//                     console.log('hmmm')
//                     let firstChunk = item.text.substring(0, index);
//                     let span = document.createElement('span');
//                     item.element.appendChild(span);
//                     myChunks.push({'element': span, 'text': firstChunk});
// console.log(firstChunk)
//                     let a = document.createElement('a');
//                     a.textContent = reply.key;
//                     item.element.appendChild(a);
//
//                     let lastChunk = item.text.substring(index + reply.key.length);
//                     let lastSpan = document.createElement('span');
//                     item.element.appendChild(lastSpan);
//                     myChunks.push({'element': lastSpan, 'text': lastChunk});
//                     console.log(lastChunk)
//                 } else {
//                     myChunks.push(theirChunk);
//                 }
//             }
//             return myChunks;
//         } else {
//             return [item];
//         }
        return [item];
    },
    texts: (item) => {
        item.element.textContent = item.text;
    }
};
