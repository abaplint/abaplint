import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Break extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^BREAK/.test(str)) {
            return new Break(tokens);
        }
        return undefined;
    }

}