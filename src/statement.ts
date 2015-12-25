import Token from "./token";

export default class Statement {

    constructor(private tokens: Array<Token>) {
    }

    get_tokens(): Array<Token> {
        return this.tokens;
    }
}