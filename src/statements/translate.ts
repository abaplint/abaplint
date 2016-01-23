import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Translate extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^TRANSLATE /.test(str)) {
            return new Translate(tokens);
        }
        return undefined;
    }

}