/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * 
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 */

import { BACKEND_PORT } from "./config.js";
const authToken = localStorage.getItem("authToken");
const authUserId = localStorage.getItem("authUserId");

export function fileToDataUrl(file) {
    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);
    // Bad data, let's walk away.
    if (!valid) {
        throw Error('provided file is not a png, jpg or jpeg image.');
    }
    
    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve,reject) => {
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
}

export function popupError(message) {
    const popup = document.getElementById("popup-modal");
    const popupText = document.getElementById("popup-text");
    const closeBtn = document.getElementById("popup-close");
    popup.style.display = "block";
    popupText.textContent = message;
    closeBtn.addEventListener("click", () => {
        popup.style.display = "none";
    });
    // window.addEventListener("click", () => {
    //     popup.style.display = "none";
    // })
}

export function apiCall (path, httpMethod, requestBody) {
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
            }).catch((err) => {
                // alert(message);
                popupError(err);
            });
    });
}