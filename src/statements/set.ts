import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Set extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^SET /.test(str)) {
            return new Set(tokens);
        }
        return undefined;
    }

}