var Textarea = {
    MIN_HEIGHT: 50,

    resize: (textarea) => {
        textarea.style.height = 'auto';
        let scroll = textarea.scrollHeight;
        if (scroll < Textarea.MIN_HEIGHT) {
            scroll = Textarea.MIN_HEIGHT;
        }

        textarea.style.height = scroll + 'px';
    },
    reset: (textarea) => {
        setTimeout(() => {
            textarea.style.height = 'auto';

            setTimeout(() => {
                let scroll = textarea.scrollHeight;

                if (scroll < Textarea.MIN_HEIGHT) {
                    scroll = Textarea.MIN_HEIGHT;
                }

                textarea.style.height = scroll + 'px';
            }, 100)
        }, 100);
    }
};