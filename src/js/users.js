var Users = {
    currentUser: {},
    notifications: {
        poll: true
    },
    init: () => {
        let signedIn = Users.loadFromStorage();
        if (signedIn === 'TRUE') {
            Messages.init();
        } else {
            Login.init();
        }
    },
    saveToken: (token) => {
        Users.currentUser.userId = token.userId;
        Users.currentUser.token = token.token;

        Users.saveToStorage();
    },
    refreshToken: (newToken) => {
        Users.currentUser.token = newToken;
        Users.saveToStorage();
    },
    saveToStorage: () => {
        localStorage.setItem('userId', Users.currentUser.userId);
        localStorage.setItem('token', Users.currentUser.token);
        localStorage.setItem('signedIn', 'TRUE');
    },
    loadFromStorage: () => {
        Users.currentUser.userId = localStorage.getItem('userId');
        Users.currentUser.token = localStorage.getItem('token');
        return localStorage.getItem('signedIn');
    },
    clean: () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        localStorage.removeItem('signedIn');

        Users.currentUser = {};
    },
    loadUserDetails: () => {
        return fetch('/api/currentUser', {
            headers: Fetch.headers()
        }).then(Fetch.processFetchStatus).then((response) => {
            return response.json().then((user) => {
                Users.currentUser.userName = user.name;
                Users.currentUser.icons = user.icons;
            });
        });
    },
    menu: {
        show: () => {
            document.querySelector('.content').classList.add('dialog');
            document.querySelector('.user-menu').classList.add('active');
        },
        hide: () => {
            document.querySelector('.content').classList.remove('dialog');
            document.querySelector('.user-menu').classList.remove('active');
        }
    }
};