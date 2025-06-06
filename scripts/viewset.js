import { flashcardSets, cloneCardTemplate, trash } from "./main.js";
import { CardSet } from "./cardset.js";

const searchParams = new URLSearchParams(window.location.search);
const cardSetIdx = parseInt(searchParams.get("index")) ?? flashcardSets.length;
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

    addEditFunctionality();
    addNavigationFunctionality();
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
/**
 * Makes interactive elements of document functional by adding event handlers and 
 * dynamic inputs.
 */
function addEditFunctionality() {
    const newCardButton = document.getElementsByName("add-card-button")[0];
    newCardButton.addEventListener("click", () => addCardInput(newCardButton));
}

/**
 * Updates page to have additional card fieldset at specified element.
 * @param {Element} clickedButton The new card button that called the function.
 */
function addCardInput(clickedButton = document.getElementsByName("add-card-button")[0]) {
    const cardSet = document.getElementsByClassName("card-set")[0];
    const clonedButton = document.getElementsByName("add-card-button")[0].cloneNode(true);
    let clonedCard = cloneCardTemplate();
    const deleteButton = clonedCard.querySelector("[name='delete-card-button'");
    
    cardSet.insertBefore(clonedButton, clickedButton.nextElementSibling);
    cardSet.insertBefore(clonedCard, clickedButton.nextElementSibling);

    // Reassign clonedCard from empty document fragment to appropriate element in document.
    clonedCard = clonedButton.previousElementSibling;
    
    clonedButton.addEventListener("click", () => addCardInput(clonedButton));
    deleteButton.addEventListener("click", () => {
        clonedButton.remove();
        clonedCard.remove();
    });
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
    cardSetForm.addEventListener("submit", (event) => {
        event.preventDefault();
        storeSet(formToCardSet(), cardSetIdx);
        window.location.search = "?index=" + cardSetIdx;
    });
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
 * Creates a CardSet object and populates it with data from the document.
 * @returns {CardSet} A card set with form data.
 */
function formToCardSet() {
    const cardInputs = document.getElementsByName("card");
    const titleInput = document.getElementsByClassName("title")[0];
    const cardsArray = Array(cardInputs.length);
    let card;

    for (let i = 0; i < cardsArray.length; i++) {
        card = {front: {}, back: {}};

        Object.keys(card).forEach((side) => {
            card[side]["text"] = cardInputs[i].elements[side].children["text"].innerText;
            card[side]["image"] = cardInputs[i].elements[side].elements["image"].value;
            card[side]["audio"] = cardInputs[i].elements[side].elements["image"].value;
        });

        cardsArray[i] = card;
    }

    return new CardSet(titleInput.value, cardsArray);
}

/**
 * Updates flashcard sets of localStorage, i.e., replaces element at specified index 
 * with the card set passed. If index is null, then card set is inserted at the end.
 * @param {CardSet} cardSet Card set to be stored in localStorage.
 * @param {Number} index Index that the card set will be stored in.
 */
function storeSet(cardSet, index) {
    flashcardSets[index] = cardSet;
    localStorage.setItem("flashcardSets", JSON.stringify(flashcardSets));
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