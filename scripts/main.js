import { CardSet } from "./cardset.js";

const flashcardSets = parseCardSetArray("flashcardSets");
const trash = parseCardSetArray("trash");

const speechSynth = window.speechSynthesis;
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
    return flashcardSetsObj.map((cardSet) => new CardSet(cardSet.title, cardSet.cards, cardSet.voice));
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

export { 
    flashcardSets, 
    trash,  
    availableVoices, 
    cloneCardSetTemplate, 
    cloneCardTemplate, 
    storeCardSet 
};
