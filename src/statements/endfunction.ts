import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Endfunction extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^ENDFUNCTION/.test(str)) {
            return new Endfunction(tokens);
        }
        return undefined;
    }

}