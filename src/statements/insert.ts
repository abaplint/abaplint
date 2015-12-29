import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Insert extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^INSERT /.test(str)) {
            return new Insert(tokens);
        }
        return undefined;
    }

}