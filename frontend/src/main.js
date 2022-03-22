import { BACKEND_PORT } from "./config.js";
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl, popupError } from "./helpers.js";

let authToken = null;
let authUserId = null;

const apiCall = (path, httpMethod, requestBody) => {
    return new Promise((resolve, reject) => {
        const init = {
            method: httpMethod,
            headers: {
                "Content-Type": "application/json",
                Authorization: (path === "auth/register" || path === "auth/login") ? undefined : authToken,
            },
            body: httpMethod === "GET" ? undefined : JSON.stringify(requestBody),
        };
    
        fetch(`http://localhost:${BACKEND_PORT}/${path}`, init)
            .then(response => response.json())
            .then(body => {
                if (body.error) {
                    // alert(body.error); // TODO
                    // reject(body.error);
                    popupError(body.error); // TODO
                } else {
                    resolve(body);
                }
            });
            // .catch((message) => {
            //     alert(message);
            // });
    });
}

const register = (email, password, name) => {
    return apiCall("auth/register", "POST", {
        email,
        password,
        name,
    });
};

const login = (email, password) => {
    return apiCall("auth/login", "POST", {
        email,
        password,
    });
};

const getProfile = (userId) => {
    return apiCall(`user?userId=${userId}`, "GET", {});
};

document.getElementById("register-btn").addEventListener("click", () => {
    const registerEmail = document.getElementById("register-email").value;
    const registerName = document.getElementById("register-name").value;
    const registerPassword = document.getElementById("register-password").value;
    const registerPasswordConfirm = document.getElementById("register-password-confirm").value;
    
    if (registerPassword !== registerPasswordConfirm) {
        alert("Passwords don't match");
        return;
    }

    register(registerEmail, registerPassword, registerName).then((body) => {
        authToken = body.token;
        authUserId = body.userId;
        toggleScreenWelcome();
    });
    // .catch((message) => {
    //     alert(message);
    // });
});

document.getElementById("login-btn").addEventListener("click", () => {
    const loginEmail = document.getElementById("login-email").value;
    const loginPassword = document.getElementById("login-password").value;
    
    login(loginEmail, loginPassword).then((body) => {
        authToken = body.token;
        authUserId = body.userId;
        toggleScreenWelcome();
    });
    // .catch((message) => {
    //     alert(message);
    // });
});

const toggleScreenRegister = () => {
    document.getElementById("screen-register").style.display = "block";
    document.getElementById("screen-login").style.display = "none";
    document.getElementById("screen-welcome").style.display = "none";
};

const toggleScreenLogin = () => {
    document.getElementById("screen-login").style.display = "block";
    document.getElementById("screen-register").style.display = "none";
    document.getElementById("screen-welcome").style.display = "none";
};

const toggleScreenWelcome = () => {
    document.getElementById("screen-welcome").style.display = "block";
    document.getElementById("screen-register").style.display = "none";
    document.getElementById("screen-login").style.display = "none";
    getProfile(authUserId).then((body) => {
        document.getElementById("user-json").innerText = JSON.stringify(body);
    });
    // .catch((message) => {
    //     alert(message);
    // });
};
    
document.getElementById("nav-register").addEventListener("click", toggleScreenRegister);
document.getElementById("nav-login").addEventListener("click", toggleScreenLogin);
