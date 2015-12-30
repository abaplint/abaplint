import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Endinterface extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^ENDINTERFACE/.test(str)) {
            return new Endinterface(tokens);
        }
        return undefined;
    }

}