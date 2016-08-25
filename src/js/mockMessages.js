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
let sampleImages = [
    [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
    [{url: 'img1.jpg'}],
    [{url: 'img2.jpg'}],
    [{url: 'img1.jpg'}, {url: 'img2.jpg'}],
    [{url: 'img2.jpg'}, {url: 'img1.jpg'}],
    [{url: 'img1.jpg'}, {url: 'img2.jpg'}, {url: 'img1.jpg'}]
];


let messages = [];
let noOfMessages = Math.random() < .2 ? 0 : 10;
for (let i = 0; i < noOfMessages; i++) {
    let user = sampleUsers[Math.floor(Math.random() * 4)];
    let date = new Date();
    date.setMilliseconds(date.getMilliseconds() - i * 10000000);

    let imagesId = Math.floor(Math.random() * 31);

    messages.push({
        id: i,
        iconPath: user.iconPath,
        userId: user.userId,
        userName: user.userName,
        formatted: imagesId != 30 ? sampleMessages[Math.floor(Math.random() * 5)] : '',
        images: sampleImages[imagesId],
        createdOn: date
    });
}
messages.reverse();

setTimeout(messagesLoadResult, Math.round(Math.random() * 1500));

function userIcons() {
    return [{url: '3_1'}, {url: '3_4'}, {url: '3_1'}, {url: '3_4'}];
}