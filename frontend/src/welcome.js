import { popupError, apiCall, newProfileLink } from "./helpers.js";
import { createProfile, updateProfile, watchUserByEmail } from "./profile.js";
import { addNewJob } from "./job.js";

//----------------------------------------------//
//----------- load and generate feed -----------//
//----------------------------------------------//

const getProfile = (userId) => {
    return apiCall(`user?userId=${userId}`, "GET", {});
};

const getFeed = (index) => {
    return apiCall(`job/feed?start=${index}`, "GET", {});
};

export function changeDateFormat (dateString) {
    let startDate = dateString;
    startDate = startDate.replace("-", "");
    startDate = startDate.replace("-", "");

    const year = startDate.substring(0, 4);
    const month = startDate.substring(4, 6);
    const day = startDate.substring(6, 8);
    return `${day}/${month}/${year}`;
};

export function checkPostDate (dateString) {
    const postDate = new Date(dateString);
    const now = new Date();

    const hours = Math.abs(postDate.getTime() - now.getTime()) / (60 * 60 * 1000);
    const hour = Math.floor(hours);
    const minute = Math.floor((hours - hour) * 60);
    
    if (hour < 24) {
        return ` - posted ${hour}:${minute} ago`;
    } else {
        return ` - posted on ${changeDateFormat(dateString)}`;
    }
};

const likeJob = (id) => {
    return apiCall("job/like", "PUT", {
        "id": id,
        "turnon": true,
    });
};

const commentJob = (id, comment) => {
    return apiCall("job/comment", "POST", {
        "id": id,
        "comment": comment,
    });
};

const constructFeed = (feedObject) => {
    const newFeed = document.getElementById("feed").cloneNode(true);
    newFeed.removeAttribute("id");
    newFeed.classList.remove("hide");
    newFeed.style.display = "block";
    let liked = false;

    // console.log(newFeed);
    newFeed.children[0].children[0].innerText = feedObject.title;
    newFeed.children[0].children[1].innerText = `Start Date: ${changeDateFormat(feedObject.start)}`;
    getProfile(feedObject.creatorId).then((body) => {
        const newLink = newProfileLink(feedObject.creatorId, body.name);
        if (!document.getElementById(feedObject.creatorId)) {
            createProfile(feedObject.creatorId, newLink);
        } 
        newFeed.children[1].children[0].appendChild(newLink);
    }).catch((err) => {
        popupError(err);
    });

    newFeed.children[1].children[1].innerText = checkPostDate(feedObject.createdAt);
    newFeed.children[2].src = feedObject.image;
    newFeed.children[4].innerText = feedObject.description;
    
    // show user links for likes
    newFeed.children[5].children[0].children[0].innerText = `scroll down to view ${feedObject.likes.length} likes`;
    if (feedObject.likes.length !== 0) {
        newFeed.children[5].children[0].children[1].innerText = "";
        for (let like in feedObject.likes) {
            const newLink = newProfileLink(feedObject.likes[like].userId, feedObject.likes[like].userName);
            if (!document.getElementById(feedObject.likes[like].userId)) {
                createProfile(feedObject.likes[like].userId, newLink);
            } 
            if (feedObject.likes[like].userId == localStorage.getItem("authUserId")) {
                liked = true;
            }
            newFeed.children[5].children[0].children[1].appendChild(newLink);
            newFeed.children[5].children[0].children[1].appendChild(document.createElement("br"));
        }
    }

    // show user links and content for comments
    newFeed.children[5].children[2].children[0].innerText = `scroll down to view ${feedObject.comments.length} comments`;
    for (let comment in feedObject.comments) {
        const newLink = newProfileLink(feedObject.comments[comment].userId, feedObject.comments[comment].userName);
        const c = document.createElement("span");
        c.innerText = `: ${feedObject.comments[comment].comment}`;
        c.style.textAlign = "left";
        newFeed.children[5].children[2].children[1].appendChild(newLink);
        newFeed.children[5].children[2].children[1].appendChild(c);
        newFeed.children[5].children[2].children[1].appendChild(document.createElement("br"));
    }

    // like job button
    newFeed.children[5].children[1].addEventListener("click", () => {
        if (liked) {
            popupError("you have already like this job");
        } else {
            likeJob(feedObject.id).then(() => {
                popupError("like job successfully");
                let likeNum = newFeed.children[5].children[0].children[0].innerText;
                likeNum = likeNum.match(/\d+/)[0];
                newFeed.children[5].children[0].children[0].innerText = `scroll down to view ${++likeNum} likes`;

                const newLink = newProfileLink(localStorage.getItem("authUserId"), localStorage.getItem("authName"));
                newFeed.children[5].children[0].children[1].appendChild(newLink);
                newFeed.children[5].children[0].children[1].appendChild(document.createElement("br"));

                liked = true;
            }).catch((err) => {
                popupError(err);
            });
        }
    });

    // comment job button
    newFeed.children[5].children[3].children[1].addEventListener("click", () => {
        const comment = newFeed.children[5].children[3].children[0].value;
        commentJob(feedObject.id, comment).then(() => {
            popupError("comment job successfully");
            const newLink = newProfileLink(localStorage.getItem("authUserId"), localStorage.getItem("authName"));
            const c = document.createElement("span");
            c.innerText = `: ${comment}`;
            c.style.textAlign = "left";
            newFeed.children[5].children[2].children[1].appendChild(newLink);
            newFeed.children[5].children[2].children[1].appendChild(c);
            newFeed.children[5].children[2].children[1].appendChild(document.createElement("br"));

            let commentNum = newFeed.children[5].children[2].children[0].innerText;
            commentNum = commentNum.match(/\d+/)[0];
            newFeed.children[5].children[2].children[0].innerText = `scroll down to view ${++commentNum} comments`;
        }).catch((err) => {
            popupError(err);
        });
    });
    return newFeed;
}

