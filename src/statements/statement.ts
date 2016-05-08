import { Token, Pragma } from "../tokens/";
import Position from "../position";

export abstract class Statement {

    public static match(tokens: Array<Token>): Statement {
        return undefined;
    }

    public static concat(tokens: Array<Token>): string {
        let str = "";
        let prev: Token;
        for (let token of tokens) {
            if (token instanceof Pragma) {
                continue;
            }
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

    public constructor(private tokens: Array<Token>) {

    }

    public get_start(): Position {
        return this.get_tokens()[0].get_pos();
    }

    public get_tokens(): Array<Token> {
        return this.tokens;
    }

    public concat_tokens(): string {
        return Statement.concat(this.tokens);
    }

    public get_terminator(): string {
        return this.get_tokens()[this.get_tokens().length - 1].get_str();
    }

}