import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Case extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^CASE /.test(str)) {
            return new Case(tokens);
        }
        return undefined;
    }

}