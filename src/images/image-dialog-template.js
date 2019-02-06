const imageDialogTemplate = () => {
    return `<section class="overlay image-dialog">
    <main>
        <span class="close-button"><a class="translucent button" data-click="Messages.image.dialog.hide"></a></span>
        <span class="previous-button"><a class="translucent button" data-click="Messages.image.dialog.previous"></a></span>
        <span class="next-button"><a class="translucent button" data-click="Messages.image.dialog.next"></a></span>
        <section></section>
    </main>
</section>`;
};
