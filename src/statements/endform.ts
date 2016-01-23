import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Endform extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^ENDFORM/.test(str)) {
            return new Endform(tokens);
        }
        return undefined;
    }

}