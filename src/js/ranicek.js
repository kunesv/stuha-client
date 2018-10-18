const Ranicek = {
    dialog: {
        template: (standing, position) => {
            return `<li>
    <span style="background-image: url(images/icons/${standing.iconPath})"></span>
    <span>${standing.userName}</span>
    <span>${standing.count} (${position}.)</span>
    <span></span>
</li>`;
        },

        show: (button) => {
            document.querySelector('.ranicek-dialog').classList.add('active');
            document.querySelector('.content').classList.add('dialog');

            Ranicek.dialog.loadStandings().then((standings) => {

                let list = document.querySelector('.ranicek-dialog ol');
                list.innerHTML = '';


                for (let i = 0, position = 1, maxCount = 0; i < standings.length; i++) {
                    let standing = standings[i];

                    if (i === 0) {
                        maxCount = standing.count;
                    }

                    if (i > 0 && standing.count !== standings[i - 1].count) {
                        position = i + 1;
                    }
                    list.insertAdjacentHTML('beforeEnd', Ranicek.dialog.template(standing, position));
                    list.querySelector('li:last-child span:last-child').style.width = (standing.count / maxCount * 50) + '%';
                    console.log(standing.count / maxCount)
                }

            });
        },
        hide: () => {
            document.querySelector('.ranicek-dialog').classList.remove('active');
            document.querySelector('.content').classList.remove('dialog');
        },
        loadStandings: () => {
            return fetch(`/api/ranicek/overall/${Conversations.lastConversation.conversation.id}`, {
                headers: Fetch.headers()
            }).then(Fetch.processFetchStatus).then((response) => {
                return response.json();
            });
        }
    }
};