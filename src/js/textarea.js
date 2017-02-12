var Textarea = {
    resize: (textarea) => {

        setTimeout(() => {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }, 1);

    }
};