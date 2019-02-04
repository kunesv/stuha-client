Users.init();


document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        if (Users.signedIn) {
            document.querySelector('.menu-button .button').classList.add('loading');
            setTimeout(() => {
                Conversations.reload();
            }, 300);
        }
        // alert(document.visibilityState);
    }
});