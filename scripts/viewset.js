import { 
    flashcardSets, 
    availableVoices, 
    cloneCardTemplate, 
    trash, 
    storeCardSet, 
    speakSiblingText 
} from "./main.js";
import { CardSet } from "./cardset.js";

const searchParams = new URLSearchParams(window.location.search);
const cardSetIdx = searchParams.get("index") ?? flashcardSets.length;
const cardSetData = flashcardSets[cardSetIdx];

init();

/**
 * Sets document to appropriate edit mode and fills with data and functionality. 
 * Navigates to home page if no card set is found.
 */
function init() {
    const pageTitleElement = document.getElementsByTagName("title")[0];
    // filledVoices has to come before fillDocument to properly set selected voice.
    fillVoices();
    
    // fillDocument has to come before setEditable/setReadOnly to properly set page title.
    if (cardSetIdx >= 0 && cardSetIdx < flashcardSets.length) {
        fillDocument();
    } else if (window.location.search != "?create=true") {
        window.location.search = "?create=true";
    }

    if (searchParams.get("create") === "true") {
        pageTitleElement.textContent = "Create Flashcard Set";
        setEditable(true);
    } else if (searchParams.get("edit") === "true") {
        pageTitleElement.textContent += " - Edit";
        setEditable();
    } else {
        pageTitleElement.textContent += " - View";
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
    const voiceSelect = document.getElementById("voice-select");
    const cardInputs = document.getElementsByName("card");
    const cardsArray = cardSetData.cards;
    let card;
    
    pageTitleElement.textContent = cardSetData.title;
    titleInput.value = cardSetData.title;
    titleInput.setAttribute("title", titleInput.value);

    for (const option of voiceSelect.options) {
        if (option.value == cardSetData.voice) {
            option.selected = true;
            break
        }
    }
    
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
 * Populates select element with available voices.
*/
function fillVoices() {
    const voiceSelect = document.getElementById("voice-select");
    let voiceOption;

    for (const voice of availableVoices) {
        voiceOption = document.createElement("option");
        voiceOption.textContent += voice.label;
        voiceOption.value = voice.name;
        voiceSelect.appendChild(voiceOption);
    }
}

/**
 * Makes form editable and hides and reveals appropriate elements.
 * @param {boolean} create Whether the set is being created or edited, i.e., 
 *      true if new set will be created, and false if an existing set will be edited.
 */
function setEditable(create=false) {
    const cardSetForm = document.getElementById("card-set-form");
    const title = cardSetForm["title"];

    title.removeAttribute("readonly");
    title.setAttribute("placeholder", "Enter Title Here");

    if (create) {
        cardSetForm["card-set-interactions"].hidden = true;
    } else {
        cardSetForm["edit-button"].disabled = true;
        cardSetForm["play-button"].disabled = true;
    }

    setAllFormElements(cardSetForm["add-card-button"], 
        (button) => button.removeAttribute("hidden")
    );

    cardSetForm["cancel-button"].removeAttribute("hidden");
    cardSetForm["save-button"].removeAttribute("hidden");
    cardSetForm["settings"].removeAttribute("hidden");
}

/**
 * Makes interactive elements of document functional by adding event handlers and 
 * dynamic inputs.
 */
function setReadOnly() {
    const cardSetForm = document.getElementById("card-set-form");

    setAllFormElements(cardSetForm["delete-card-button"], 
        (button) => button.hidden = true
    );
    
    const readCardContentOnly = (side) => side.children["text"].contentEditable = "false";
    setAllFormElements(cardSetForm["front"], readCardContentOnly);
    setAllFormElements(cardSetForm["back"], readCardContentOnly);
}

/**
 * Call specific function on all given form elements.
 * @param {Element|NodeList} element Results from accessing form element[s].
 * @param {function} action Function to execute on the form element[s].
 */
function setAllFormElements(element, action) {
    if (element && !(element instanceof NodeList)) {
        element = [element]
    }
    if (element) {
        element.forEach(action);
    }
}

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
    const deleteButton = clonedCard.querySelector("[name='delete-card-button']");
    const speakButtons = clonedCard.querySelectorAll("[name='speak-text']");
    const voiceSelect = document.getElementById("voice-select");
    
    cardSet.insertBefore(clonedButton, clickedButton.nextElementSibling);
    cardSet.insertBefore(clonedCard, clickedButton.nextElementSibling);

    // Reassign clonedCard from empty document fragment to appropriate element in document.
    clonedCard = clonedButton.previousElementSibling;
    
    clonedButton.addEventListener("click", () => addCardInput(clonedButton));
    deleteButton.addEventListener("click", () => {
        clonedButton.remove();
        clonedCard.remove();
    });

    speakButtons.forEach((button) => button.addEventListener("click", () => {
        speakSiblingText(button, voiceSelect.value)
    }));
}

/**
 * Makes delete button functional. Clicking moves card set from flashcard sets to trash.
 */
function addNavigationFunctionality() {
    const cardSetForm = document.getElementById("card-set-form");
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
    });
    editButton.addEventListener("click", () => updateEditableURL(true));
    deleteButton.addEventListener("click", () => deletePopupDialog.showModal());

    cancelButton.addEventListener("click", () => {
        if (searchParams.get("create") === "true") {
            window.location.href = './';
        } else {
            updateEditableURL(false);
        }
    });
    cardSetForm.addEventListener("submit", (event) => {
        event.preventDefault();
        storeCardSet(formToCardSet(), cardSetIdx);
        window.location.search = "?index=" + cardSetIdx;
    });
}

/**
 * Updates URL with specified edit parameter.
 * @param {boolean} edit Editability to set document to.
 */
function updateEditableURL(edit) {
    const editSearchParams = new URLSearchParams();

    editSearchParams.set("index", cardSetIdx);
    if (edit) {
        editSearchParams.set("edit", true);
    }

    window.location.search = editSearchParams;
}

/**
 * Makes delete popup functional. Clicking moves card set from flashcard sets to trash.
 */
function addDeletePopupFunctionality() {
    const deletePopupDialog = document.getElementById("delete-popup-dialog");
    const deletePopupForm = document.getElementById("delete-popup-form");
    const deleteCancelButton = document.getElementsByClassName("delete-cancel")[0];

    deletePopupForm.addEventListener("submit", (event) => {
        event.preventDefault();
        deleteCardSet();
        window.location.href = "./";
    });
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
    const voiceSelect = document.getElementById("voice-select");
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

    return new CardSet(titleInput.value, cardsArray, voiceSelect.value);
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