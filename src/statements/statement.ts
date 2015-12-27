import { Token } from "../tokens/tokens";

export abstract class Statement {
    constructor(private tokens: Array<Token>) {
    }

    public get_tokens(): Array<Token> {
        return this.tokens;
    }

    public concat_tokens(): string {
        let str = "";
        let prev: Token;
        for (let token of this.tokens) {
            if (str === "") {
                str = token.get_str();
            } else if (prev.get_str().length + prev.get_col() === token.get_col()
                    && prev.get_row() === token.get_row()) {
                str = str + token.get_str();
            } else {
                str = str + " " + token.get_str();
            }
            prev = token;
        }
        return str;
    }
}