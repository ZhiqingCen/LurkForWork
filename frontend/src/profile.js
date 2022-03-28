import { popupError, apiCall, toggleScreenProfile, newProfileLink  } from "./helpers.js";
import { changeDateFormat, checkPostDate } from "./welcome.js";
import { updateNewJob } from "./job.js";

//-----------------------------------------//
//----------- watch and unwatch -----------//
//-----------------------------------------//

const watchUser = (email, watchBool) => {
    return apiCall("user/watch", "PUT", {
        "email": email,
        "turnon": watchBool,
    })
}
const deleteJob = (id) => {
    return apiCall("job", "DELETE", {
        "id": id,
    });
};

const addWatch = (profileObject) => {
    let watchNum = profileObject.children[2].children[0].innerText;
    watchNum = watchNum.match(/\d+/)[0];
    profileObject.children[2].children[0].innerText = `Watched by ${++watchNum} users`;
}

const removeWatch = (profileObject) => {
    let watchNum = profileObject.children[2].children[0].innerText;
    watchNum = watchNum.match(/\d+/)[0];
    profileObject.children[2].children[0].innerText = `Watched by ${--watchNum} users`;
}

const toggleWatchBtn = (watchBtn, unwatchBtn, email, profileObject) => {
    watchBtn.addEventListener("click", () => {
        watchUser(email, true).then(() => {
            watchBtn.style.display = "none";
            unwatchBtn.style.display = "block";
            addWatch(profileObject);
        }).catch((err) => {
            popupError(err);
        });
    })

    unwatchBtn.addEventListener("click", () => {
        watchUser(email, false).then(() => {
            watchBtn.style.display = "block";
            unwatchBtn.style.display = "none";
            removeWatch(profileObject);
        }).catch((err) => {
            popupError(err);
        });
    })
}

//--------------------------------------------//
//----------- watch user via email -----------//
//--------------------------------------------//

export function watchUserByEmail () {
    const form = document.forms.watch_user;
    document.getElementById("watch-user-btn").addEventListener("click", (event) => {
        console.log("here");
        event.preventDefault();
        let email = form.elements.email.value;
        if (email) {
            watchUser(email, true).then(() => {
                document.getElementById("screen-watch").style.display = "none";
                popupError("watch user successfully");
            }).catch((err) => {
                document.getElementById("screen-watch").style.display = "none";
                popupError(err);
            });
        } else {
            document.getElementById("screen-watch").style.display = "none";
            popupError("please enter an email");
        }
    });
}

//------------------------------------------------------//
//----------- load and generate user profile -----------//
//------------------------------------------------------//

const constructProfile = (profileObject) => {
    const existProfile = document.getElementById(profileObject.id);
    if (!existProfile) {
        // if profile not yet generated, generate new profile page
        // else, do nothing
        const newProfile = document.getElementById("profile").cloneNode(true);
        newProfile.id = profileObject.id;
        newProfile.classList.remove("hide");
        newProfile.style.display = "flex";
        
        const authUserId = localStorage.getItem("authUserId");
        newProfile.children[0].id = `${profileObject.id}-close`;

        if (profileObject.image) {
            newProfile.children[1].children[0].src = profileObject.image;
        } else {
            newProfile.children[1].children[0].style.display = "none";
        }

        newProfile.children[1].children[1].children[0].innerText = profileObject.name;
        newProfile.children[1].children[1].children[1].innerText = `id: ${profileObject.id}`;
        newProfile.children[1].children[1].children[2].innerText = `email: ${profileObject.email}`;

        // watched by list, generate users' profile links
        let watched = false;
        newProfile.children[2].children[0].innerText = `Watched by ${profileObject.watcheeUserIds.length} users (scroll down)`;
        if (profileObject.watcheeUserIds.length !== 0) {
            for (let id in profileObject.watcheeUserIds) {
                const checkProfile = document.getElementById(profileObject.watcheeUserIds[id]);
                let newLink = null;
                if (!checkProfile) {
                    getProfile(profileObject.watcheeUserIds[id]).then((body) => {
                        constructProfile(body);
                        newLink = newProfileLink(body.id, body.name);
                        newLink.addEventListener("click", toggleScreenProfile(body.id));
                        console.log(body);
                        newProfile.children[2].children[1].appendChild(newLink);
                        newProfile.children[2].children[1].appendChild(document.createElement("br"));
                    })
                    .catch((err) => {
                        popupError(err);
                    });
                } else {
                    newLink = newProfileLink(profileObject.watcheeUserIds[id], checkProfile.children[1].children[1].children[0].innerText);
                    newProfile.children[2].children[1].appendChild(newLink);
                    newProfile.children[2].children[1].appendChild(document.createElement("br"));
                }
                if (profileObject.watcheeUserIds[id] == authUserId) {
                    watched = true;
                }
            }
        }

        // watch and unwatch button profile
        const watchBtn = newProfile.children[1].children[1].children[3];
        const unwatchBtn = newProfile.children[1].children[1].children[4];
        toggleWatchBtn(watchBtn, unwatchBtn, profileObject.email, newProfile);
        if (newProfile.id === authUserId) {
            // if own profile, disable watch and unwatch button
            watchBtn.style.display = "none";
            unwatchBtn.style.display = "none";
        } else if (watched === true) {
            // if watched, show unwatch button
            watchBtn.style.display = "none";
            unwatchBtn.style.display = "block";
        } else {
            // else, show watch button
            watchBtn.style.display = "block";
            unwatchBtn.style.display = "none";
        }

        // generate container for each job feed
        if (profileObject.jobs.length !== 0) {
            for (let job in profileObject.jobs) {
                const newFeed = document.getElementById("profile-job-feed").cloneNode(true);
                newFeed.removeAttribute("id");
                newFeed.classList.remove("hide");
                newFeed.style.display = "block";

                newFeed.children[0].children[0].innerText = profileObject.jobs[job].title;
                newFeed.children[0].children[1].innerText = `Start Date: ${changeDateFormat(profileObject.jobs[job].start)}`;
                newFeed.children[1].children[0].innerText = checkPostDate(profileObject.jobs[job].createdAt);
                newFeed.children[2].src = profileObject.jobs[job].image;
                newFeed.children[4].innerText = profileObject.jobs[job].description;

                // show update and delete job buttons on login user profile
                if (newProfile.id === authUserId) {
                    const jobUpdateBtn = newFeed.children[5].children[0];
                    jobUpdateBtn.classList.remove("hide");
                    jobUpdateBtn.style.display = "block";
                    jobUpdateBtn.addEventListener("click", () => {
                        const screenUpdateJob = document.getElementById("screen-job-update");
                        screenUpdateJob.classList.remove("hide");
                        screenUpdateJob.style.display = "block";
                        const closeBtn = document.getElementById("job-update-popup-close");
                        closeBtn.addEventListener("click", () => {
                            screenUpdateJob.style.display = "none";
                        });
                        updateNewJob(profileObject.jobs[job].id);
                    });
                    
                    const jobDeleteBtn = newFeed.children[5].children[1];
                    jobDeleteBtn.classList.remove("hide");
                    jobDeleteBtn.style.display = "block";
                    jobDeleteBtn.addEventListener("click", (event) => {
                        event.preventDefault();
                        deleteJob(profileObject.jobs[job].id).then((body) => {
                            popupError("job deleted successfully");
                            console.log(body);
                        }).catch((err) => {
                            popupError(err);
                        });
                        newFeed.style.display = "none";
                    })
                }
                newProfile.children[3].appendChild(newFeed);
            }
        }
        document.getElementById("screen-profile").appendChild(newProfile);
        console.log(document.getElementById("screen-profile"));
    }
};

