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

const showFeed = (feedObject) => {
    getProfile(feedObject.creatorId).then((body) => {
        document.getElementById("job-owner").innerText = `${body.name} - `;
    }).catch((err) => {
        popupError(err);
    });

    document.getElementById("job-title").innerText = feedObject.title;
    document.getElementById("job-start-date").innerText = changeDateFormat(feedObject.start);
    document.getElementById("job-post-date").innerText = checkPostDate(feedObject.createdAt);
    document.getElementById("job-image").src = feedObject.image;
    document.getElementById("job-description").innerText = feedObject.description;
    document.getElementById("like-num").innerText = `${feedObject.likes.length} likes`;
    document.getElementById("comment-num").innerText = `${feedObject.comments.length} comments`;
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
            showFeed(body[feed]);
            // changeDateFormat(feedObject.start);
        }
    }).catch((err) => {

    });
};
