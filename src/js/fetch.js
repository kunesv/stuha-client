var Fetch = {
    processFetchStatus: (response) => {
        if (response.status === 200) {
            return Promise.resolve(response);
        } else if (response.status === 403) {
            Login.dialog.add();
        } else {
            return Promise.reject(response);
        }
    },
    headers: () => {
        return {
            'Accept': 'application/json',
            'userId': Users.currentUser.userId,
            'token': Users.currentUser.token
        };
    }
};