let Layout = {
    clean: () => {
        let content = document.querySelector('.content');
        content.classList.remove('dialog');
        content.innerHTML = '';

        let dialogs = document.querySelectorAll('body > section');

        for (let i = 0; i < dialogs.length; i++) {
            dialogs[i].classList.remove('active');
            // dialogs[i].style.zIndex = 10000;
            // setTimeout(() => {
            document.body.removeChild(dialogs[i]);
            // }, 300);
        }
    }
};