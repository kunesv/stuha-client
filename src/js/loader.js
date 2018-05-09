Users.init();


document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        if (Users.signedIn) {
            Conversations.reload();
            console.log('relpas')
        }
        // alert(document.visibilityState);
    }
});