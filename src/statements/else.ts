import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Else extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^ELSE/.test(str)) {
            return new Else(tokens);
        }
        return undefined;
    }

}