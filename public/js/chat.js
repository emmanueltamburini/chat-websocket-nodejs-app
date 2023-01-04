const url = 'http://localhost:8080/api/auth';

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
}

const main = async () => {
    await validateJWT();
}

main();
