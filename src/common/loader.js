Users.init();

/**
 * Put All Loader stuff here.
 * Pages
 * 1. Login
 * - display form
 *
 * 2. Messages
 * - load user
 * - load conversations
 * - set active conversation
 * - load messages
 *
 * Dialogs
 * - init on 1st use
 *
 *
 * Periodic
 * ? WebSocket ?
 */

//
//
//

if (new Date().getHours() >= 22 || new Date().getHours() < 5) {
    document.body.classList.add('dark');
}


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