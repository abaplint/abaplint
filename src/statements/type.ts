import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Type extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^TYPE(-POOL)?(S?) /.test(str)) {
            return new Type(tokens);
        }
        return undefined;
    }

}