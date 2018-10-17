const Ranicek = {
    dialog: {
        show: (button) => {
            document.querySelector('.ranicek-dialog').classList.add('active');
            Ranicek.dialog.loadStandings().then((standings) => {

                let list = document.querySelector('.ranicek-dialog ol');
                list.innerHTML = '';

                for (let i = 0; i < standings.length; i++) {
                    let standing = standings[i];
                    list.insertAdjacentHTML('beforeEnd', `<li>${standing.userName}: ${standing.count}</li>`);
                }

            });
        },
        hide: () => {
            document.querySelector('.ranicek-dialog').classList.remove('active');
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