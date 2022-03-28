import { popupError, apiCall } from "./helpers.js";
import { toggleScreenWelcome } from "./welcome.js";

//------------------------------------//
//----------- registration -----------//
//------------------------------------//

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
        localStorage.setItem("authPassword", registerPassword);
        localStorage.setItem("authEmail", registerEmail);
        localStorage.setItem("authName", registerName);
        toggleScreenWelcome();
    }).catch((err) => {
        popupError(err);
    });
});

const toggleScreenRegister = () => {
    document.getElementById("screen-register").style.display = "block";
    document.getElementById("nav-register").style.backgroundColor = "rgb(" + 245 + "," + 223 + "," + 228 + ")";
    document.getElementById("screen-login").style.display = "none";
    document.getElementById("nav-login").style.backgroundColor = "white";
    document.getElementById("screen-welcome").style.display = "none";
};
    
document.getElementById("nav-register").addEventListener("click", toggleScreenRegister);
