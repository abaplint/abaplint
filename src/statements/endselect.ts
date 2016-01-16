import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Endselect extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^ENDSELECT/.test(str)) {
            return new Endselect(tokens);
        }
        return undefined;
    }

}