import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Endmethod extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^ENDMETHOD/.test(str)) {
            return new Endmethod(tokens);
        }
        return undefined;
    }

}