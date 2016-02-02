import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Empty extends Statement {

    public static match(tokens: Array<Token>): Statement {
        if (tokens.length === 1 && tokens[0].get_str() === ".") {
            return new Empty(tokens);
        }
        return undefined;
    }

}