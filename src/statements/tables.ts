import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Tables extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^TABLES /.test(str)) {
            return new Tables(tokens);
        }
        return undefined;
    }

}