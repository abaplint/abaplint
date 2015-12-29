import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Type extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^TYPE(S?)(:?) /.test(str)) {
            return new Type(tokens);
        }
        return undefined;
    }

}