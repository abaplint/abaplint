import Token from "../token";

export class Statement {
    constructor(private tokens: Array<Token>) {
    }

    get_tokens(): Array<Token> {
        return this.tokens;
    }
}