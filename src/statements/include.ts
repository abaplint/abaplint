import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Include extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^INCLUDE /.test(str)) {
            return new Include(tokens);
        }
        return undefined;
    }

}