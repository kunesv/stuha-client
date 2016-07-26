// TEST DATA preparation

let currentUser = {userId: 2, userName: 'Houba'};

let sampleMessages = [
    'Tady scanuju celej byt.',
    'Houba si balí na čundr: dva obří spacáky po prababičce a další pravou zálesáckou výbavu. Počítám, že asi tak po půl kilometru omdlí pod tou vahou únavou a povezete ho k tábořišti na kárce.',
    'S Jendou případně jel já.',
    'Já to včera u vás viděl, slušná nálož. Má aspoň ten bráchuv batoh? Kárku teda budeme muset vyrobit, asi z kulatin a klacků. :-)',
    'Pche, to je všecko jen vzduch. To se nese samo.'
];
let sampleUsers = [
    {
        iconPath: '20_1',
        userId: 20,
        userName: 'Mokl'
    },
    {
        iconPath: '3_4',
        userId: 3,
        userName: 'Sovička'
    },
    {
        iconPath: '3_1',
        userId: 3,
        userName: 'Sovička'
    },
    {
        iconPath: '2_2',
        userId: 2,
        userName: 'Houba'
    }
];


let messages = [];
for (let i = 0; i < 10; i++) {
    let user = sampleUsers[Math.floor(Math.random() * 4)];
    let date = new Date();
    date.setMilliseconds(date.getMilliseconds() - i * 10000000);

    messages.push({
        id: i,
        iconPath: user.iconPath,
        userId: user.userId,
        userName: user.userName,
        formatted: sampleMessages[Math.floor(Math.random() * 5)],
        image: Math.random() > .8 ? 'img' + Math.ceil(Math.random() * 2) + '.jpg' : false,
        createdOn: date
    });
}
messages.reverse();


for (let i in messages) {
    let message = messages[i];

    let messageTemplate =
        `<article class="${currentUser.userId == message.userId ? 'my' : ''}" data-id="${message.id}" data-date="${formatDate(message.createdOn)}">
            <header>
                <h1><img src="/images/${message.iconPath}.png" /></h1>
            </header>
            <main>          
                ${image(message.image)}
                
                <section>
                    <p><b>${message.userName}:</b> ${message.formatted}</p>
                    <footer>${formatDate(new Date()) != formatDate(message.createdOn) ? formatDate(message.createdOn) + ',' : ''} <b>${formatTime(message.createdOn)}</b></footer>
                </section>
            </main>
        </article>`;


    if (document.getElementsByClassName('messages')[0].firstChild
        && document.getElementsByClassName('messages')[0].firstChild.hasAttribute('data-date')
        && document.getElementsByClassName('messages')[0].firstChild.getAttribute('data-date') != formatDate(message.createdOn)) {
        document.getElementsByClassName('messages')[0].insertAdjacentHTML('afterbegin', separator(document.getElementsByClassName('messages')[0].firstChild.getAttribute('data-date')));
    }


    document.getElementsByClassName('messages')[0].insertAdjacentHTML('afterbegin', messageTemplate);
}


function image(image) {
    let imageTemplate = `<section class="image" style="background-image: url('/images/${image}')"></section>`;

    return image ? imageTemplate : '';
}

function separator(createdOn) {
    return `<div class="seperator"><span><b>${createdOn}</b></div>`;
}


function formatDate(date) {
    let dayNames = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];


    return dayNames[date.getDay()] + ' ' + date.getDate() + '.' + (date.getMonth() + 1) + '. ' + date.getFullYear();
}

function formatTime(date) {


    return ('0' + date.getHours()).slice(-2) + '.' + ('0' + date.getMinutes()).slice(-2);
}