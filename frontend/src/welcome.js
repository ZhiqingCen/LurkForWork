import { BACKEND_PORT } from "./config.js";
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl, popupError, apiCall  } from "./helpers.js";

// let authToken = localStorage.getItem("authToken");
// let authUserId = localStorage.getItem("authUserId");

const getProfile = (userId) => {
    return apiCall(`user?userId=${userId}`, "GET", {});
};

const getFeed = (index) => {
    return apiCall(`job/feed?start=${index}`, "GET", {});
};

const changeDateFormat = (dateString) => {
    let startDate = dateString;
    startDate = startDate.replace("-", "");
    startDate = startDate.replace("-", "");

    const year = startDate.substring(0, 4);
    const month = startDate.substring(4, 6);
    const day = startDate.substring(6, 8);
    return `${day}/${month}/${year}`;
};

const checkPostDate = (dateString) => {
    const postDate = new Date(dateString);
    const now = new Date();

    const hours = Math.floor(Math.abs(postDate.getTime() - now.getTime()) / (60 * 60 * 1000));
    const minutes = Math.floor(Math.abs(postDate.getTime() - now.getTime()) / (60 * 60 * 1000 * 60));
    console.log(hours); // TODO
    
    if (hours < 24) {
        // console.log('date is within 24 hours');
        // TODO check if this is right!!!
        return `${hours}:${minutes}`;
    } else {
        // console.log('date is NOT within 24 hours');
        return changeDateFormat(dateString);
    }
};

const constructFeed = (feedObject) => {
    const newFeed = document.getElementById("feed").cloneNode(true);
    newFeed.removeAttribute("id");
    newFeed.classList.remove("hide");
    newFeed.style.display = "block";

    console.log(newFeed);
    console.log(newFeed.children);
    newFeed.children[0].children[0].innerText = feedObject.title;
    newFeed.children[0].children[1].innerText = `Start Date: ${changeDateFormat(feedObject.start)}`;
    getProfile(feedObject.creatorId).then((body) => {
        newFeed.children[1].children[0].innerText = `${body.name} - `;
    }).catch((err) => {
        popupError(err);
    });
    newFeed.children[1].children[1].innerText = checkPostDate(feedObject.createdAt);
    newFeed.children[2].src = feedObject.image;
    newFeed.children[4].innerText = feedObject.description;
    newFeed.children[5].children[0].innerText = `${feedObject.likes.length} likes`;
    newFeed.children[5].children[2].innerText = `${feedObject.comments.length} comments`;

    return newFeed;
}

export function toggleScreenWelcome () {
    let authUserId = localStorage.getItem("authUserId");
    document.getElementById("screen-welcome").style.display = "flex";
    document.getElementById("screen-register").style.display = "none";
    document.getElementById("nav-register").style.display = "none";
    document.getElementById("screen-login").style.display = "none";
    document.getElementById("nav-login").style.display = "none";
    getProfile(authUserId).then((body) => {
        // document.getElementById("user-json").innerText = JSON.stringify(body);
        document.getElementById("user-json").innerText = `Hi, ${body.name}`;
    }).catch((err) => {
        popupError(err);
    });
    getFeed(0).then((body) => {
        console.log(body);
        for (let feed in body) {
            // console.log(body[feed]);
            const newFeed = constructFeed(body[feed]);
            document.getElementById("feeds").appendChild(newFeed);
            console.log(document.getElementById("feeds"));
            // changeDateFormat(feedObject.start);
        }
    }).catch((err) => {
        popupError(err);
    });
};
