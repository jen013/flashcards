import { flashcardSets } from "./main.js";

const searchParams = new URLSearchParams(window.location.search);
const cardSetIdx = searchParams.get("index");
const cardSetData = flashcardSets[cardSetIdx];
const cardsLength = cardSetData.cards.length;
const settingsForm = document.getElementById("settings");
const cardDisplayForm = document.getElementById("card-display");
const settingsDialog = document.getElementById("settings-dialog");

let settingsFormData;
let currentCard, totalCards;
let randomOrderArray, randomSideArray, prevCard;

init();

/**
 * Set all variables and all button/input functionalities.
 */
function init() {
    const titleElement = document.getElementsByClassName("title")[0];

    titleElement.textContent = cardSetData.title;
    reset();
    addSubmitEvents();
    addCheckboxConditions();
    addCardNavigationEvents();
    addCardDisplayEvents();
    settingsDialog.showModal();
}

/**
 * [Re]sets all variable values.
 */
function reset() {
    currentCard = 1;
    randomOrderArray = [];
    randomSideArray = [];
    prevCard = randomInt(0, cardsLength);
}

/**
 * Sets functionality of submit form buttons, i.e., play and end buttons.
 * Only one form available at a time.
 */
function addSubmitEvents() {
    // Starts card display based on selected options from form.
    settingsForm.addEventListener("submit", (event) => {
        event.preventDefault();
        settingsFormData = new FormData(settingsForm);
    
        if (cardsLength == 0) {
            alert("Flashcard set is empty.");
            return;
        }

        settingsDialog.close();
    
        pushRandomOrder(settingsFormData.get("card-shuffle"));
        pushRandomSide();
    
        updateCardCount();
        fillCardData();
        updateCardDisplay();
    });

    // Resets and stops card display.
    cardDisplayForm.addEventListener("submit", (event) => {
        event.preventDefault();
        settingsDialog.showModal();
        reset();
    });
}


// =========================== FORM OPTION CONDITIONS ===========================

/**
 * Disallows shuffle and true random checkboxes to be enabled together to 
 * prevent redundancy.
 */
function addCheckboxConditions() {
    const infiniteModeCheckbox = settingsForm["infinite-mode"];
    const trueRandomCheckbox = settingsForm["true-random"];
    const shuffleCheckbox = settingsForm["shuffle"];
    
    trueRandomCheckbox.addEventListener("click", () => {
        if (trueRandomCheckbox.checked) {
            shuffleCheckbox.disabled = true;
        } else {
            shuffleCheckbox.removeAttribute("disabled");
        }
    });
    infiniteModeCheckbox.addEventListener("click", () => {
        if (infiniteModeCheckbox.checked) {
            trueRandomCheckbox.removeAttribute("disabled");
        } else {
            trueRandomCheckbox.disabled = true;
        }
    });
}


// =========================== CARD CONTROLS FUNCTION ===========================

/**
 * Sets functionality of card back and card forward buttons. Updates current
 * card count and displays appropriate card.
 */
function addCardNavigationEvents() {
    const cardBackButton = cardDisplayForm["card-back"];
    const cardForwardButton = cardDisplayForm["card-forward"];
    
    cardBackButton.addEventListener("click", () => {
        if (currentCard <= 1) {
            return;
        }
        updateCardCount(-1);
        fillCardData();
        updateCardDisplay();
    });
    
    cardForwardButton.addEventListener("click", () => {
        if (currentCard >= totalCards) {
            return;
        }
        updateCardCount(+1);
        fillCardData();
        updateCardDisplay();
    });
}

/**
 * Updates current card value based on specified addend, and updates totalCards 
 * based on mode selected. If current card value starts to exceed random 
 * @param {Number} addend Amount to move currentCard by.
 */
