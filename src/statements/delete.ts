import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Delete extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^DELETE /.test(str)) {
            return new Delete(tokens);
        }
        return undefined;
    }

}