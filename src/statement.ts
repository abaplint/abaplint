import Token from "./token";

export default class Statement {
    private tokens: Array<Token>;

    constructor(tokens: Array<Token>) {
        this.tokens = tokens;
    }
}