const getProfile = (userId) => {
    return apiCall(`user?userId=${userId}`, "GET", {});
};

export function createProfile(userId, newLink) {
    getProfile(userId).then((body) => {
        console.log(body);
        constructProfile(body);
        newLink.addEventListener("click", toggleScreenProfile(userId));
    }).catch((err) => {
        popupError(err);
    });
}

//--------------------------------------//
//----------- update profile -----------//
//--------------------------------------//

const update = (email, password, name, image) => {
    return apiCall("user", "PUT", {
        "email": email,
        "password": password,
        "name": name,
        "image":image,
    });
};

export function convertBase64 (imageFile) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

export function updateProfile (profileObject) {
    const form = document.forms.profile_update;
    document.getElementById("update-btn").addEventListener("click", (event) => {
        event.preventDefault();

        let email = form.elements.email.value;
        let name = form.elements.name.value;
        let password = form.elements.password.value;
        let image = form.elements.image;
        let imagePath = undefined;

        if (!email || email === profileObject.email) {
            email = undefined;
            console.log(email);
        }
        if (!name || name === profileObject.name) {
            name = undefined;
        }
        if (!password || name === localStorage.getItem("authPassword")) {
            password = undefined;
        }
        if (!image.value) {
            imagePath = undefined;
            update(email, password, name, imagePath).then((body) => {
                document.getElementById("screen-update").style.display = "none";
                popupError("profile updated successfully");
                const userProfile = document.getElementById(profileObject.id);
                if (imagePath) {
                    userProfile.children[1].children[0].src = imagePath;
                }
                if (email) {
                    userProfile.children[1].children[1].children[2].innerText = `email: ${email}`;
                    localStorage.setItem("authEmail", email);
                }
                if (name) {
                    document.getElementById("user-json").title = name;
                    document.getElementById("user-json").textContent = name;
                    localStorage.setItem("authName", name);
                    userProfile.children[1].children[1].children[0].innerText = name;
                    userProfile.children[1].children[1].children[0].style.display = "block";
                }
                console.log(body);
            }).catch((err) => {
                popupError(err);
            });
        } else {
            convertBase64(image.files[0]).then((data) => {
                imagePath = data;
                console.log(imagePath);
            }).then(() => {
                update(email, password, name, imagePath).then((body) => {
                    document.getElementById("screen-update").style.display = "none";
                    popupError("profile updated successfully");
                    const userProfile = document.getElementById(profileObject.id);
                    if (imagePath) {
                        userProfile.children[1].children[0].src = imagePath;
                    }
                    if (email) {
                        userProfile.children[1].children[1].children[2].innerText = `email: ${email}`;
                    }
                    if (name) {
                        document.getElementById("user-json").title = name;
                        document.getElementById("user-json").textContent = name;
                        userProfile.children[1].children[1].children[0].innerText = name;
                    }
                    console.log(body);
                }).catch((err) => {
                    popupError(err);
                });
            })
            .catch((err) => {
                popupError(err);
            });
        }
    });
};