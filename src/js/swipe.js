function Swipe(element, previous, next) {
    let start = 0;

    element.addEventListener('touchstart', (event) => {
        let touches = event.changedTouches;

        start = touches[0].clientX;
    });


    element.addEventListener('touchmove', (event) => {
        let touches = event.changedTouches;

        let current = touches[0].clientX;
        if (Math.abs(current - start) > 50) {
            event.preventDefault();

            element.classList.add('swiping');
            element.style.transform = `translate(${current - start}px,0)`;
        }
    });

    element.addEventListener('touchend', (event) => {
        let touches = event.changedTouches;

        let current = touches[0].clientX;

        element.removeAttribute('style');
        element.classList.remove('swiping');

        if (current - start > 100) {
            previous();
        }
        if (current - start < -100) {
            next();
        }
        event.preventDefault();
    });
}