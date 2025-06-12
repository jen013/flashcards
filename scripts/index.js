import { flashcardSets, cloneCardSetTemplate, storeCardSet } from "./main.js";
import { CardSet } from "./cardset.js";

init();

/**
 * Sets up starting page.
 */
function init() {
    const introMessage = document.getElementsByClassName("intro-message")[0];
    if (!flashcardSets?.length) {
        introMessage.removeAttribute("hidden");
    }

    const createButton = document.getElementById("new-set-button");
    createButton.addEventListener("click", () => {
        window.location.href = "./viewset.html?create=true"
    });

    const importTextButton = document.getElementById("import-text-button");
    const importPopupDialog = document.getElementById("import-popup-dialog");
    importTextButton.addEventListener("click", () => importPopupDialog.showModal());
    
    addImportPopupFunctionality();
    previewFlashcardSets();
}

/**
 * Makes import popup functional. Submitting imports converts and saves string to 
 * flashcard sets.
 */
function addImportPopupFunctionality() {
    const importPopupDialog = document.getElementById("import-popup-dialog");
    const importPopupForm = document.getElementById("import-popup-form");
    const importCancelButton = importPopupForm["import-cancel"];
    const importTextInput = importPopupForm["import-text"];
    const importFailMsg = document.getElementsByClassName("import-fail-message")[0];

    importCancelButton.addEventListener("click", () => {
        importFailMsg.hidden = true;
        importTextInput.value = "";
        importPopupDialog.close();
    });
    importPopupForm.addEventListener("submit", (event) => {
        if (!(importFromText(importTextInput.value))) {
            event.preventDefault();
        };
    });
}

/**
 * Converts text to a card set and appends it to flashcard sets of localStorage.
 * @param {String} text Input to parse into a CardSet.
 * @returns Boolean of whether or not the card set was successfully stored.
 */
function importFromText(text) {
    const importFailMsg = document.getElementsByClassName("import-fail-message")[0];
    try {
        const parsed = JSON.parse(text);
        const cardSet = new CardSet(parsed.title, parsed.cards, parsed.voice);
        storeCardSet(cardSet, flashcardSets.length);
        return true;
    } catch {
        importFailMsg.removeAttribute("hidden");
        return false;
    }
}

/**
 * Gets flashcard sets from localStorage and adds them to document.
 */
function previewFlashcardSets() {
    const flashcardSetsElement = document.getElementById("flashcard-sets");
    let cardSetElement = document.getElementsByClassName("card-set");
    let cardSetClone;
    
    for (let i = 0; i < flashcardSets.length; i++) {
        cardSetClone = cloneCardSetTemplate();
        flashcardSetsElement.appendChild(cardSetClone);
        fillCardSetElement(cardSetElement[i], flashcardSets[i], i);
    }
}

/**
 * Populates element with data from specified card set and index.
 * @param {Element} element Element to populated with data.
 * @param {CardSet} cardSet Card set with data.
 * @param {Number} index Index to set title href attribute to.
 */
function fillCardSetElement(element, cardSet, index) {
    const playButton = element.querySelector(".play-button");
    const editButton = element.querySelector(".edit-button");
    const titleElement = element.querySelector(".title");
    const cardsElement = element.querySelector(".cards-summary");
    const cardLengthElement = element.querySelector(".cards-length");
    let card;

    // Set button navigations
    playButton.addEventListener("click", () => {
        window.location.href = "./playset.html?index=" + index;
    });
    editButton.addEventListener("click", () => {
        window.location.href = "./viewset.html?index=" + index + "&edit=true";
    });

    // Fill title element
    titleElement.textContent = cardSet.title;
    titleElement.setAttribute("href", "./viewset.html?index=" + index);

    // Fill card length element
    cardLengthElement.textContent = cardSet.cards.length;
    
    // Fill card summary with data
    let cardsSummary = "";
    for (let i = 0; i < cardSet.cards.length; i++) {
        card = cardSet.cards[i];

        cardsSummary += card.front.text + ", " + card.back.text;
        if (i < cardSet.cards.length-1) {
            cardsSummary += "; ";
        } 
    }
    cardsElement.textContent = cardsSummary;
}