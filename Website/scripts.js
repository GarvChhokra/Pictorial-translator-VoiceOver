"use strict";

const serverUrl = "http://127.0.0.1:8000";

async function uploadImage() {
    // encode input file as base64 string for upload
    let file = document.getElementById("file").files[0];
    let converter = new Promise(function(resolve, reject) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result
            .toString().replace(/^data:(.*,)?/, ''));
        reader.onerror = (error) => reject(error);
    });
    let encodedString = await converter;

    // clear file upload input field
    document.getElementById("file").value = "";

    // make server call to upload image
    // and return the server upload promise
    return fetch(serverUrl + "/images", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({filename: file.name, filebytes: encodedString})
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new HttpError(response);
        }
    })
}

function updateImage(image) {
    document.getElementById("view").style.display = "block";

    let imageElem = document.getElementById("image");
    imageElem.src = image["fileUrl"];
    imageElem.alt = image["fileId"];

    return image;
}

function translateImage(image) {
    // make server call to translate image
    // and return the server upload promise
    return fetch(serverUrl + "/images/" + image["fileId"] + "/translate-text", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({fromLang: "auto", toLang: "en"})
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new HttpError(response);
        }
    })
}

function annotateImage(translations) {
    let translationsElem = document.getElementById("translations");
    // Clear previous translations
    while (translationsElem.firstChild) {
        translationsElem.removeChild(translationsElem.firstChild);
    }
    let pTag = document.createElement("p");
    let translationText = document.createTextNode(translations["text"] + " -> \n" + translations["translation"]["translatedText"]);

    pTag.appendChild(translationText);
    pTag.setAttribute("id", "translationptag");

    translationsElem.appendChild(pTag);

    addAudio(translations["audio"]);
}

function addAudio(voice) {
    // wait for 5 sec
    setTimeout(addAudio, 5000);

    let translationElem = document.getElementById("translationptag");
    if (translationElem !== null) {
        let audioDiv = document.getElementById("audio");
        audioDiv.style.display = "block";

        let audioElem = document.getElementById("audiotag");

        audioElem.innerHTML = "";
        let sourceElem = document.createElement("source");
        sourceElem.src = "data:audio/mp3;base64,"+voice;
        sourceElem.type = "audio/mpeg";

        audioElem.appendChild(sourceElem);
    }
}


function uploadAndTranslate() {
    uploadImage()
        .then(image => updateImage(image))
        .then(image => translateImage(image))
        .then(res => annotateImage(res))
        .catch(error => {
            alert("Error: " + error);
        })
}

class HttpError extends Error {
    constructor(response) {
        super(`${response.status} for ${response.url}`);
        this.name = "HttpError";
        this.response = response;
    }
}
