import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class At extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^AT /.test(str)) {
            return new At(tokens);
        }
        return undefined;
    }

}