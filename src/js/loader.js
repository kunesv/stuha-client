Users.init();


document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        if (Users.signedIn) {
            Conversations.reload();

        }
        // alert(document.visibilityState);
    }
});