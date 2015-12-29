import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Sort extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^SORT /.test(str)) {
            return new Sort(tokens);
        }
        return undefined;
    }

}