import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Get extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^GET /.test(str)) {
            return new Get(tokens);
        }
        return undefined;
    }

}