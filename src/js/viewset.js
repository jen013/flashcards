import { flashcardSets, trash } from "./main.js";
// First new card button and submit button functionalities are also set at this import.
import { addCardInput } from "./newset.js";

const searchParams = new URLSearchParams(window.location.search);
const cardSetIdx = searchParams.get("index");
const cardSetData = flashcardSets[cardSetIdx];

init();

/**
 * Sets document to appropriate edit mode and fills with data and functionality. 
 * Navigates to home page if no card set is found.
 */
function init() {
    if (cardSetIdx == null) {
        window.location.href = "./";
    }
    // fillDocument has to come before setEditable/setReadOnly to properly set page title.
    fillDocument();
    if (searchParams.get("edit") === "true") {
        setEditable();
    } else {
        setReadOnly();
    }
    addCardSetFunctionality();
    addDeletePopupFunctionality();
}

/**
 * Populates document with appropriate data from localStorage.
*/
function fillDocument() {
    const pageTitleElement = document.getElementsByTagName("title")[0];
    const titleInput = document.getElementsByClassName("title")[0];
    const cardInputs = document.getElementsByName("card");
    const cardsArray = cardSetData.cards;
    let card;
    
    pageTitleElement.textContent = cardSetData.title;
    titleInput.value = cardSetData.title;
    titleInput.setAttribute("title", titleInput.value);
    
    // Add all necessary card inputs.
    cardsArray.forEach(() => addCardInput());

    for (let i = 0; i < cardsArray.length; i++) {
        card = cardsArray[i];

        Object.keys(card).forEach((side) => {
            cardInputs[i].elements[side].children["text"].innerText = card[side]["text"];
            cardInputs[i].elements[side].elements["image"].value = card[side]["image"];
            cardInputs[i].elements[side].elements["image"].value = card[side]["audio"];
        });
    }
}

/**
 * Makes form editable and hides and reveals appropriate elements;
 */
function setEditable() {
    const cardSetForm = document.getElementById("card-set-form");
    const pageTitleElement = document.getElementsByTagName("title")[0];
    pageTitleElement.textContent += " - Edit";

    for (const element of cardSetForm.elements) {
        if (element.className == "title") {
            element.setAttribute("placeholder", "Enter Title Here")
            element.removeAttribute("readonly");

        } else if (element.className == "play-button") {
            element.disabled = true;

        } else if (element.className == "edit-button") {
            element.disabled = true;

        } else if (element.className == "delete-button") {
            continue;

        } else if (element.type == "button" || element.type == "submit") {
            element.removeAttribute("hidden");

        } else if (element.name == "front" || element.name == "back") {
            element.children["text"].contentEditable = "true";
        }
    }
}

/**
 * Converts form to read only and hides and reveals appropriate elements;
 */
function setReadOnly() {
    const cardSetForm = document.getElementById("card-set-form");
    const pageTitleElement = document.getElementsByTagName("title")[0];
    pageTitleElement.textContent += " - View";

    for (const element of cardSetForm.elements) {
        if (element.className == "title") {
            element.removeAttribute("placeholder");
            element.readOnly = true;

        } else if (element.className == "play-button") {
            element.removeAttribute("disabled");

        } else if (element.className == "edit-button") {
            element.removeAttribute("disabled");

        } else if (element.className == "delete-button") {
            continue;

        } else if (element.type == "button" || element.type == "submit") {
            element.hidden = true;

        } else if (element.name == "front" || element.name == "back") {
            element.children["text"].contentEditable = "false";
        }
    }
}

/**
 * Makes delete button functional. Clicking moves card set from flashcard sets to trash.
 */
function addCardSetFunctionality() {
    const titleInput = document.getElementsByClassName("title")[0];
    const playButton = document.getElementsByClassName("play-button")[0];
    const cancelButton = document.getElementsByClassName("cancel-button")[0];
    const editButton = document.getElementsByClassName("edit-button")[0];
    const deleteButton = document.getElementsByClassName("delete-button")[0];
    const deletePopupDialog = document.getElementById("delete-popup-dialog");

    titleInput.addEventListener("input", () => {
        titleInput.setAttribute("title", titleInput.value);
    });
    playButton.addEventListener("click", () => {
        window.location.href = './playset.html' + window.location.search;
    })
    cancelButton.addEventListener("click", () => updateEditableURL(false));
    editButton.addEventListener("click", () => updateEditableURL(true));
    deleteButton.addEventListener("click", () => deletePopupDialog.showModal());
}

/**
 * Updates URL with specified edit parameter.
 * @param {boolean} edit Editability to set document to.
 */
function updateEditableURL(edit) {
    edit ? searchParams.set("edit", true) : searchParams.delete("edit");
    window.location.search = searchParams.toString();
}

/**
 * Makes delete popup functional. Clicking moves card set from flashcard sets to trash.
 */
function addDeletePopupFunctionality() {
    const deletePopupDialog = document.getElementById("delete-popup-dialog");
    const deletePopupForm = document.getElementById("delete-popup-form");
    const deleteCancelButton = document.getElementsByClassName("delete-cancel")[0];

    deletePopupForm.addEventListener("submit", () => deleteCardSet());
    deletePopupForm.addEventListener("mousedown", (event) => event.stopPropagation());
    deleteCancelButton.addEventListener("click", () => deletePopupDialog.close());
    deletePopupDialog.addEventListener("mousedown", () => deletePopupDialog.close());
}

/**
 * Moves card set from flashcard sets to trash and nagivates home page.
 */
function deleteCardSet() {
    flashcardSets.splice(cardSetIdx, 1);
    trash.push(cardSetData);
    
    localStorage.setItem("flashcardSets", JSON.stringify(flashcardSets));
    localStorage.setItem("trash", JSON.stringify(trash));
}