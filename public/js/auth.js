const form = document.querySelector('form');

const url = 'http://localhost:8080/api/auth';

form.addEventListener('submit', event => {
    event.preventDefault();
    const formData =  {};

    for(let element of form.elements) {
        if (element.name.length > 0) {
            formData[element.name] = element.value;
        }
    }

    fetch(url + '/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(response => {
            if (response.msg) {
                return console.error(response.msg);
            }
            if (response.errors) {
                return console.error(response.errors);
            }
            localStorage.setItem('email', response.user.email);
            localStorage.setItem('token', response.token);
            location.reload();
        })
        .catch(console.warn);
});

function handleCredentialResponse(response) {
    // Google token : ID Token
    const body = {id_token: response.credential}
    fetch(url + '/google', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
        .then(response => response.json())
        .then(response => {
            localStorage.setItem('email', response.user.email);
            localStorage.setItem('token', response.token);
            location.reload();
        })
        .catch(console.warn);
}

const button = document.getElementById('google_sign_out');

button.onclick = () => {
    google.accounts.id.disableAutoSelect();

    google.accounts.id.revoke(localStorage.getItem('email'), done => {
        localStorage.clear();
        location.reload();
    });
}