import { fileToDataUrl, popupError, apiCall, toggleScreenProfile, newProfileLink  } from "./helpers.js";
import { changeDateFormat, checkPostDate, toggleScreenWelcome } from "./welcome.js";
import { addNewJob, updateNewJob, deleteNewJob } from "./job.js";

// export function toggleScreenProfile(profileId) {
//     const profileElement = document.getElementById(profileId);
//     console.log(profileElement);
//     if (profileElement) {
//         document.getElementById("screen-profile").classList.remove("hide");
//         document.getElementById("screen-profile").display = "block";
//         profileElement.classList.remove("hide");
//         profileElement.style.display = "flex";
//         document.getElementById("screen-welcome").display = "none";
//         // console.log(`here ${profileId}`);
//         // document.getElementById("profile-close").addEventListener("click", () => {
//         // console.log(document.getElementById(`${profileId}-close`));
//         document.getElementById(`${profileId}-close`).addEventListener("click", () => {
//             // console.log("here");
//             // profileElement.style.display = "none";
//             document.getElementById("screen-profile").display = "none";
//             document.getElementById("screen-welcome").display = "flex";
//             window.scrollTo(0, 0);
//             // document.getElementById("website").scrollIntoView();
//             // toggleScreenWelcome();
//             console.log("close here");
//         });
//     }
// }

// const update = (email, password, name, image) => {
//     return apiCall("user", "PUT", {
//         "email": email,
//         "password": password,
//         "name": name,
//         "image":image,
//     });
// };


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

// var userWatchedLink = undefined;

const addWatch = (profileObject) => {
    // userWatchedLink = newLink;
    let watchNum = profileObject.children[2].children[0].innerText;
    watchNum = watchNum.match(/\d+/)[0];
    // watchNum = watchNum + 1;
    // ++watchNum;
    // console.log(`watchNum = ${watchNum}`);
    profileObject.children[2].children[0].innerText = `Watched by ${++watchNum} users`;
    // const newLink = newProfileLink(localStorage.getItem("authUserId"), localStorage.getItem("authName"));
    // profileObject.children[2].children[1].appendChild(newLink);
}

const removeWatch = (profileObject) => {
    // if (userWatchedLink) {
    //     profileObject.children[2].children[1].removeChild(userWatchedLink);
    // }
    let watchNum = profileObject.children[2].children[0].innerText;
    watchNum = watchNum.match(/\d+/)[0];
    // watchNum = watchNum - 1;
    // --watchNum;
    // console.log(`watchNum = ${watchNum}`);
    profileObject.children[2].children[0].innerText = `Watched by ${--watchNum} users`;
}

