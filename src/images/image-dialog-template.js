const imageDialogTemplate = () => {
    return `<section class="overlay image-dialog">
    <main>
        <span class="close-button"><a class="translucent button" data-click="Messages.images.dialog.hide"></a></span>
        <span class="previous-button"><a class="translucent button" data-click="Messages.images.dialog.previous"></a></span>
        <span class="next-button"><a class="translucent button" data-click="Messages.images.dialog.next"></a></span>
        <section></section>
    </main>
</section>`;
};
