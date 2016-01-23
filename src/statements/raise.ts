import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Raise extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^RAISE /.test(str)) {
            return new Raise(tokens);
        }
        return undefined;
    }

}