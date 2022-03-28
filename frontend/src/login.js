import { popupError, apiCall } from "./helpers.js";
import { toggleScreenWelcome } from "./welcome.js";

//----------------------------------//
//----------- user login -----------//
//----------------------------------//

const login = (email, password) => {
    return apiCall("auth/login", "POST", {
        email,
        password,
    });
};

document.getElementById("login-btn").addEventListener("click", () => {
    const loginEmail = document.getElementById("login-email").value;
    const loginPassword = document.getElementById("login-password").value;
    
    login(loginEmail, loginPassword).then((body) => {
        localStorage.setItem("authToken", body.token);
        localStorage.setItem("authUserId", body.userId);
        localStorage.setItem("authPassword", loginPassword);
        localStorage.setItem("authEmail", loginEmail);
        toggleScreenWelcome();
    }).catch((err) => {
        popupError(err);
    });
});

const toggleScreenLogin = () => {
    document.getElementById("screen-login").style.display = "block";
    document.getElementById("nav-login").style.backgroundColor = "rgb(" + 245 + "," + 223 + "," + 228 + ")";
    document.getElementById("screen-register").style.display = "none";
    document.getElementById("nav-register").style.backgroundColor = "white";
    document.getElementById("screen-welcome").style.display = "none";
};
    
document.getElementById("nav-login").addEventListener("click", toggleScreenLogin);
