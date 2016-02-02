import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Format extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^FORMAT /.test(str)) {
            return new Format(tokens);
        }
        return undefined;
    }

}