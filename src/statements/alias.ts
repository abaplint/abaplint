import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Alias extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^ALIASES /.test(str)) {
            return new Alias(tokens);
        }
        return undefined;
    }

}