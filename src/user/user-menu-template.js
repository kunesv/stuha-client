const userMenuTemplate = () => {
    return `<section class="overlay user-menu">
    <header>
        <span class="close-button"><a class="secondary button" data-click="Users.menu.hide"></a></span>
    </header>
    <ul class="compact menu">
        <li class="editable change-password"><a class="light button" data-click="ChangePassword.dialog.toggle"></a></li>
    </ul>
    <ul class="menu">
        <li><a class="logout secondary button" data-click="Login.logout">Odhlásit se</a></li>
    </ul>
</section>`;
};