const url = ( window.location.hostname.includes('localhost') )
            ? 'http://localhost:8080/api/auth'
            : 'https://chat-websocket-nodejs-app-production.up.railway.app/api/auth';

const uid = document.querySelector('#uid');
const message = document.querySelector('#message');
const users = document.querySelector('#users');
const messages = document.querySelector('#messages');
const logout = document.querySelector('#logout');
const privateMessage = document.querySelector('#privateMessage');

let user = null;
let socket = null;
let color = null;

const validateJWT = async () => {
    const token = localStorage.getItem('token') || '';

    if (token.length <= 10) {
        window.location = 'index.html';
        localStorage.clear();
        throw new Error('You are not permission for this page');
    }

    try {
        const response = await fetch(url, {
            headers: {'x-token': token}
        });
    
        const { user: userDB, token: tokenDB } = await response.json();
    
        localStorage.setItem('email', userDB.email);
        localStorage.setItem('token', tokenDB);
        user = userDB;
        color = '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
        document.title = userDB.name;

        await connectSocket();
    } catch (error) {
        console.log(error);
        window.location = 'index.html';
        localStorage.clear();
    }
}

const connectSocket = async () => {
    socket = io({
        extraHeaders: {
            'x-token': localStorage.getItem('token')
        }
    });

    socket.on('connect', () => {
        console.log('Socket online');
    });

    socket.on('disconnect', () => {
        console.log('Socket offline');
    });

    socket.on('receive-message', showMessages);

    socket.on('user-connected', showUsers);

    socket.on('receive-private-message', showPrivateMessage);
}

const showUsers = (usersConnected = []) => {
    let userHTML = '';

    usersConnected.forEach(({name, uid}) => {
      userHTML += `
        <li>
            <p>
                <h5 style="color:${uid === user.uid ? 'blue' : color};">
                    ${name}
                </h5>
                <span class="fs-6 text-muted">
                    ${uid}
                </span>
            </p>
        </li>
       `
    });

    users.innerHTML = userHTML;
}

const showMessages = (messagesFromServer = []) => {
    let messagesHTML = '';

    messagesFromServer.forEach(({uid, name, message: messageFromServer}) => {
        messagesHTML += `
        <li>
            <p>
                <span style="color:${uid === user.uid ? 'blue' : color};">
                    ${name}:
                </span>
                <span>
                    ${messageFromServer}
                </span>
            </p>
        </li>
       `
    });

    messages.innerHTML = messagesHTML;
}

const showPrivateMessage = (privateMessageFromServer) => {
    const {from, message: messageFromServer} = privateMessageFromServer;
    let privateMessageHTML = '';

    privateMessageHTML += `
        <li>
            <p>
                <span style="color:${uid === user.uid ? 'blue' : color};">
                    ${from}:
                </span>
                <span>
                    ${messageFromServer}
                </span>
            </p>
        </li>
       `;

    privateMessage.innerHTML = privateMessageHTML;
}

const main = async () => {
    await validateJWT();
}

message.addEventListener('keyup', ({keyCode}) => {
    if(keyCode !== 13) return;

    const currentMessage = message.value.trim();
    const currentUid = uid.value.trim();

    if(currentMessage.length === 0) return;

    const payload = {
        message: currentMessage,
        uid: currentUid
    }

    socket.emit('send-message', payload);

    message.value = '';
});

logout.onclick = () => {
    socket.disconnect();

    google.accounts.id.disableAutoSelect();

    google.accounts.id.revoke(localStorage.getItem('email'), done => {
        localStorage.clear();
        window.location = 'index.html';
    });
}

main();
