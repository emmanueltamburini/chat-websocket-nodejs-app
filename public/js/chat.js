const url = 'http://localhost:8080/api/auth';

const uid = document.querySelector('#uid');
const message = document.querySelector('#message');
const users = document.querySelector('#users');
const messages = document.querySelector('#messages');
const logout = document.querySelector('#logout');

let user = null;
let socket = null;

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

    socket.on('receive-message', () => {
        
    });

    socket.on('user-connected', showUsers);

    socket.on('receive-private-message', () => {
        
    });
}

const showUsers = (usersConnected = []) => {
    let userHTML = '';

    usersConnected.forEach(({name, uid}) => {
      userHTML += `
        <li>
            <p>
                <h5 class="text-success">
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

const main = async () => {
    await validateJWT();
}

logout.onclick = () => {
    socket.disconnect();

    google.accounts.id.disableAutoSelect();

    google.accounts.id.revoke(localStorage.getItem('email'), done => {
        localStorage.clear();
        window.location = 'index.html';
    });
}

main();
