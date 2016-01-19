import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Call extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^CALL /.test(str)
                || /^(\w|-|<|>|->|=>|~)+\( .*\)\s*.$/.test(str)) {
            return new Call(tokens);
        }
        return undefined;
    }

}