import { CardSet, Card, CardSide } from "../scripts/cardset.js"

const expectedCardSide = {text:"", image:"", audio:""};
const expectedCard = {front: expectedCardSide, back: expectedCardSide};
const expectedCardSet = {title: "", cards: [], voice: undefined};
const separateObject = {a: 1, b: 2, c: 3};

test("empty cardSide", () => {
    const emptyCardSide = new CardSide();
    expect(emptyCardSide).toEqual(expectedCardSide);
});

test("empty card", () => {
    const emptyCard = new Card();
    expect(emptyCard).toEqual(expectedCard);
});

test("empty cardSet", () => {
    const emptyCardSet = new CardSet();
    expect(emptyCardSet).toEqual(expectedCardSet);
});

test("separate object in CardSide", () => {
    expect(new CardSide(separateObject)).toEqual(expectedCardSide);
});

test("separate object in Card", () => {
    expect(new Card(separateObject)).toEqual(expectedCard);
});

test("string card type in CardSet", () => {
    expect(new CardSet("", "string")).toEqual(expectedCardSet);
})

test("boolean card in CardSet", () => {
    const expected1Card = {
        title: "", cards: [expectedCard], voice: undefined
    };
    const boolCard = new CardSet("", [true]);
    expect(boolCard).toEqual(expected1Card);
})