// show screen after login
export function toggleScreenWelcome () {
    let authUserId = localStorage.getItem("authUserId");
    document.getElementById("screen-welcome").style.display = "flex";
    document.getElementById("screen-register").style.display = "none";
    document.getElementById("nav-register").style.display = "none";
    document.getElementById("screen-login").style.display = "none";
    document.getElementById("nav-login").style.display = "none";
    document.getElementById("update-profile").style.display = "block";
    document.getElementById("watch-user").style.display = "block";
    document.getElementById("add-job").style.display = "block";
    
    getProfile(authUserId).then((body) => {
        console.log(body);
        localStorage.setItem("authName", body.name);
        const userProfile = document.getElementById("user-json");
        userProfile.href = `#${body.id}`;
        userProfile.title = body.name;
        userProfile.textContent = body.name;
        createProfile(body.id, userProfile);

        // update profile button
        document.getElementById("update-profile").addEventListener("click", (event) => {
            const screenUpdate = document.getElementById("screen-update");
            screenUpdate.classList.remove("hide");
            screenUpdate.style.display = "block";
            const closeBtn = document.getElementById("screen-update-close");
            closeBtn.addEventListener("click", () => {
                screenUpdate.style.display = "none";
            });
            updateProfile(body);
        });

        // watch user by email button
        document.getElementById("watch-user").addEventListener("click", (event) => {
            const popupWatch = document.getElementById("screen-watch");
            popupWatch.classList.remove("hide");
            popupWatch.style.display = "block";
            const closeBtn = document.getElementById("watch-popup-close");
            closeBtn.addEventListener("click", () => {
                popupWatch.style.display = "none";
            });
            watchUserByEmail();
        });

        // add job button
        document.getElementById("add-job").addEventListener("click", (event) => {
            const popupAddJob = document.getElementById("screen-job-add");
            popupAddJob.classList.remove("hide");
            popupAddJob.style.display = "block";
            const closeBtn = document.getElementById("job-add-popup-close");
            closeBtn.addEventListener("click", () => {
                popupAddJob.style.display = "none";
            });
            addNewJob();
        });
    }).catch((err) => {
        popupError(err);
    });

    // get feed
    getFeed(0).then((body) => {
        console.log(body);
        for (let feed in body) {
            const newFeed = constructFeed(body[feed]);
            document.getElementById("feeds").appendChild(newFeed);
            console.log(document.getElementById("feeds"));
        }
    }).catch((err) => {
        popupError(err);
    });
};
