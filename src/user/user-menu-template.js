const userMenuTemplate = () => {
    return `<section class="overlay user-menu">
    <header>
        <span class="close-button"><a class="secondary button" data-click="Users.menu.hide"></a></span>
    </header>
    <main>       
        <a class="logout secondary button" data-click="Login.logout">Logout</a>
    </main>
</section>`;
};