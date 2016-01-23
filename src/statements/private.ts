import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Private extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^PRIVATE SECTION/.test(str)) {
            return new Private(tokens);
        }
        return undefined;
    }

}