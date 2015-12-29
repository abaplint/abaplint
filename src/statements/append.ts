import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Append extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^APPEND /.test(str)) {
            return new Append(tokens);
        }
        return undefined;
    }

}