import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Endif extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^ENDIF/.test(str)) {
            return new Endif(tokens);
        }
        return undefined;
    }

}