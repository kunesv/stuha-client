let buttons = {
    CLICK: 'data-click',
    CLICKED_CLASSNAME: 'clicked',
    CLICKED_ANIMATION_DURATION: 300,

    init: (btns) => {
        for (let i = 0; i < btns.length; i++) {
            let button = btns[i];

            button.addEventListener('mousedown', () => {
                button.classList.add(buttons.CLICKED_CLASSNAME);
            });

            button.addEventListener('mouseup', () => buttons.click(button));


            // button.addEventListener('mouseleave', () => {
            //     button.classList.remove('clicked');
            // });
        }
    },

    click: (button) => {
        setTimeout(() => {
            button.classList.remove(buttons.CLICKED_CLASSNAME);

            if (button.hasAttribute(buttons.CLICK)) {
                window[button.getAttribute(buttons.CLICK)](button);
            }
        }, buttons.CLICKED_ANIMATION_DURATION);
    }

};