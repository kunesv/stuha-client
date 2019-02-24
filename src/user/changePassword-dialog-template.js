const changePasswordDialogTemplate = () => {

    return `<section class="overlay changePassword-dialog">
    <header>
        <span class="close-button"><a class="secondary button" data-click="ChangePassword.dialog.hide"></a></span>
    </header>
    <form data-click="ChangePassword.submitForm">       
        <section>           
            <label>Současné heslo</label>
            <input name="password" type="password"/>                
            <p>
                <span class="error">Sem přijde současné heslo.</span>
            </p>      
        </section>     
        <section>           
            <label>Nové heslo</label>
            <input name="newPassword" type="password"/>                
            <p>
                <span class="error">Tu vložit nové heslo.</span>
            </p>      
        </section>
        <section class="button-row">
            <button type="submit"></button>
        </section>                
    </form>
</section>
`;

};