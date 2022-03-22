import { BACKEND_PORT } from "./config.js";
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl, popupError, apiCall } from "./helpers.js";

import { toggleScreenWelcome } from "./welcome.js";

const register = (email, password, name) => {
    return apiCall("auth/register", "POST", {
        email,
        password,
        name,
    });
};

document.getElementById("register-btn").addEventListener("click", () => {
    const registerEmail = document.getElementById("register-email").value;
    const registerName = document.getElementById("register-name").value;
    const registerPassword = document.getElementById("register-password").value;
    const registerPasswordConfirm = document.getElementById("register-password-confirm").value;
    
    if (registerPassword !== registerPasswordConfirm) {
        popupError("Passwords don't match"); // TODO
        return;
    }

    register(registerEmail, registerPassword, registerName).then((body) => {
        localStorage.setItem("authToken", body.token);
        localStorage.setItem("authUserId", body.userId);
        toggleScreenWelcome();
    }).catch((err) => {
        popupError(err);
    });
});

const toggleScreenRegister = () => {
    document.getElementById("screen-register").style.display = "block";
    document.getElementById("nav-register").style.backgroundColor = "rgb(" + 247 + "," + 238 + "," + 197 + ")";
    document.getElementById("screen-login").style.display = "none";
    document.getElementById("nav-login").style.backgroundColor = "white";
    document.getElementById("screen-welcome").style.display = "none";
};
    
document.getElementById("nav-register").addEventListener("click", toggleScreenRegister);
