import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Continue extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^CONTINUE/.test(str)) {
            return new Continue(tokens);
        }
        return undefined;
    }

}