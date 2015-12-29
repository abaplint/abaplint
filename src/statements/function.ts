import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Function extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^FUNCTION /.test(str)) {
            return new Function(tokens);
        }
        return undefined;
    }

}