const toggleWatchBtn = (watchBtn, unwatchBtn, email, profileObject) => {
    watchBtn.addEventListener("click", () => {
        watchUser(email, true).then(() => {
            watchBtn.style.display = "none";
            unwatchBtn.style.display = "block";
            // updateWatchDetails(profileObject, newProfileLink (profileId, profileName));
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

const constructProfile = (profileObject) => {
    const existProfile = document.getElementById(profileObject.id);
    // console.log(existProfile);
    // console.log(profileObject);
    if (!existProfile) {
        const newProfile = document.getElementById("profile").cloneNode(true);
        newProfile.id = profileObject.id; // TODO change id
        newProfile.classList.remove("hide");
        newProfile.style.display = "flex";
        // console.log(newProfile);
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
        
        // // if own profile, disable watch and unwatch button
        // if (newProfile.id === authUserId) {
        //     newProfile.children[1].children[1].children[3].style.display = "none";
        //     newProfile.children[1].children[1].children[4].style.display = "none";
        // }
        let watched = false;
        newProfile.children[2].children[0].innerText = `Watched by ${profileObject.watcheeUserIds.length} users (scroll down)`;
        // let userWatchedLink = undefined;
        if (profileObject.watcheeUserIds.length !== 0) {
            for (let id in profileObject.watcheeUserIds) {
                // newProfile.children[2].children[1].appendChild(document.createElement("br"));
                const checkProfile = document.getElementById(profileObject.watcheeUserIds[id]);
                let newLink = null;
                if (!checkProfile) {
                    getProfile(profileObject.watcheeUserIds[id]).then((body) => {
                        constructProfile(body);
                    // }).then((body) => {
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
                    // newLink.addEventListener("click", toggleScreenProfile(profileObject.watcheeUserIds[id]));
                    newProfile.children[2].children[1].appendChild(newLink);
                    newProfile.children[2].children[1].appendChild(document.createElement("br"));
                }
                // console.log(`watch ${profileObject.watcheeUserIds[id]}, auth ${authUserId}`);
                if (profileObject.watcheeUserIds[id] == authUserId) {
                    watched = true;
                    // userWatchedLink = newLink;
                    // console.log(`watched ${profileObject.watcheeUserIds[id]}`);
                }
                
            }
        }
        // console.log(newProfile.children[2].children[1]);
        const watchBtn = newProfile.children[1].children[1].children[3];
        const unwatchBtn = newProfile.children[1].children[1].children[4];
        toggleWatchBtn(watchBtn, unwatchBtn, profileObject.email, newProfile);
        console.log(watched);
        // if (watched === true) {
        //     // if watched, show unwatch button
        //     watchBtn.style.display = "none";
        //     unwatchBtn.style.display = "block";
        // } else {
        //     // else, show watch button
        //     watchBtn.style.display = "block";
        //     unwatchBtn.style.display = "none";
        // }
        // watched = false;
        // if own profile, disable watch and unwatch button
        if (newProfile.id === authUserId) {
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

        // console.log(profileObject.jobs);
        if (profileObject.jobs.length !== 0) {
            for (let job in profileObject.jobs) {
                // console.log(profileObject.jobs[job]);
                const newFeed = document.getElementById("profile-job-feed").cloneNode(true);
                newFeed.removeAttribute("id");
                newFeed.classList.remove("hide");
                newFeed.style.display = "block";

                newFeed.children[0].children[0].innerText = profileObject.jobs[job].title;
                newFeed.children[0].children[1].innerText = `Start Date: ${changeDateFormat(profileObject.jobs[job].start)}`;
                // getProfile(feedObject.creatorId).then((body) => {
                //     const newLink = newProfileLink(feedObject.creatorId, body.name);
                //     if (!document.getElementById(feedObject.creatorId)) {
                //         createProfile(feedObject.creatorId, newLink);
                //     } 
                //     newFeed.children[1].children[0].appendChild(newLink);
                //     // newFeed.children[1].children[0].innerText = `${body.name} - `;
                // }).catch((err) => {
                //     popupError(err);
                // });
                newFeed.children[1].children[0].innerText = checkPostDate(profileObject.jobs[job].createdAt);
                newFeed.children[2].src = profileObject.jobs[job].image;
                newFeed.children[4].innerText = profileObject.jobs[job].description;

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
                        // addNewJob();
                        updateNewJob(profileObject.jobs[job].id);
                    });
                    
                    const jobDeleteBtn = newFeed.children[5].children[1];
                    jobDeleteBtn.classList.remove("hide");
                    jobDeleteBtn.style.display = "block";
                    jobDeleteBtn.addEventListener("click", (event) => {
                        // deleteNewJob(profileObject.jobs[job].id);
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
                // <button class="job-update-btn hide">Update Job</button>
                // <button class="job-delete-btn hide">Delete Job</button>



                newProfile.children[3].appendChild(newFeed);
            }
        }

        document.getElementById("screen-profile").appendChild(newProfile);
        console.log(document.getElementById("screen-profile"));
        // return newProfile
    }
    //  else {
    //     return null;
    // }
};
const getProfile = (userId) => {
    return apiCall(`user?userId=${userId}`, "GET", {});
};
export function createProfile(userId, newLink) {
    getProfile(userId).then((body) => {
        console.log(body);
        constructProfile(body);
        newLink.addEventListener("click", toggleScreenProfile(userId));
        // const newP = constructProfile(body);
        // if (newP) {
        //     document.getElementById("screen-profile").appendChild(constructProfile(body));
        // }
        // for (let profile in body) {
        //     // console.log(body[feed]);
        //     const newFeed = constructFeed(body[feed]);
        //     document.getElementById("feeds").appendChild(newFeed);
        //     console.log(document.getElementById("feeds"));
        //     // changeDateFormat(feedObject.start);
        // }
    }).catch((err) => {
        popupError(err);
    });
}

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
}

// var file = document.querySelector('#files > input[type="file"]').files[0];
// getBase64(file).then(
// data => console.log(data)
// );

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

export function updateProfile (profileObject) {
    const form = document.forms.profile_update;
    // const testImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
    document.getElementById("update-btn").addEventListener("click", (event) => {
        console.log(form);
        let email = form.elements.email.value;
        let name = form.elements.name.value;
        let password = form.elements.password.value;
        let image = form.elements.image;
        let imagePath = undefined;
        event.preventDefault();
        // update(email, name, password, image);
        console.log(`email:${email}, name:${name}, password:${password}, image:${image.value}`);
        console.log(profileObject);
        console.log(profileObject.email);

        // if (email === "" || name === "" || password === "" || image.value === "") {
        //     popupError("please fill in one of the required fields");
        // } else {

        // }

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
        console.log(image);
        if (!image.value) {
            imagePath = undefined;
            update(email, password, name, imagePath).then((body) => {
            // update(email, password, name, testImage).then((body) => {
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
            })//;
            .then(() => {
                update(email, password, name, imagePath).then((body) => {
                // update(email, password, name, testImage).then((body) => {
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
        // let file = document.querySelector('#files > input[type="file"]').files[0];
        // let reader = new FileReader();
        // reader.readAsDataURL(image.files[0]);

        // reader.onload = function () {
        //     console.log(reader.result);//base64encoded string
        // };
        // reader.onerror = function (error) {
        //     console.log('Error: ', error);
        // };
        // console.log(`image sent through frontend: ${imagePath}`);
        // update(email, password, name, imagePath).then((body) => {
        // // update(email, password, name, testImage).then((body) => {
        //     document.getElementById("screen-update").style.display = "none";
        //     popupError("profile updated successfully");
        //     const userProfile = document.getElementById(profileObject.id);
        //     if (imagePath) {
        //         userProfile.children[1].children[0].src = imagePath;
        //     }
        //     if (email) {
        //         userProfile.children[1].children[1].children[2].innerText = `email: ${email}`;
        //     }
        //     if (name) {
        //         document.getElementById("user-json").title = name;
        //         document.getElementById("user-json").textContent = name;
        //         userProfile.children[1].children[1].children[0].innerText = name;
        //     }
        //     console.log(body);
        // }).catch((err) => {
        //     popupError(err);
        // });
    });
}