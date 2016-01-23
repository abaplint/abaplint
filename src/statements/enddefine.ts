import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Enddefine extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^END-OF-DEFINITION/.test(str)) {
            return new Enddefine(tokens);
        }
        return undefined;
    }

}