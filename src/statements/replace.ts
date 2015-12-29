import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Replace extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^REPLACE /.test(str)) {
            return new Replace(tokens);
        }
        return undefined;
    }

}