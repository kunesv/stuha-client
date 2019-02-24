const userMenuTemplate = () => {
    return `<section class="overlay user-menu">
    <header>
        <span class="close-button"><a class="secondary button" data-click="Users.menu.hide"></a></span>
    </header>
    <ul class="menu">
        <li><a class="light button" data-click="ChangePassword.dialog.show">Změnit heslo</a></li>
        <li><a class="logout secondary button" data-click="Login.logout">Odhlásit se</a></li>
    </ul>
</section>`;
};