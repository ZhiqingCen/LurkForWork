import { fileToDataUrl, popupError, apiCall, newProfileLink  } from "./helpers.js";
import { toggleScreenWelcome } from "./welcome.js";

export function toggleScreenProfile(profileId) {
    const profileElement = document.getElementById(profileId);
    console.log(profileElement);
    if (profileElement) {
        document.getElementById("screen-profile").classList.remove("hide");
        document.getElementById("screen-profile").display = "block";
        profileElement.classList.remove("hide");
        profileElement.style.display = "flex";
        document.getElementById("screen-welcome").display = "none";
        console.log(`here ${profileId}`);
        // document.getElementById("profile-close").addEventListener("click", () => {
        console.log(document.getElementById(`${profileId}-close`));
        document.getElementById(`${profileId}-close`).addEventListener("click", () => {
            // console.log("here");
            // profileElement.style.display = "none";
            document.getElementById("screen-profile").display = "none";
            document.getElementById("screen-welcome").display = "flex";
            window.scrollTo(0, 0);
            // document.getElementById("website").scrollIntoView();
            // toggleScreenWelcome();
        });
    }
}

const constructProfile = (profileObject) => {
    const existProfile = document.getElementById(profileObject.id);
    console.log(existProfile);
    if (!existProfile) {
        const newProfile = document.getElementById("profile").cloneNode(true);
        newProfile.id = profileObject.id; // TODO change id
        // newProfile.classList.remove("hide");
        console.log(newProfile);

        newProfile.children[0].id = `${profileObject.id}-close`;
        // newProfile.children[0].addEventListener("click", () => {
        //     document.getElementById("screen-profile").display = "none";
        //     document.getElementById("screen-welcome").display = "flex";
        //     window.scrollTo(0, 0);
        // });

        if (profileObject.image) {
            newProfile.children[1].children[0].src = profileObject.image;
        }

        newProfile.children[1].children[1].children[0].innerText = profileObject.name;
        newProfile.children[1].children[1].children[1].innerText = profileObject.id;
        newProfile.children[1].children[1].children[2].innerText = profileObject.email;

        newProfile.children[2].children[0].innerText = `Watched by: ${profileObject.watcheeUserIds.length} users`;


        if (profileObject.watcheeUserIds.length !== 0) {
            for (let id in profileObject.watcheeUserIds) {
                newProfile.children[2].children[1].appendChild(document.createElement("br"));
                const checkProfile = document.getElementById(profileObject.watcheeUserIds[id]);
                let newLink = null;
                if (!checkProfile) {
                    getProfile(profileObject.watcheeUserIds[id]).then((body) => {
                        console.log(body);
                        newLink = newProfileLink(body.id, body.name);
                        newLink.addEventListener("click", toggleScreenProfile(body.id));
                        constructProfile(body);
                    }).catch((err) => {
                        popupError(err);
                    });
                } else {
                    newLink = newProfileLink(profileObject.watcheeUserIds[id], checkProfile.children[1].children[1].children[0].innerText)
                }
                newProfile.children[2].children[1].appendChild(newLink);

                // let newLink = null;
                // if (!document.getElementById(profileObject.watcheeUserIds[id])) {
                //     getProfile(profileObject.watcheeUserIds[id]).then((body) => {
                //         console.log(body);
                //         const newLink = newProfileLink(body.id, body.name);
                //         constructProfile(body);
                //     }).catch((err) => {
                //         popupError(err);
                //     });
                // } else {
                //     // newLink = null;
                // }


                // const newUser = getProfile(profileObject.watcheeUserIds[id]);
                // console.log(newUser);
                // const newLink = newProfileLink(newUser.id, newUser.name);
                // if (!document.getElementById(newUser.id)) {
                //     createProfile(newUser.id);
                //     // TODO check if this works
                //     newLink.addEventListener("click", toggleScreenProfile(newUser.id));
                // }
                // newProfile.children[2].children[1].appendChild(newLink);

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