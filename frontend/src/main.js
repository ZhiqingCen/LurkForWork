import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';



const registerBtn = document.getElementById("register-btn");
registerBtn.addEventListener("click", () => {
    const registerEmail = document.getElementById("register-email").value;
    const registerName = document.getElementById("register-name").value;
    const registerPassword = document.getElementById("register-password").value;
    const registerPasswordConfirm = document.getElementById("register-password-confirm").value;
    
    if (registerPassword !== registerPasswordConfirm) {
        alert("Passwords don't match");
        return;
    }

    const requestBody = {
        email: registerEmail,
        password: registerPassword,
        name: registerName,
    };

    const init = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    };

    fetch(`http://localhost:${BACKEND_PORT}/auth/register`, init)
        .then(response => response.json())
        .then(body => {
            if (body.error) {
                alert(body.error);
            } else {
                console.log(`body is ${body}`);
            }
        });

    console.log("register");
});