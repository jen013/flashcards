class CardSet {
    constructor(title = "", cards = [], voice = undefined) {
        this.title = String(title);
        this.cards = cards.map?.((card) => new Card(card)) ?? [];
        this.voice = voice;
    }
}

class Card {
    constructor(data) {
        this.front = new CardSide(data?.front);
        this.back = new CardSide(data?.back);
    }
}

class CardSide {
    constructor(data) {
        this.text = String(data?.text ?? "");
        this.image = "";
        this.audio = "";
    }
}

export { CardSet, Card, CardSide };