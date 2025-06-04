import { flashcardSets, cloneCardTemplate } from "./main.js";
import { CardSet } from "./cardset.js";

addFunctionality();

/**
 * Makes interactive elements of document functional by adding event handlers and 
 * dynamic inputs.
 */
function addFunctionality() {
    const url = new URL(window.location.href);
    const cardSetIdx = url.searchParams.get("index") ?? flashcardSets.length;

    const newCardButton = document.getElementsByName("add-card-button")[0];
    const cardSetForm = document.getElementById("card-set-form");
    
    newCardButton.addEventListener("click", () => addCardInput(newCardButton));
    cardSetForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const newCardSet = formToCardSet();
        storeSet(newCardSet, cardSetIdx);
        window.location.href = "./viewset.html?index=" + cardSetIdx;
    });
}

/**
 * Updates newset.html to have additional card fieldset at specified element.
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

export { addCardInput };