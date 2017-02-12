var Textarea = {
    resize: (textarea) => {
        textarea.style.height = 'auto';
        setTimeout(() => {
            textarea.style.height = textarea.scrollHeight + 'px';
        }, 1);

    }
};