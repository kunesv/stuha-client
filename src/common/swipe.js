function Swipe(element, previous, next) {
    let startX = 0;
    let startY = 0;
    let scrolling;
    let swiping;

    element.addEventListener('touchstart', (event) => {
        let touches = event.changedTouches;


        startX = touches[0].clientX;
        startY = touches[0].clientY;
        scrolling = false;
        swiping = false;
    });


    element.addEventListener('touchmove', (event) => {
        let touches = event.changedTouches;

        let currentX = touches[0].clientX;
        let currentY = touches[0].clientY;
        if (!swiping && Math.abs(currentY - startY) > 10) {
            scrolling = true;
        }

        if (!scrolling && Math.abs(currentX - startX) > 10) {
            swiping = true;

            event.preventDefault();

            element.classList.add('swiping');
            element.style.transform = `translate(${currentX - startX}px,0)`;
        }
    });

    element.addEventListener('touchend', (event) => {
        let touches = event.changedTouches;

        let current = touches[0].clientX;

        element.classList.remove('swiping');
        element.removeAttribute('style');

        if (swiping && current - startX > 100) {
            previous();
        }
        if (swiping && current - startX < -100) {
            next();
        }
        event.preventDefault();
    });
}