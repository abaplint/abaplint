import { Statement } from "./statement";
import { Token } from "../tokens/";

export class End extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^END-OF-SELECTION/.test(str)) {
            return new End(tokens);
        }
        return undefined;
    }

}