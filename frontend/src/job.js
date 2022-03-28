import { popupError, apiCall } from "./helpers.js";
import { convertBase64 } from "./profile.js";

//-----------------------------------//
//----------- add new job -----------//
//-----------------------------------//

const addJob = (title, image, start, description) => {
    return apiCall("job", "POST", {
        "title": title,
        "image": image,
        "start": start,
        "description": description,
    });
};

export function addNewJob() {
    const form = document.forms.job_add;

    document.getElementById("job-add-btn").addEventListener("click", (event) => {
        event.preventDefault();
        const title = form.elements.title.value;
        const description = form.elements.description.value;
        const startdate = form.elements.startdate.value;
        const image = form.elements.image;
        let imagePath = undefined;
        console.log(`title=${title}, description=${description}, startdate=${startdate}, image=${image.value}`);
        if (!title || !description || !startdate || !image.value) {
            popupError("please fill in all required fields");
            console.log("here");
        } else {
            convertBase64(image.files[0]).then((data) => {
                imagePath = data;
                console.log(imagePath);
            }).then(() => {
                addJob(title, imagePath, startdate, description).then((body) => {
                    document.getElementById("screen-job-add").style.display = "none";
                    popupError("job added successfully");
                    console.log(body);
                }).catch((err) => {
                    popupError(err);
                });
            }).catch((err) => {
                popupError(err);
            });
        }
    });
};

//----------------------------------//
//----------- update job -----------//
//----------------------------------//

const updateJob = (id, title, image, start, description) => {
    return apiCall("job", "PUT", {
        "id": id,
        "title": title,
        "image": image,
        "start": start,
        "description": description,
    });
};

export function updateNewJob(id) {
    const form = document.forms.job_update;

    document.getElementById("job-update-btn").addEventListener("click", (event) => {
        event.preventDefault();
        const title = form.elements.title.value;
        const description = form.elements.description.value;
        const startdate = form.elements.startdate.value;
        const image = form.elements.image;
        let imagePath = undefined;
        console.log(`title=${title}, description=${description}, startdate=${startdate}, image=${image.value}`);
        if (title || description || startdate || image.value) {
            if (image.value) {
                convertBase64(image.files[0]).then((data) => {
                    imagePath = data;
                    console.log(imagePath);
                }).then(() => {
                    updateJob(id, title, imagePath, startdate, description).then((body) => {
                        document.getElementById("screen-job-update").style.display = "none";
                        popupError("job updateed successfully");
                        console.log(body);
                    }).catch((err) => {
                        popupError(err);
                    });
                }).catch((err) => {
                    popupError(err);
                });
            } else {
                updateJob(id, title, imagePath, startdate, description).then((body) => {
                    document.getElementById("screen-job-update").style.display = "none";
                    popupError("job updateed successfully");
                    console.log(body);
                }).catch((err) => {
                    popupError(err);
                });
            }
        } else {
            popupError("please fill in any of the required fields");
            console.log("here");
        }
    });
};

//----------------------------------//
//----------- delete job -----------//
//----------------------------------//

const deleteJob = (id) => {
    return apiCall("job", "DELETE", {
        "id": id,
    });
};

export function deleteNewJob(id, deleteBtn) {
    deleteBtn.addEventListener("click", (event) => {
        event.preventDefault();
        deleteJob(id).then((body) => {
            // document.getElementById("screen-job-update").style.display = "none";
            popupError("job deleted successfully");
            console.log(body);
        }).catch((err) => {
            popupError(err);
        });
    });
};