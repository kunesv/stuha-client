function Swipe(element) {
    let start = 0;

    element.addEventListener('touchstart', (event) => {
        let touches = event.changedTouches;

        start = touches[0].clientX;
    });


    element.addEventListener('touchmove', (event) => {
        let touches = event.changedTouches;

        let current = touches[0].clientX;

        if (current - start > 50) {
            event.preventDefault();

            element.classList.add('swiping');
            element.style.transform = 'translate3d(' + 0.5 * (current - start) + 'px,0,0)';
        }
    });

    element.addEventListener('touchend', (event) => {
        let touches = event.changedTouches;

        let current = touches[0].clientX;

        element.removeAttribute('style');
        element.classList.remove('swiping');

        if (current - start > 100) {
            Conversations.menu.toggle(document.querySelector('.menu-button .button'));

            event.preventDefault();
        }
    });
}