function updateCardCount(addend = 0) {
    const cardCountElement = document.getElementsByClassName("card-count")[0];
    const cardShuffle = settingsFormData.get("card-shuffle");
    const infiniteMode = settingsFormData.get("infinite-mode");
    const displayFirst = settingsFormData.get("display-first");
    let totalCardsString;
    
    currentCard += addend;
    totalCards = infiniteMode ? Infinity : cardsLength;
    totalCardsString = infiniteMode ? "?" : cardsLength;

    cardCountElement.innerText = currentCard + "/" + totalCardsString;
    
    // Extend random order/side arrays when needed.
    if (currentCard >= randomOrderArray.length && cardShuffle && infiniteMode) {
        pushRandomOrder(cardShuffle);
    } 
    if (currentCard >= randomSideArray.length && displayFirst == "random") {
        pushRandomSide();
    }
}

/**
 * Populates card element with data from appropriate card index based on 
 * length of cards and shuffle mode.
 */
function fillCardData() {
    const cardShuffle = settingsFormData.get("card-shuffle");
    let cardIndex;

    if (cardsLength == 1) {
        cardIndex = 0;
    } else if (cardsLength == 2) {
        // Add random previous card index if shuffle is on
        cardIndex = ((currentCard - 1) + (cardShuffle ? prevCard : 0)) % 2;
    } else if (cardShuffle) {
        cardIndex = randomOrderArray[currentCard - 1];
    } else {
        cardIndex = (currentCard - 1) % cardsLength;
    }

    const card = cardSetData.cards[cardIndex];
    for (let [side, data] of Object.entries(card)) {
        cardDisplayForm[side].querySelector("p").innerText = data.text;
        cardDisplayForm[side].querySelector("img").setAttribute("src", data.image);
        cardDisplayForm[side].querySelector("audio > source").setAttribute("src", data.audio);
    }
}


// =========================== DISPLAY CARD FUNCTIONS ===========================

/**
 * Sets functionality of inputs that affect card view and updates card side displayed.
 */
function addCardDisplayEvents()  {
    const flipButton = cardDisplayForm["flip-card"];
    const cardViewToggle = cardDisplayForm["card-view-toggle"];
    const revealButtons = cardDisplayForm["reveal-card"];
    const resetDisplayButton = cardDisplayForm["reset-card-display"];
    
    // Swaps which card side is being displayed.
    flipButton.addEventListener("click", () => {
        const hiddenSide = document.querySelector(".card .hidden-side").name;
        updateCardDisplay(hiddenSide);
    });
    
    // Makes both card sides visible, updates text of toggle, and hides flip button.
    cardViewToggle.addEventListener("click", () => {
        if (cardViewToggle.value == "view-both-sides") {
            cardViewToggle.value = "view-one-side";
            cardViewToggle.labels[0].innerText = "◫";
            cardDisplayForm["flip-card"].removeAttribute("hidden");
    
        } else if (cardViewToggle.value == "view-one-side") {
            cardViewToggle.value = "view-both-sides";
            cardViewToggle.labels[0].innerText = "❏";
            cardDisplayForm["flip-card"].hidden = true;
        }
    
        updateCardDisplay();
    });

    // Toggles visibility of button cover.
    revealButtons.forEach((button) => button.addEventListener("click", () => {
        button.hidden = true;
    }));

    // Rehides appropriate card side.
    resetDisplayButton.addEventListener("click", () => updateCardDisplay());
}

/**
 * Makes specified card side visible and hides the other, unless card view toggle is 
 * set to view both sides.
 * @param {String} displaySide Card side to be displayed: "front" or "back".
 */
function updateCardDisplay(displaySide) {
    const cardViewToggle = cardDisplayForm["card-view-toggle"];
    
    // Add appropriate class to card for styling.
    if (cardViewToggle.value == "view-both-sides") {
        cardDisplayForm["card"].classList.add("view-both");
    } else {
        cardDisplayForm["card"].classList.remove("view-both");
    }

    // Get display side based on form options if no display side specified.
    if (displaySide == null) {
        displaySide = settingsForm["display-first"].value;
        if (displaySide == "random") {
            displaySide = (randomSideArray[currentCard-1] == 0 ? "front" : "back");
        }
    }
    
    const hideSide = displaySide == "front" ? "back" : "front";
    
    cardDisplayForm[displaySide].classList.remove("hidden-side");
    cardDisplayForm[hideSide].classList.add("hidden-side");
    resetRevealButtons();
}

