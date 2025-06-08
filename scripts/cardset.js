export class CardSet {
    constructor(title = "", cards = [], voice = undefined) {
        this.title = title;
        this.cards = cards.map((card) => new Card(card));
        this.voice = voice;
    }
}

class Card {
    constructor(data) {
        this.front = new CardSide(data.front);
        this.back = new CardSide(data.back);
    }
}

class CardSide {
    constructor(data) {
        this.text = data.text;
        this.image = data.image;
        this.audio = data.audio;
    }
}
