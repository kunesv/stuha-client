var WebSock= {
    client: null,
    init: () => {
        WebSock.client = Stomp.client(`ws${location.protocol.indexOf('s') !== -1 ? 's' : ''}://${location.host}/api/ws`);

        WebSock.client.connect(Users.currentUser.userId, Users.currentUser.token, (frame) => {
            console.log('Connected to websocket.', frame);

            WebSock.client.subscribe('message', function(message) {
                console.log('Subscribed to message',"<p>" + message.body + "</p>\n");
            });
        });

        // WebSock.client.onmessage = (event) => {
        //     let data = JSON.parse(event.data);
        //     switch (data.type) {
        //         case 'NEW_MESSAGE':
        //             Messages.loadNew(data.messageId);
        //             break;
        //         case 'STATUS':
        //             console.debug(data.title);
        //             break;
        //     }
        // }
    }
};