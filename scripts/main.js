import { CardSet } from "./cardset.js";

const flashcardSets = parseCardSetArray("flashcardSets");
const trash = parseCardSetArray("trash");

const speechSynth = window.speechSynthesis;
speechSynth.cancel();
storeVoices();
speechSynth.onvoiceschanged = storeVoices;
const availableVoices = parseVoices();

/**
 * Updates flashcard sets of localStorage, i.e., replaces element at specified index 
 * with the card set passed. If index is null, then card set is inserted at the end.
 * @param {CardSet} cardSet Card set to be stored in localStorage.
 * @param {Number} index Index that the card set will be stored in.
 */
function storeCardSet(cardSet, index) {
    flashcardSets[index] = cardSet;
    localStorage.setItem("flashcardSets", JSON.stringify(flashcardSets));
}

/**
 * Gets and parses flashcardSets from localStorage.
 * @returns {Array<CardSet>} Array of CardSet objects stored under the key, 
 *      "flashcardSets", in localStroage.
 */
function parseCardSetArray(key) {
    const flashcardSetsObj = JSON.parse(localStorage.getItem(key)) ?? [];
    return flashcardSetsObj.map(
        (cardSet) => new CardSet(cardSet.title, cardSet.cards, cardSet.voice)
    );
}

/**
 * Maps the available voices from windows.SpeechSynthesis into an object and 
 * stores them in localStorage.
 */
function storeVoices() {
    const voices = speechSynth.getVoices();
    const mappedVoices = voices.map((voice) => ({
        label: `[${voice.lang}] ${voice.name}${voice.default ? " [Default]" : ""}`, 
        name: voice.name,
        lang: voice.lang,
        default: voice.default
    }));
    
    // Prevents reset by ensuring voices are stored when at least 1 is available.
    if (mappedVoices.length > 0) {
        localStorage.setItem("voices", JSON.stringify(mappedVoices));
    }
}

/**
 * Gets and parses voices from localStorage
 * @returns {Array<Object>} Array of object representation of speech synthesis
 *      voices under the key, "voices", in localStorage.
 */
function parseVoices() {
    return JSON.parse(localStorage.getItem("voices")) ?? [];
}

/**
 * Gets a clone of template with the id "card-set-template".
 * @returns {DocumentFragment} Clone of card set template.
 */
function cloneCardSetTemplate(numCards = 0, getCardsElement = () => {}) {
    const template = document.getElementById("card-set-template").content;
    const clone = document.importNode(template, true);
    const cardsElement = getCardsElement(clone);
    let cardClone;
    
    for (let i = 0; i < numCards; i++) {
        cardClone = cloneCardTemplate();
        cardsElement.appendChild(cardClone);
    }

    return clone
}

/**
 * Gets a clone of template with the id "card-template".
 * @returns {DocumentFragment} Clone of card template.
 */
function cloneCardTemplate() {
    const template = document.getElementById("card-template").content;
    const clone = document.importNode(template, true);
    return clone;
}

/**
 * Read aloud text of specified element's sibling with given voice.
 * @param {Element} button Element with a text element sibling to be read.
 * @param {String} voiceName Name of voice that will read the text.
 */
function speakSiblingText(button, voiceName) {
    const selectedVoice = speechSynth.getVoices().find(
        (voice) => voice.name == voiceName
    )

    const textElement = button.parentNode.getElementsByClassName("text")[0];
    const utterance = new SpeechSynthesisUtterance(textElement.innerText);
    if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
    }
    speechSynth.cancel();
    speechSynth.speak(utterance);
}

/**
 * Fade in element, then fade out after some specified time.
 * Note: Exact fade in and fade out transitions are specified with css under the 
 * '.fade-in' and '.fade-out' selectors.
 * @param {Element} element Element to fade in and fade out.
 * @param {*} timeout Variable to store timeout in.
 * @param {Numer} linger Time to show element in milliseconds before fading out.
 */
function popFadeAnimation(element, timeout, linger=2000) {
    clearTimeout(timeout);

    element.classList.remove("fade-out");
    element.classList.add("fade-in");
    
    timeout = setTimeout(() => {
        element.classList.remove("fade-in");
        element.classList.add("fade-out");
    }, linger);
}

/**
 * Show indicator for a specified time if an error occurs when calling given function.
 * @param {Function} func Function to call and check for error.
 * @param {*} timeout Variable to store timeout in.
 * @param {*} linger Time to show element in milliseconds before fading out.
 */
function indicateError(func, timeout, linger) {
    const errorMessage = document.getElementById("loading-error-message");
    try {
        func();
    } catch (error) {
        popFadeAnimation(errorMessage, timeout, linger);
        console.error(error)
    }
}

export { 
    flashcardSets, 
    trash,  
    speechSynth,
    availableVoices, 
    cloneCardSetTemplate, 
    cloneCardTemplate, 
    storeCardSet,
    speakSiblingText,
    popFadeAnimation,
    indicateError
};
