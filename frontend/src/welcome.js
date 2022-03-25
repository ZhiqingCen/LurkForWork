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
    return `posted on ${day}/${month}/${year}`;
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
        return `posted ${hours}:${minutes} ago`;
    } else {
        // console.log('date is NOT within 24 hours');
        return changeDateFormat(dateString);
    }
};

// const likeJob = () => {

// }

// const commentDetails = (commentObject) => {
//     // for (let c in commentObject) {
//     const comment = document.createElement("p");
//     // comment.innerText = 
//     // }
//     comment.innerText = `${comment.userName}: ${comment.comment}`;
//     return comment;
// };

const likeJob = (id) => {
    return apiCall("job/like", "PUT", {
        "id": id,
        "turnon": true,
    });
};

// const commentJob = (comment) => {
//     return apiCall("job/comment", "POST", {
//         "id": localStorage.getItem("authUserId"),
//         "comment": comment,
//     });
// };

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
    newFeed.children[5].children[0].innerText = `scroll down to view ${feedObject.likes.length} likes`;
    console.log(feedObject.likes); // TODO make sure the likes are right
    if (feedObject.likes.length !== 0) {
        let likeList = "";
        for (let like in feedObject.likes) {
            likeList += `${feedObject.likes[like].userName}, `;
        }
        if (likeList !== "") {
            likeList = likeList.substring(0, likeList.length - 2);
        }
        const l = document.createElement("p");
        l.innerText = likeList;
        l.style.textAlign = "left";
        newFeed.children[5].children[0].appendChild(l);
    }

    newFeed.children[5].children[2].innerText = `scroll down to view ${feedObject.comments.length} comments`;
    for (let comment in feedObject.comments) {
        const c = document.createElement("p");
        c.innerText = `${feedObject.comments[comment].userName}: ${feedObject.comments[comment].comment}`;
        c.style.textAlign = "left";
        newFeed.children[5].children[2].appendChild(c);
    }

    // newFeed.children[5].children[1].onclick = function () {
    //     return apiCall("job/like", "PUT", {
    //         "id": feedObject.id, // TODO id of people who like the post
    //         "turnon": true,
    //     });
    // }
    newFeed.children[5].children[1].onclick = likeJob(feedObject.id);
    // newFeed.children[5].children[3].onclick = commentJob(comment);
    // newFeed.children[5].children[3].addEventListener("input", () => {
    //     return apiCall("job/comment", "POST", {
    //         "id": localStorage.getItem("authUserId"),
    //         "comment": this.value,
    //     });
    // });
    // let comment = newFeed.children[5].children[3].children[0].value;
    // newFeed.children[5].children[3].children[1].onclick = commentJob(comment);


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