/**
 * Resets/Unhides all reveal buttons.
 */
function resetRevealButtons() {
    const revealButtons = cardDisplayForm["reveal-card"];

    revealButtons.forEach((button) => {
        button.removeAttribute("hidden");
    })
}


// =========================== RANDOM ORDER FUNCTIONS ===========================

/**
 * Extends random order array by an array made up of random indices based on 
 * specified card mode.
 * @param {String} mode Card order mode selected.
 */
function pushRandomOrder(mode) {
    // Early return for simple cases, since no random order array is needed.
    if (cardsLength <= 2) {
        return;
    }
    if (mode == "shuffle") {
        randomOrderArray.push(...getShuffleOrder());
    } else if (mode == "true-random") {
        randomOrderArray.push(...getRandomOrder());
    } 
}

/**
 * Randomly reorders and gets an array from 0 to cards length, n, (exclusive). 
 * Each element at index, i, randomly swaps with another element randomly chosen 
 * from indices i to n-1. Matching a card with the previous card index is prevented.
 * @returns {Array<Number>} Array of shuffled integers.
 */
function getShuffleOrder() {
    const shuffleArray = Array.from(Array(cardSetData.cards.length).keys());
    let temp, rand;

    // Iteration excludes last element, since swapping here is not needed.
    for (let i = 0; i < cardsLength-1; i++) {
        // Make sure this first random index doesn't match the previous card index.
        // For the rest, randomly pick from remaining indices in array to swap with.
        if (i == 0) {
            const indexArray = Array.from(Array(cardsLength).keys());
            indexArray[prevCard] = cardsLength - 1;
            indexArray[cardsLength - 1] = prevCard;
            rand = indexArray[randomInt(0, cardsLength - 1)];
        } else {
            rand = randomInt(i, cardsLength);
        }

        // Swap index and randomly selected index.
        temp = shuffleArray[i];
        shuffleArray[i] = shuffleArray[rand];
        shuffleArray[rand] = temp;
    }

    prevCard = shuffleArray[cardsLength-1];
    return shuffleArray;
}

/**
 * Gets an array of randomly chosen card indices, with no matching adjacent elements.
 * Matching a card with the previous card index is prevented.
 * @returns {Array<Number>} Array of random integers.
 */
function getRandomOrder() {
    const trueRandomArray = Array(cardsLength);
    const indexArray = Array.from(trueRandomArray.keys());
    let rand;
    
    for (let i = 0; i < cardsLength; i++) {
        // Don't allow repeat index chosen by moving previous card index to the end
        indexArray[prevCard] = cardsLength - 1;
        indexArray[cardsLength - 1] = prevCard;

        // Choose from cardsLength-1 indices, excluding the previous card index
        rand = indexArray[randomInt(0, cardsLength - 1)];
        trueRandomArray[i] = rand;
        
        // Reset indexArray for next iteration's use
        indexArray[cardsLength - 1] = cardsLength - 1;
        indexArray[prevCard] = prevCard;
        
        prevCard = trueRandomArray[i];
    }

    return trueRandomArray;
}

/**
 * Extends random order array by an array made up of random 0s and 1s.
 */
function pushRandomSide() {
    const randomSideExtension = Array(cardsLength);
    for (let i = 0; i < cardsLength; i++) {
        randomSideExtension[i] = randomInt(0, 2);
    }
    randomSideArray.push(...randomSideExtension);
}

/**
 * Gets a random integer from specified range.
 * ex: randomInt(0, 4) randomly returns 0, 1, 2, or 3.
 * @param {Number} min Minimum of range.
 * @param {Number} max Maximum of range.
 * @returns {Number} Random integer from min (inclusive) to max (exclusive).
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max-min)) + min;
}
