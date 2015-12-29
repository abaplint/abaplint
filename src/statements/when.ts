import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class When extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^WHEN /.test(str)) {
            return new When(tokens);
        }
        return undefined;
    }

}