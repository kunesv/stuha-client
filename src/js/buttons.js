let buttons = {
    CLICK: 'data-click',
    CLICKED_CLASSNAME: 'clicked',
    CLICKED_ANIMATION_DURATION: 100,

    init: (btns) => {
        for (let i = 0; i < btns.length; i++) {
            let button = btns[i];

            button.addEventListener('mousedown', () => {
                button.classList.add(buttons.CLICKED_CLASSNAME);
            });

            button.addEventListener('mouseup', (event) => buttons.click(button, event));


            button.addEventListener('mouseleave', () => {
                button.classList.remove('clicked');
            });
        }
    },

    click: (button, event) => {
        event.stopPropagation();
        setTimeout(() => {
            button.classList.remove(buttons.CLICKED_CLASSNAME);

            if (button.hasAttribute(buttons.CLICK)) {
                window[button.getAttribute(buttons.CLICK)](button);
            }
        }, buttons.CLICKED_ANIMATION_DURATION);
    }

};