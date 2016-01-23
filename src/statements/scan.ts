import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Scan extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^SCAN /.test(str)) {
            return new Scan(tokens);
        }
        return undefined;
    }

}